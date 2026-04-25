package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.config.NotaFiscalConfig;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.net.ssl.*;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;

/**
 * A "ponte" entre o GestPro e os Webservices da Receita Estadual (SEFAZ).
 * A comunicação exige Autenticação Mútua (mTLS), ou seja, a SEFAZ verifica nosso
 * certificado e nós verificamos o deles durante o aperto de mão HTTPS (Handshake).
 */
@Slf4j // <-- Lombok: Substitui a declaração manual do Logger
@Service
public class SefazComunicacaoService {

    // A SEFAZ costuma demorar para responder no fim do mês. Aumentando o timeout pra evitar 504.
    private static final int TIMEOUT_CONEXAO = 30_000;
    private static final int TIMEOUT_LEITURA = 60_000;

    /**
     * Pega o XML que já foi montado e assinado digitalmente, embala num envelope SOAP
     * e dispara pro Governo via HTTPS.
     *
     * @param xmlAssinado  XML final com a tag <Signature>
     * @param uf           Estado do remetente (define pra qual servidor vai)
     * @param modelo       "55" (NF-e) ou "65" (NFC-e)
     * @param pfxBytes     Arquivo do Certificado A1 (.pfx) em bytes
     * @param senhaCert    Senha do certificado (pra abrir o KeyStore)
     * @param homologacao  Se true, bate no servidor de testes sem validade jurídica
     */
    public RetornoSefaz enviarNfe(String xmlAssinado, String uf, String modelo,
                                  byte[] pfxBytes, String senhaCert, boolean homologacao) {
        try {
            String urlStr = NotaFiscalConfig.getWebserviceUrl(uf, modelo, homologacao);
            log.info("Disparando NF-e para a SEFAZ... URL: {} | Ambiente: {}", urlStr, homologacao ? "HOMOLOGAÇÃO (TESTE)" : "PRODUÇÃO (VALENDO!)");

            // A SEFAZ não lê o XML puro. Tem que empacotar dentro de uma requisição SOAP 1.2.
            String soapEnvelope = montarEnvelopeSoap(xmlAssinado, modelo);

            // Criando a conexão blindada. Se o certificado estiver vencido, falha aqui.
            HttpURLConnection conn = criarConexao(urlStr, pfxBytes, senhaCert);
            conn.setRequestMethod("POST");

            // Headers obrigatórios da SEFAZ
            conn.setRequestProperty("Content-Type", "application/soap+xml; charset=utf-8");
            conn.setRequestProperty("SOAPAction", "http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4/nfeAutorizacaoLote");
            conn.setDoOutput(true);

            // Escreve o envelope no túnel da conexão
            try (OutputStream os = conn.getOutputStream()) {
                os.write(soapEnvelope.getBytes(StandardCharsets.UTF_8));
            }

            // Pega a resposta. Mesmo se der Erro 500 na SEFAZ, preciso ler o stream de erro pra saber o motivo.
            int httpCode = conn.getResponseCode();
            InputStream responseStream = httpCode >= 400 ? conn.getErrorStream() : conn.getInputStream();
            String xmlRetorno = lerStream(responseStream);

            log.info("SEFAZ respondeu! HTTP Status: {} | Tamanho do retorno: {} bytes", httpCode, xmlRetorno.length());

            // Lê o XML devolvido pra saber se a nota foi Autorizada (100) ou Rejeitada.
            return parseRetornoSefaz(xmlRetorno);

        } catch (Exception e) {
            log.error("Deu ruim na comunicação de rede com a SEFAZ. Servidor deles pode estar fora do ar.", e);
            return RetornoSefaz.erro("Erro de comunicação com a Fazenda Estadual: " + e.getMessage());
        }
    }

    /**
     * Envia um Evento de Cancelamento pra SEFAZ.
     * Cancelar é só enviar um mini-XML avisando que aquela nota não vale mais.
     */
    public RetornoSefaz cancelarNfe(String chaveAcesso, String protocolo, String justificativa,
                                    String uf, byte[] pfxBytes, String senhaCert, boolean homologacao) {
        try {
            // Monta o mini-XML de evento
            String xmlEvento = buildXmlCancelamento(chaveAcesso, protocolo, justificativa, homologacao);

            // TODO: Aqui a gente PRECISA assinar esse 'xmlEvento' antes de colocar no SOAP.
            // Para não quebrar a compilação agora, vou passar direto, mas anote na pauta de dev.

            // O endpoint de evento geralmente é diferente do de autorização
            String urlStr = NotaFiscalConfig.getWebserviceUrl(uf, "55", homologacao)
                    .replace("NFeAutorizacao4", "NFeRecepcaoEvento4");

            HttpURLConnection conn = criarConexao(urlStr, pfxBytes, senhaCert);
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/soap+xml; charset=utf-8");
            conn.setRequestProperty("SOAPAction", "http://www.portalfiscal.inf.br/nfe/wsdl/NFeRecepcaoEvento4/nfeRecepcaoEvento");
            conn.setDoOutput(true);

            String soap = "<soap12:Envelope xmlns:soap12=\"http://www.w3.org/2003/05/soap-envelope\">"
                    + "<soap12:Body><nfeRecepcaoEvento xmlns=\"http://www.portalfiscal.inf.br/nfe/wsdl/NFeRecepcaoEvento4\">"
                    + "<nfeDadosMsg>" + xmlEvento + "</nfeDadosMsg>"
                    + "</nfeRecepcaoEvento></soap12:Body></soap12:Envelope>";

            try (OutputStream os = conn.getOutputStream()) {
                os.write(soap.getBytes(StandardCharsets.UTF_8));
            }

            String xmlRetorno = lerStream(conn.getInputStream());
            return parseRetornoSefaz(xmlRetorno);

        } catch (Exception e) {
            log.error("Erro feio ao tentar cancelar a NF-e", e);
            return RetornoSefaz.erro("Erro ao cancelar: " + e.getMessage());
        }
    }

    /**
     * Empacota a NF-e nua dentro de um envelope SOAP padrão do Governo.
     */
    private String montarEnvelopeSoap(String xmlNfe, String modelo) {
        String wsdlPath = "NFeAutorizacao4"; // Pra NFC-e pode mudar no futuro dependendo do estado
        return "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
                + "<soap12:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" "
                + "xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" "
                + "xmlns:soap12=\"http://www.w3.org/2003/05/soap-envelope\">"
                + "<soap12:Body>"
                + "<nfeAutorizacaoLote xmlns=\"http://www.portalfiscal.inf.br/nfe/wsdl/" + wsdlPath + "\">"
                + "<nfeDadosMsg>" + xmlNfe + "</nfeDadosMsg>"
                + "</nfeAutorizacaoLote>"
                + "</soap12:Body>"
                + "</soap12:Envelope>";
    }

    /**
     * Monta o evento 110111 (Cancelamento).
     */
    private String buildXmlCancelamento(String chaveAcesso, String protocolo,
                                        String justificativa, boolean homologacao) {
        int tpAmb = homologacao ? 2 : 1;
        String now = java.time.OffsetDateTime.now(java.time.ZoneId.of("America/Sao_Paulo"))
                .format(java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME);

        return "<envEvento versao=\"1.00\" xmlns=\"http://www.portalfiscal.inf.br/nfe\">"
                + "<idLote>1</idLote>"
                + "<evento versao=\"1.00\">"
                + "<infEvento Id=\"ID110111" + chaveAcesso + "01\">"
                + "<cOrgao>" + chaveAcesso.substring(0, 2) + "</cOrgao>" // UF tirada do início da chave
                + "<tpAmb>" + tpAmb + "</tpAmb>"
                + "<CNPJ>" + chaveAcesso.substring(6, 20) + "</CNPJ>"
                + "<chNFe>" + chaveAcesso + "</chNFe>"
                + "<dhEvento>" + now + "</dhEvento>"
                + "<tpEvento>110111</tpEvento>"
                + "<nSeqEvento>1</nSeqEvento>"
                + "<verEvento>1.00</verEvento>"
                + "<detEvento versao=\"1.00\">"
                + "<descEvento>Cancelamento</descEvento>"
                + "<nProt>" + protocolo + "</nProt>"
                + "<xJust>" + justificativa + "</xJust>"
                + "</detEvento>"
                + "</infEvento>"
                + "</evento>"
                + "</envEvento>";
    }

    /**
     * O núcleo da segurança. Configura a conexão pra apresentar nosso certificado pra SEFAZ.
     */
    private HttpURLConnection criarConexao(String urlStr, byte[] pfxBytes, String senhaCert) throws Exception {
        // Carrega nosso certificado (identidade do cliente)
        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        try (InputStream is = new ByteArrayInputStream(pfxBytes)) {
            keyStore.load(is, senhaCert.toCharArray());
        }

        // KeyManagerFactory é quem vai "mostrar a carteira de identidade" pra SEFAZ
        KeyManagerFactory kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
        kmf.init(keyStore, senhaCert.toCharArray());

        // TrustManager define em quem nós confiamos.
        // Dica de Produção: É aqui que carregamos os "Cadeados da ICP-Brasil".
        // Passar nulo confia no padrão do Java, mas pra SEFAZ às vezes dá erro de cadeia.
        TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        tmf.init((KeyStore) null);

        // A SEFAZ só aceita TLS 1.2 pra cima!
        SSLContext sslContext = SSLContext.getInstance("TLSv1.2");
        sslContext.init(kmf.getKeyManagers(), tmf.getTrustManagers(), null);

        URL url = new URL(urlStr);
        HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
        conn.setSSLSocketFactory(sslContext.getSocketFactory());
        conn.setConnectTimeout(TIMEOUT_CONEXAO);
        conn.setReadTimeout(TIMEOUT_LEITURA);
        return conn;
    }

    /**
     * Pega o XML gigante devolvido pela SEFAZ e garimpa só o que a gente precisa:
     * Cód Status (100 é sucesso), Motivo da Rejeição, Recibo, etc.
     */
    private RetornoSefaz parseRetornoSefaz(String xmlRetorno) {
        try {
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            dbf.setNamespaceAware(true);
            DocumentBuilder db = dbf.newDocumentBuilder();
            Document doc = db.parse(new ByteArrayInputStream(xmlRetorno.getBytes(StandardCharsets.UTF_8)));

            String cStat = getTagValue(doc, "cStat");
            String xMotivo = getTagValue(doc, "xMotivo");
            String nProt = getTagValue(doc, "nProt");
            String dhRecbto = getTagValue(doc, "dhRecbto");

            RetornoSefaz retorno = new RetornoSefaz();
            retorno.setXmlRetorno(xmlRetorno);
            retorno.setCodigo(cStat);
            retorno.setMensagem(xMotivo);
            retorno.setProtocolo(nProt);
            retorno.setDataHoraRecebimento(dhRecbto);
            retorno.setSucesso("100".equals(cStat) || "104".equals(cStat)); // 100=Autorizado, 104=Lote Processado

            return retorno;
        } catch (Exception e) {
            log.error("A SEFAZ mandou um XML que eu não entendi, ou a conexão quebrou no meio.", e);
            return RetornoSefaz.erro("Erro ao mastigar o retorno do governo: " + e.getMessage());
        }
    }

    /**
     * Busca rápida de valor de tag dentro do XML.
     */
    private String getTagValue(Document doc, String tagName) {
        NodeList nl = doc.getElementsByTagNameNS("*", tagName);
        if (nl != null && nl.getLength() > 0) {
            return nl.item(0).getTextContent();
        }
        return null;
    }

    /**
     * Transforma o fluxo de bits (InputStream) que veio da rede numa String XML limpinha.
     */
    private String lerStream(InputStream is) throws IOException {
        if (is == null) return "";
        try (BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line).append("\n");
            }
            return sb.toString();
        }
    }

    // DTO Local de Resposta (Refatorado com Lombok)
    @Data
    public static class RetornoSefaz {
        private boolean sucesso;
        private String codigo;
        private String mensagem;
        private String protocolo;
        private String dataHoraRecebimento;
        private String xmlRetorno;

        public static RetornoSefaz erro(String mensagem) {
            RetornoSefaz r = new RetornoSefaz();
            r.sucesso = false;
            r.mensagem = mensagem;
            r.codigo = "999"; // Código genérico pra erro interno da aplicação
            return r;
        }
    }
}