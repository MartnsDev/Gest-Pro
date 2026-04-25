package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.RegimeTributario;
import br.com.gestpro.nota.dto.EmpresaInfo;
import br.com.gestpro.nota.model.ItemNotaFiscal;
import br.com.gestpro.nota.model.NotaFiscal;
import br.com.gestpro.nota.TipoNota;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Montador do XML da NF-e / NFC-e conforme leiaute 4.0 da SEFAZ.
 * Referência: NT 2019.001 v1.20
 */
@Slf4j // <-- Lombok: Agora eu posso usar log.info() para debugar o XML
@Service
public class XmlGeneratorService {

    // Formatações de data exatas que a SEFAZ exige, senão dá erro de schema
    private static final DateTimeFormatter DT_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");
    private static final DateTimeFormatter DT_SIMPLES = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public String gerarXmlNfe(NotaFiscal nota, EmpresaInfo empresa, List<ItemNotaFiscal> itens, String chaveAcesso) {

        // Flags que vão controlar os IFs lá embaixo (NFC-e e Simples Nacional mudam muito a estrutura do XML)
        boolean isNfce = TipoNota.NFCE.equals(nota.getTipo());
        boolean isSimplesNacional = RegimeTributario.SIMPLES_NACIONAL.equals(empresa.getRegimeTributario())
                || RegimeTributario.SIMPLES_NACIONAL_EXCESSO.equals(empresa.getRegimeTributario());

        StringBuilder sb = new StringBuilder();

        // Cabeçalho padrão do XML e namespace da SEFAZ
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        sb.append("<nfeProc versao=\"4.00\" xmlns=\"http://www.portalfiscal.inf.br/nfe\">");
        sb.append("<NFe xmlns=\"http://www.portalfiscal.inf.br/nfe\">");
        sb.append("<infNFe versao=\"4.00\" Id=\"NFe").append(chaveAcesso).append("\">");

        // =================================================================
        // 1. IDENTIFICAÇÃO DA NOTA (<ide>)
        // =================================================================
        sb.append("<ide>");
        sb.append("<cUF>").append(GerarChaveAcesso.getCodigoUf(empresa.getUf())).append("</cUF>");
        sb.append("<cNF>").append(chaveAcesso, 35, 43).append("</cNF>");
        sb.append("<natOp>").append(xmlEscape(nota.getNaturezaOperacao())).append("</natOp>");
        sb.append("<mod>").append(nota.getTipo().getModelo()).append("</mod>");
        sb.append("<serie>").append(nota.getSerie() != null ? nota.getSerie() : "1").append("</serie>");
        sb.append("<nNF>").append(nota.getNumeroNota()).append("</nNF>");
        sb.append("<dhEmi>").append(nota.getDataEmissao().atZoneSameInstant(java.time.ZoneId.of("America/Sao_Paulo")).format(DT_FORMAT)).append("</dhEmi>");

        // Só manda data de saída se não for cupom de balcão (NFC-e)
        if (!isNfce) {
            sb.append("<dhSaiEnt>").append(nota.getDataEmissao().atZoneSameInstant(java.time.ZoneId.of("America/Sao_Paulo")).format(DT_FORMAT)).append("</dhSaiEnt>");
        }

        sb.append("<tpNF>1</tpNF>"); // 1 = Saída
        sb.append("<idDest>1</idDest>"); // 1 = Operação interna (dentro do estado)
        sb.append("<cMunFG>").append(empresa.getCodigoIbge()).append("</cMunFG>");
        sb.append("<tpImp>").append(isNfce ? "4" : "1").append("</tpImp>"); // 4 = NFC-e (Cupom), 1 = DANFE normal (A4)
        sb.append("<tpEmis>").append(nota.getEmContingencia() != null && nota.getEmContingencia() ? "9" : "1").append("</tpEmis>");
        sb.append("<cDV>").append(chaveAcesso.charAt(43)).append("</cDV>");
        sb.append("<tpAmb>2</tpAmb>"); // IMPORTANTE: 2 = Homologação. Trocar pra 1 quando for pra Produção!
        sb.append("<finNFe>1</finNFe>"); // 1 = Nota Normal
        sb.append("<indFinal>").append(isNfce ? "1" : "0").append("</indFinal>"); // Se for NFC-e, obrigatoriamente é consumidor final (1)
        sb.append("<indPres>").append(isNfce ? "1" : "9").append("</indPres>"); // 1 = Presencial, 9 = Não presencial / Outros
        sb.append("<procEmi>0</procEmi>"); // 0 = Emitido pelo aplicativo próprio (o meu ERP)
        sb.append("<verProc>GestPro-1.0</verProc>"); // A assinatura do meu sistema no XML!
        sb.append("</ide>");

        // =================================================================
        // 2. DADOS DO EMITENTE (<emit>) - A minha empresa
        // =================================================================
        sb.append("<emit>");
        sb.append("<CNPJ>").append(empresa.getCnpj().replaceAll("[^0-9]", "")).append("</CNPJ>");
        sb.append("<xNome>").append(xmlEscape(empresa.getRazaoSocial())).append("</xNome>");
        if (empresa.getNomeFantasia() != null && !empresa.getNomeFantasia().isBlank()) {
            sb.append("<xFant>").append(xmlEscape(empresa.getNomeFantasia())).append("</xFant>");
        }

        sb.append("<enderEmit>");
        sb.append("<xLgr>").append(xmlEscape(empresa.getLogradouro())).append("</xLgr>");
        sb.append("<nro>").append(xmlEscape(empresa.getNumero())).append("</nro>");
        if (empresa.getComplemento() != null && !empresa.getComplemento().isBlank()) {
            sb.append("<xCpl>").append(xmlEscape(empresa.getComplemento())).append("</xCpl>");
        }
        sb.append("<xBairro>").append(xmlEscape(empresa.getBairro())).append("</xBairro>");
        sb.append("<cMun>").append(empresa.getCodigoIbge()).append("</cMun>");
        sb.append("<xMun>").append(xmlEscape(empresa.getMunicipio())).append("</xMun>");
        sb.append("<UF>").append(empresa.getUf()).append("</UF>");
        sb.append("<CEP>").append(empresa.getCep().replaceAll("[^0-9]", "")).append("</CEP>");
        sb.append("<cPais>1058</cPais><xPais>Brasil</xPais>");
        if (empresa.getTelefone() != null) {
            sb.append("<fone>").append(empresa.getTelefone().replaceAll("[^0-9]", "")).append("</fone>");
        }
        sb.append("</enderEmit>");

        sb.append("<IE>").append(empresa.getInscricaoEstadual() != null ? empresa.getInscricaoEstadual().replaceAll("[^0-9]", "") : "ISENTO").append("</IE>");
        if (empresa.getInscricaoMunicipal() != null) {
            sb.append("<IM>").append(empresa.getInscricaoMunicipal()).append("</IM>");
        }
        sb.append("<CRT>").append(empresa.getRegimeTributario().getCodigo()).append("</CRT>");
        sb.append("</emit>");

        // =================================================================
        // 3. DADOS DO DESTINATÁRIO (<dest>) - O cliente
        // =================================================================
        if (nota.getClienteNome() != null && !nota.getClienteNome().isBlank()) {
            sb.append("<dest>");
            String cpfCnpj = nota.getClienteCpfCnpj() != null ? nota.getClienteCpfCnpj().replaceAll("[^0-9]", "") : "";
            if (cpfCnpj.length() == 14) {
                sb.append("<CNPJ>").append(cpfCnpj).append("</CNPJ>");
            } else if (cpfCnpj.length() == 11) {
                sb.append("<CPF>").append(cpfCnpj).append("</CPF>");
            }
            sb.append("<xNome>").append(xmlEscape(nota.getClienteNome())).append("</xNome>");
            sb.append("<indIEDest>9</indIEDest>"); // 9 = Não Contribuinte (pra facilitar por enquanto)
            sb.append("</dest>");
        }

        // =================================================================
        // 4. ITENS DA NOTA (<det>) - Produtos e Tributos
        // =================================================================
        int numItem = 1;
        for (ItemNotaFiscal item : itens) {
            sb.append("<det nItem=\"").append(numItem++).append("\">");

            // Dados básicos do produto
            sb.append("<prod>");
            sb.append("<cProd>").append(xmlEscape(item.getCodigoProduto() != null ? item.getCodigoProduto() : String.valueOf(item.getProdutoId()))).append("</cProd>");
            sb.append("<cEAN>SEM GTIN</cEAN>"); // Ignorando código de barras por enquanto pra não travar a nota
            sb.append("<xProd>").append(xmlEscape(item.getDescricao())).append("</xProd>");
            sb.append("<NCM>").append(item.getNcm()).append("</NCM>");
            sb.append("<CFOP>").append(item.getCfop()).append("</CFOP>");
            sb.append("<uCom>").append(item.getUnidade() != null ? item.getUnidade() : "UN").append("</uCom>");
            sb.append("<qCom>").append(fmt(item.getQuantidade(), 4)).append("</qCom>"); // SEFAZ exige 4 casas na quantidade
            sb.append("<vUnCom>").append(fmt(item.getValorUnitario(), 4)).append("</vUnCom>"); // 4 casas no unitário
            sb.append("<vProd>").append(fmt(item.getValorBruto(), 2)).append("</vProd>"); // 2 casas no total
            sb.append("<cEANTrib>SEM GTIN</cEANTrib>");
            sb.append("<uTrib>").append(item.getUnidade() != null ? item.getUnidade() : "UN").append("</uTrib>");
            sb.append("<qTrib>").append(fmt(item.getQuantidade(), 4)).append("</qTrib>");
            sb.append("<vUnTrib>").append(fmt(item.getValorUnitario(), 4)).append("</vUnTrib>");

            if (item.getValorDesconto() != null && item.getValorDesconto().compareTo(BigDecimal.ZERO) > 0) {
                sb.append("<vDesc>").append(fmt(item.getValorDesconto(), 2)).append("</vDesc>");
            }
            sb.append("<indTot>1</indTot>"); // Compoe o valor total da nota
            sb.append("</prod>");

            // -------------------------------------------------------------
            // BLOCO DE IMPOSTOS DO ITEM (O terror da SEFAZ)
            // -------------------------------------------------------------
            sb.append("<imposto>");

            // ICMS
            sb.append("<ICMS>");
            if (isSimplesNacional) {
                // Empresa do Simples Nacional usa CSOSN
                String csosn = item.getCsosn() != null ? item.getCsosn() : "400";
                sb.append("<ICMSSN").append(csosn).append(">");
                sb.append("<orig>0</orig>"); // 0 = Nacional
                sb.append("<CSOSN>").append(csosn).append("</CSOSN>");
                if ("500".equals(csosn)) { // Retido por Substituição Tributária
                    sb.append("<vBCSTRet>0.00</vBCSTRet>");
                    sb.append("<pST>0.00</pST>");
                    sb.append("<vICMSSTRet>0.00</vICMSSTRet>");
                }
                sb.append("</ICMSSN").append(csosn).append(">");
            } else {
                // Lucro Presumido/Real usa CST
                String cst = item.getCstIcms() != null ? item.getCstIcms() : "00";
                sb.append("<ICMS").append(cst).append(">");
                sb.append("<orig>0</orig>");
                sb.append("<CST>").append(cst).append("</CST>");

                if ("00".equals(cst) || "10".equals(cst) || "20".equals(cst)) {
                    BigDecimal bcIcms = item.getIcmsBaseCalculo() != null ? item.getIcmsBaseCalculo() : item.getValorTotal();
                    BigDecimal aliq = item.getIcmsAliquota() != null ? item.getIcmsAliquota() : BigDecimal.ZERO;
                    BigDecimal vIcms = bcIcms.multiply(aliq).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                    sb.append("<modBC>3</modBC>"); // 3 = Valor da Operação
                    sb.append("<vBC>").append(fmt(bcIcms, 2)).append("</vBC>");
                    sb.append("<pICMS>").append(fmt(aliq, 2)).append("</pICMS>");
                    sb.append("<vICMS>").append(fmt(vIcms, 2)).append("</vICMS>");
                }
                sb.append("</ICMS").append(cst).append(">");
            }
            sb.append("</ICMS>");

            // PIS
            sb.append("<PIS>");
            String cstPis = item.getCstPis() != null ? item.getCstPis() : (isSimplesNacional ? "07" : "01");
            if ("07".equals(cstPis) || "08".equals(cstPis) || "09".equals(cstPis)) { // Isento/Não tributado
                sb.append("<PISNT><CST>").append(cstPis).append("</CST></PISNT>");
            } else {
                BigDecimal bcPis = item.getPisBaseCalculo() != null ? item.getPisBaseCalculo() : item.getValorTotal();
                BigDecimal aliqPis = item.getPisAliquota() != null ? item.getPisAliquota() : new BigDecimal("0.65");
                BigDecimal vPis = bcPis.multiply(aliqPis).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                sb.append("<PISAliq>");
                sb.append("<CST>").append(cstPis).append("</CST>");
                sb.append("<vBC>").append(fmt(bcPis, 2)).append("</vBC>");
                sb.append("<pPIS>").append(fmt(aliqPis, 4)).append("</pPIS>");
                sb.append("<vPIS>").append(fmt(vPis, 2)).append("</vPIS>");
                sb.append("</PISAliq>");
            }
            sb.append("</PIS>");

            // COFINS
            sb.append("<COFINS>");
            String cstCofins = item.getCstCofins() != null ? item.getCstCofins() : (isSimplesNacional ? "07" : "01");
            if ("07".equals(cstCofins) || "08".equals(cstCofins) || "09".equals(cstCofins)) { // Isento/Não tributado
                sb.append("<COFINSNT><CST>").append(cstCofins).append("</CST></COFINSNT>");
            } else {
                BigDecimal bcCofins = item.getCofinsBaseCalculo() != null ? item.getCofinsBaseCalculo() : item.getValorTotal();
                BigDecimal aliqCofins = item.getCofinsAliquota() != null ? item.getCofinsAliquota() : new BigDecimal("3.00");
                BigDecimal vCofins = bcCofins.multiply(aliqCofins).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                sb.append("<COFINSAliq>");
                sb.append("<CST>").append(cstCofins).append("</CST>");
                sb.append("<vBC>").append(fmt(bcCofins, 2)).append("</vBC>");
                sb.append("<pCOFINS>").append(fmt(aliqCofins, 4)).append("</pCOFINS>");
                sb.append("<vCOFINS>").append(fmt(vCofins, 2)).append("</vCOFINS>");
                sb.append("</COFINSAliq>");
            }
            sb.append("</COFINS>");

            sb.append("</imposto>");
            sb.append("</det>");
        }

        // =================================================================
        // 5. TOTALIZADORES (<total>)
        // =================================================================
        sb.append("<total><ICMSTot>");
        sb.append("<vBC>0.00</vBC>");
        sb.append("<vICMS>").append(fmt(nota.getValorIcms(), 2)).append("</vICMS>");
        sb.append("<vICMSDeson>0.00</vICMSDeson>");
        sb.append("<vFCP>0.00</vFCP>");
        sb.append("<vBCST>0.00</vBCST>");
        sb.append("<vST>0.00</vST>");
        sb.append("<vFCPST>0.00</vFCPST>");
        sb.append("<vFCPSTRet>0.00</vFCPSTRet>");
        sb.append("<vProd>").append(fmt(nota.getValorProdutos(), 2)).append("</vProd>");
        sb.append("<vFrete>").append(fmt(nota.getValorFrete(), 2)).append("</vFrete>");
        sb.append("<vSeg>0.00</vSeg>");
        sb.append("<vDesc>").append(fmt(nota.getValorDesconto(), 2)).append("</vDesc>");
        sb.append("<vII>0.00</vII>"); // Imposto de Importação (zero pra não dar dor de cabeça agora)
        sb.append("<vIPI>0.00</vIPI>");
        sb.append("<vIPIDevol>0.00</vIPIDevol>");
        sb.append("<vPIS>").append(fmt(nota.getValorPis(), 2)).append("</vPIS>");
        sb.append("<vCOFINS>").append(fmt(nota.getValorCofins(), 2)).append("</vCOFINS>");
        sb.append("<vOutro>0.00</vOutro>");
        sb.append("<vNF>").append(fmt(nota.getValorTotal(), 2)).append("</vNF>");
        sb.append("</ICMSTot></total>");

        // =================================================================
        // 6. FRETE E PAGAMENTO
        // =================================================================
        sb.append("<transp><modFrete>9</modFrete></transp>"); // 9 = Sem frete / Frete por conta do Remetente

        sb.append("<pag>");
        sb.append("<detPag>");
        // Se a forma de pagamento vier nula, jogo '01' (Dinheiro) como fallback pra não rejeitar
        sb.append("<tPag>").append(nota.getFormaPagamento() != null ? nota.getFormaPagamento().getCodigo() : "01").append("</tPag>");
        sb.append("<vPag>").append(fmt(nota.getValorTotal(), 2)).append("</vPag>");
        sb.append("</detPag>");
        sb.append("</pag>");

        // =================================================================
        // 7. INFORMAÇÕES ADICIONAIS (Aquela mensagem no rodapé da nota)
        // =================================================================
        if (nota.getInformacoesAdicionais() != null && !nota.getInformacoesAdicionais().isBlank()) {
            sb.append("<infAdic><infCpl>").append(xmlEscape(nota.getInformacoesAdicionais())).append("</infCpl></infAdic>");
        }

        // Fechando as tags principais
        sb.append("</infNFe>");
        sb.append("</NFe>");
        sb.append("</nfeProc>");

        String xmlFinal = sb.toString();
        log.info("XML Gerado com sucesso para a Chave: {}", chaveAcesso); // Se der BO, eu vejo isso no log

        return xmlFinal;
    }

    /**
     * Helper pra não ter que ficar escrevendo setScale(x, HALF_UP) toda hora.
     * A SEFAZ é extremamente chata com a quantidade de casas decimais.
     */
    private String fmt(BigDecimal val, int scale) {
        if (val == null) return "0." + "0".repeat(scale);
        return val.setScale(scale, RoundingMode.HALF_UP).toPlainString();
    }

    /**
     * Limpa caracteres especiais pra não quebrar a estrutura do XML.
     * Se o cliente digitar "Feijão & Arroz", o XML morre se não trocar o "&" por "&amp;".
     */
    private String xmlEscape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&apos;");
    }
}