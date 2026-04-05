package br.com.gestpro.nota.service;

import br.com.gestpro.nota.NotaFiscalStatus;
import br.com.gestpro.nota.TipoNota;
import br.com.gestpro.nota.dto.NotaFiscalDTOs.*;
import br.com.gestpro.nota.model.*;
import br.com.gestpro.nota.repository.ItemNotaFiscalRepository;
import br.com.gestpro.nota.repository.NotaFiscalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class NotaFiscalService {

    private final NotaFiscalRepository notaRepo;
    private final ItemNotaFiscalRepository itemRepo;
    private final WebClient webClient;

    // ─── CRIAR RASCUNHO ──────────────────────────────────
    @Transactional
    public Map<String, Object> criar(CriarNotaFiscalDTO dto, String usuarioId) {
        EmpresaInfo empresa = buscarDadosEmpresa(dto.getEmpresaId());
        String numero = gerarNumeroNota(dto.getEmpresaId());

        List<ItemCalc> itensCalc = dto.getItens().stream().map(item -> {
            BigDecimal descPct = item.getDesconto() != null ? item.getDesconto() : BigDecimal.ZERO;
            BigDecimal base    = item.getQuantidade().multiply(item.getValorUnitario());
            BigDecimal descVal = base.multiply(descPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal total   = base.subtract(descVal).setScale(2, RoundingMode.HALF_UP);
            return new ItemCalc(item, total);
        }).toList();

        BigDecimal subtotal     = itensCalc.stream().map(i -> i.total).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal descontoPct  = dto.getDesconto()  != null ? dto.getDesconto()  : BigDecimal.ZERO;
        BigDecimal valorDesc    = subtotal.multiply(descontoPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal baseCalculo  = subtotal.subtract(valorDesc);
        BigDecimal impostosPct  = dto.getImpostos()  != null ? dto.getImpostos()  : BigDecimal.ZERO;
        BigDecimal valorImp     = baseCalculo.multiply(impostosPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal total        = baseCalculo.add(valorImp).setScale(2, RoundingMode.HALF_UP);

        NotaFiscal nota = NotaFiscal.builder()
                .numero(numero)
                .tipo(dto.getTipo())
                .status(NotaFiscalStatus.RASCUNHO)
                .empresaId(dto.getEmpresaId())
                .empresaNome(empresa.nome())
                .empresaCnpj(empresa.cnpj())
                .empresaInscricaoEstadual(empresa.inscricaoEstadual())
                .empresaEndereco(empresa.endereco())
                .empresaCidade(empresa.cidade())
                .empresaEstado(empresa.estado())
                .empresaCep(empresa.cep())
                .empresaTelefone(empresa.telefone())
                .empresaEmail(empresa.email())
                .clienteId(dto.getClienteId())
                .clienteNome(dto.getClienteNome())
                .clienteCpfCnpj(dto.getClienteCpfCnpj())
                .clienteEmail(dto.getClienteEmail())
                .clienteTelefone(dto.getClienteTelefone())
                .clienteEndereco(dto.getClienteEndereco())
                .clienteCidade(dto.getClienteCidade())
                .clienteEstado(dto.getClienteEstado())
                .clienteCep(dto.getClienteCep())
                .subtotal(subtotal)
                .desconto(descontoPct)
                .valorDesconto(valorDesc)
                .impostos(impostosPct)
                .valorImpostos(valorImp)
                .total(total)
                .formaPagamento(dto.getFormaPagamento())
                .vendaId(dto.getVendaId())
                .observacoes(dto.getObservacoes())
                .build();

        NotaFiscal salva = notaRepo.save(nota);

        itensCalc.forEach(ic -> {
            CriarItemNotaDTO i = ic.dto();
            itemRepo.save(ItemNotaFiscal.builder()
                    .notaFiscalId(salva.getId())
                    .produtoId(i.getProdutoId())
                    .descricao(i.getDescricao())
                    .codigo(i.getCodigo())
                    .ncm(i.getNcm())
                    .cfop(i.getCfop() != null ? i.getCfop() : "5102")
                    .unidade(i.getUnidade() != null ? i.getUnidade() : "UN")
                    .quantidade(i.getQuantidade())
                    .valorUnitario(i.getValorUnitario())
                    .desconto(i.getDesconto()  != null ? i.getDesconto()  : BigDecimal.ZERO)
                    .icms(i.getIcms()          != null ? i.getIcms()      : BigDecimal.ZERO)
                    .pis(i.getPis()            != null ? i.getPis()       : BigDecimal.ZERO)
                    .cofins(i.getCofins()      != null ? i.getCofins()    : BigDecimal.ZERO)
                    .valorTotal(ic.total())
                    .build());
        });

        return buscarPorId(salva.getId());
    }

    // ─── EMITIR ───────────────────────────────────────────
    @Transactional
    public Map<String, Object> emitir(UUID id) {
        NotaFiscal nota = notaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nota não encontrada."));

        if (nota.getStatus() != NotaFiscalStatus.RASCUNHO)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas rascunhos podem ser emitidos.");

        nota.setStatus(NotaFiscalStatus.EMITIDA);
        nota.setChaveAcesso(gerarChaveAcesso(nota));
        nota.setProtocolo(gerarProtocolo());
        nota.setDataEmissao(LocalDateTime.now());
        notaRepo.save(nota);

        return buscarPorId(id);
    }

    // ─── CANCELAR ─────────────────────────────────────────
    @Transactional
    public Map<String, Object> cancelar(CancelarNotaDTO dto) {
        NotaFiscal nota = notaRepo.findById(dto.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nota não encontrada."));

        if (nota.getStatus() != NotaFiscalStatus.EMITIDA)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas notas emitidas podem ser canceladas.");

        long diffHoras = java.time.Duration.between(nota.getDataEmissao(), LocalDateTime.now()).toHours();
        if (diffHoras > 24)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prazo de cancelamento expirado (máximo 24h).");

        nota.setStatus(NotaFiscalStatus.CANCELADA);
        nota.setDataCancelamento(LocalDateTime.now());
        nota.setMotivoCancelamento(dto.getMotivoCancelamento());
        notaRepo.save(nota);

        return buscarPorId(dto.getId());
    }

    // ─── BUSCAR POR ID ────────────────────────────────────
    public Map<String, Object> buscarPorId(UUID id) {
        NotaFiscal nota = notaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nota " + id + " não encontrada."));
        List<ItemNotaFiscal> itens = itemRepo.findByNotaFiscalId(id);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("nota", nota);
        result.put("itens", itens);
        return result;
    }

    // ─── LISTAR ───────────────────────────────────────────
    public Map<String, Object> listar(FilterNotaFiscalDTO filter) {
        int page  = filter.getPage()  != null ? filter.getPage()  - 1 : 0;
        int limit = filter.getLimit() != null ? filter.getLimit()     : 20;

        LocalDateTime inicio = null, fim = null;
        if (filter.getDataInicio() != null) inicio = LocalDateTime.parse(filter.getDataInicio() + "T00:00:00");
        if (filter.getDataFim()    != null) fim    = LocalDateTime.parse(filter.getDataFim()    + "T23:59:59");

        Page<NotaFiscal> pageResult = notaRepo.findWithFilters(
                filter.getEmpresaId(),
                filter.getStatus(),
                filter.getTipo(),
                filter.getClienteNome(),
                inicio, fim,
                PageRequest.of(page, limit, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("data",  pageResult.getContent());
        result.put("total", pageResult.getTotalElements());
        result.put("page",  page + 1);
        result.put("pages", pageResult.getTotalPages());
        return result;
    }

    // ─── ESTATÍSTICAS ─────────────────────────────────────
    public EstatisticasDTO estatisticas(String empresaId) {
        LocalDateTime inicioMes = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime fimMes    = inicioMes.plusMonths(1).minusSeconds(1);

        EstatisticasDTO dto = new EstatisticasDTO();
        dto.setTotal(notaRepo.countByEmpresaId(empresaId));
        dto.setEmitidas(notaRepo.countByEmpresaIdAndStatus(empresaId, NotaFiscalStatus.EMITIDA));
        dto.setRascunhos(notaRepo.countByEmpresaIdAndStatus(empresaId, NotaFiscalStatus.RASCUNHO));
        dto.setCanceladas(notaRepo.countByEmpresaIdAndStatus(empresaId, NotaFiscalStatus.CANCELADA));
        BigDecimal valorMes = notaRepo.sumTotalEmitidoNoPeriodo(empresaId, inicioMes, fimMes);
        dto.setValorTotalMes(valorMes != null ? valorMes : BigDecimal.ZERO);
        return dto;
    }

    // ─── DANFE ────────────────────────────────────────────
    public Map<String, Object> gerarDadosDanfe(UUID id) {
        Map<String, Object> payload = buscarPorId(id);
        NotaFiscal nf = (NotaFiscal) payload.get("nota");
        if (nf.getStatus() != NotaFiscalStatus.EMITIDA)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas notas emitidas geram DANFE.");
        payload.put("geradoEm", LocalDateTime.now().toString());
        payload.put("versao", "1.0.0");
        return payload;
    }

    // ─── CEP ──────────────────────────────────────────────
    public Map<String, Object> consultarCep(String cep) {
        String limpo = cep.replaceAll("\\D", "");
        if (limpo.length() != 8)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CEP inválido.");
        try {
            Map<?, ?> data = webClient.get()
                    .uri("https://viacep.com.br/ws/" + limpo + "/json/")
                    .retrieve().bodyToMono(Map.class).block();

            if (data == null || Boolean.TRUE.equals(data.get("erro")))
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CEP não encontrado.");

            Map<String, Object> r = new LinkedHashMap<>();
            r.put("cep",        data.get("cep"));
            r.put("logradouro", data.get("logradouro"));
            r.put("complemento",data.get("complemento"));
            r.put("bairro",     data.get("bairro"));
            r.put("cidade",     data.get("localidade"));
            r.put("estado",     data.get("uf"));
            r.put("ibge",       data.get("ibge"));
            return r;
        } catch (ResponseStatusException e) { throw e; }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao consultar CEP."); }
    }

    // ─── CNPJ ─────────────────────────────────────────────
    public Map<String, Object> consultarCnpj(String cnpj) {
        String limpo = cnpj.replaceAll("\\D", "");
        if (limpo.length() != 14)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CNPJ inválido.");
        try {
            Map<?, ?> data = webClient.get()
                    .uri("https://receitaws.com.br/v1/cnpj/" + limpo)
                    .retrieve().bodyToMono(Map.class).block();

            if (data == null || "ERROR".equals(data.get("status")))
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        data != null ? (String) data.get("message") : "Erro desconhecido");

            Map<String, Object> r = new LinkedHashMap<>();
            r.put("cnpj",       data.get("cnpj"));
            r.put("nome",       data.get("nome"));
            r.put("fantasia",   data.get("fantasia"));
            r.put("situacao",   data.get("situacao"));
            r.put("logradouro", data.get("logradouro"));
            r.put("numero",     data.get("numero"));
            r.put("complemento",data.get("complemento"));
            r.put("bairro",     data.get("bairro"));
            r.put("municipio",  data.get("municipio"));
            r.put("uf",         data.get("uf"));
            r.put("cep",        data.get("cep"));
            r.put("telefone",   data.get("telefone"));
            r.put("email",      data.get("email"));
            if (data.get("atividade_principal") instanceof List<?> atv && !atv.isEmpty())
                if (atv.get(0) instanceof Map<?,?> a) r.put("atividadePrincipal", a.get("text"));
            return r;
        } catch (ResponseStatusException e) { throw e; }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao consultar CNPJ."); }
    }

    // ─── MUNICÍPIOS ───────────────────────────────────────
    public List<Map<String, Object>> buscarMunicipios(String uf) {
        try {
            List<?> data = webClient.get()
                    .uri("https://servicodados.ibge.gov.br/api/v1/localidades/estados/" + uf + "/municipios")
                    .retrieve().bodyToMono(List.class).block();
            if (data == null) return List.of();
            return data.stream()
                    .filter(m -> m instanceof Map)
                    .map(m -> { Map<?,?> mu = (Map<?,?>) m;
                        Map<String, Object> item = new LinkedHashMap<>();
                        item.put("id", mu.get("id")); item.put("nome", mu.get("nome"));
                        return item; })
                    .toList();
        } catch (Exception e) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao buscar municípios."); }
    }

    // ─── HELPERS ──────────────────────────────────────────
    private String gerarNumeroNota(String empresaId) {
        int ano    = LocalDateTime.now().getYear();
        long count = notaRepo.countByEmpresaId(empresaId);
        return "NF-" + ano + "-" + String.format("%06d", count + 1);
    }

    private String gerarChaveAcesso(NotaFiscal nota) {
        String cUF   = "35";
        String aamm  = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMM"));
        String cnpj  = nota.getEmpresaCnpj() != null
                ? String.format("%-14s", nota.getEmpresaCnpj().replaceAll("\\D", "")).replace(' ', '0')
                : "00000000000000";
        String mod   = nota.getTipo() == TipoNota.NFCE ? "65" : "55";
        String serie = "001";
        String[] parts = nota.getNumero().split("-");
        String nNF   = String.format("%09d", parts.length > 2 ? Integer.parseInt(parts[2]) : 1);
        String cNF   = String.format("%08d", new Random().nextInt(99_999_999));
        String c43   = cUF + aamm + cnpj + mod + serie + nNF + "1" + cNF;
        return c43 + calcularDVChave(c43);
    }

    private String calcularDVChave(String chave43) {
        int[] pesos = {2, 3, 4, 5, 6, 7, 8, 9};
        int soma = 0, idx = 0;
        for (int i = chave43.length() - 1; i >= 0; i--)
            soma += Character.getNumericValue(chave43.charAt(i)) * pesos[idx++ % 8];
        int resto = soma % 11;
        return resto < 2 ? "0" : String.valueOf(11 - resto);
    }

    private String gerarProtocolo() {
        String ts = String.valueOf(System.currentTimeMillis());
        return "1" + (ts.length() >= 14 ? ts.substring(ts.length() - 14) : String.format("%014d", Long.parseLong(ts)));
    }

    private EmpresaInfo buscarDadosEmpresa(String empresaId) {
        // TODO: injete seu EmpresaRepository e busque pelo empresaId
        return new EmpresaInfo("GestPro Empresa", "", "", "", "", "", "", "", "");
    }

    private record ItemCalc(CriarItemNotaDTO dto, BigDecimal total) {}
    private record EmpresaInfo(String nome, String cnpj, String inscricaoEstadual,
                               String endereco, String cidade, String estado,
                               String cep, String telefone, String email) {}
}