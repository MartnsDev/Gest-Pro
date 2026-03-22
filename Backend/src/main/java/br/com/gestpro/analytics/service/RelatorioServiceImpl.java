package br.com.gestpro.analytics.service;

import br.com.gestpro.analytics.dto.RelatorioDTO;
import br.com.gestpro.analytics.repository.RelatorioRepository;
import br.com.gestpro.caixa.model.Caixa;
import br.com.gestpro.caixa.repository.CaixaRepository;
import br.com.gestpro.empresa.model.Empresa;
import br.com.gestpro.empresa.repository.EmpresaRepository;
import br.com.gestpro.infra.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class RelatorioServiceImpl implements RelatorioServiceInterface {

    private final RelatorioRepository relatorioRepository;
    private final EmpresaRepository   empresaRepository;
    private final CaixaRepository     caixaRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final Map<String, String> FORMA_LABEL = Map.of(
            "PIX", "Pix", "DINHEIRO", "Dinheiro",
            "CARTAO_DEBITO", "Débito", "CARTAO_CREDITO", "Crédito"
    );

    private Empresa validar(Long empresaId, String email) {
        Empresa emp = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new ApiException("Empresa não encontrada", HttpStatus.NOT_FOUND, "/relatorios"));
        if (!emp.getDono().getEmail().equals(email))
            throw new ApiException("Sem permissão.", HttpStatus.FORBIDDEN, "/relatorios");
        return emp;
    }

    @Override
    @Transactional(readOnly = true)
    public RelatorioDTO gerarPorPeriodo(Long empresaId, LocalDateTime inicio, LocalDateTime fim, String email) {
        Empresa emp = validar(empresaId, email);
        return montar(emp, inicio, fim,
                "Relatório " + inicio.format(DateTimeFormatter.ofPattern("dd/MM")) + " → " + fim.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
    }

    @Override
    @Transactional(readOnly = true)
    public RelatorioDTO gerarPorCaixa(Long caixaId, String email) {
        Caixa caixa = caixaRepository.findById(caixaId)
                .orElseThrow(() -> new ApiException("Caixa não encontrado", HttpStatus.NOT_FOUND, "/relatorios"));
        if (!caixa.getEmpresa().getDono().getEmail().equals(email))
            throw new ApiException("Sem permissão.", HttpStatus.FORBIDDEN, "/relatorios");

        LocalDateTime inicio = caixa.getDataAbertura();
        LocalDateTime fim    = caixa.getDataFechamento() != null ? caixa.getDataFechamento() : LocalDateTime.now();
        return montar(caixa.getEmpresa(), inicio, fim, "Relatório Caixa #" + caixaId);
    }

    // ─────────────────────────────────────────────────────────────────────
    private RelatorioDTO montar(Empresa emp, LocalDateTime inicio, LocalDateTime fim, String titulo) {
        Long id = emp.getId();

        // 1. Resumo geral — List<Object[]> garante que nunca colapsa
        List<Object[]> resumoList = relatorioRepository.resumoGeral(id, inicio, fim);
        List<Object[]> cancelList = relatorioRepository.resumoCancelamentos(id, inicio, fim);
        List<Object>   lucroList  = relatorioRepository.lucroTotal(id, inicio, fim);

        Object[] resumo = resumoList != null && !resumoList.isEmpty() ? resumoList.get(0) : new Object[6];
        Object[] cancel = cancelList != null && !cancelList.isEmpty() ? cancelList.get(0) : new Object[2];
        Object   lucroObj = lucroList != null && !lucroList.isEmpty() ? lucroList.get(0) : null;

        long       totalVendas = safeIndex(resumo, 0);
        BigDecimal receita     = toBD(safeGet(resumo, 1));
        BigDecimal descontos   = toBD(safeGet(resumo, 2));
        BigDecimal ticket      = toBD(safeGet(resumo, 3));
        BigDecimal maior       = toBD(safeGet(resumo, 4));
        BigDecimal menor       = toBD(safeGet(resumo, 5));
        BigDecimal lucro       = toBD(lucroObj);
        long       cancelQtd   = safeIndex(cancel, 0);
        BigDecimal cancelVal   = toBD(safeGet(cancel, 1));

        // 2. Vendas diárias
        List<RelatorioDTO.VendasDiaDTO> diarias = relatorioRepository
                .vendasDiarias(id, inicio, fim).stream()
                .map(r -> RelatorioDTO.VendasDiaDTO.builder()
                        .dia(r[0] != null ? r[0].toString() : "")
                        .qtdVendas(toLong(r[1]))
                        .total(toBD(r[2]))
                        .desconto(toBD(r[3]))
                        .build())
                .toList();

        // 3. Pagamentos
        List<RelatorioDTO.PagamentoDTO> pagamentos = relatorioRepository
                .totaisPorFormaPagamento(id, inicio, fim).stream()
                .map(r -> {
                    String forma = r[0] != null ? FORMA_LABEL.getOrDefault(r[0].toString(), r[0].toString()) : "—";
                    BigDecimal tot = toBD(r[2]);
                    double pct = receita.compareTo(BigDecimal.ZERO) > 0
                            ? tot.divide(receita, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                            : 0.0;
                    return RelatorioDTO.PagamentoDTO.builder()
                            .forma(forma).qtd(toLong(r[1])).total(tot).percentual(pct).build();
                }).toList();

        // 4. Top produtos
        List<RelatorioDTO.ProdutoRelDTO> top = relatorioRepository
                .topProdutos(id, inicio, fim).stream()
                .map(r -> RelatorioDTO.ProdutoRelDTO.builder()
                        .nome(r[0] != null ? r[0].toString() : "—")
                        .quantidade(toLong(r[1]))
                        .receita(toBD(r[2]))
                        .lucro(toBD(r[3]))
                        .build())
                .toList();

        // 5. Por hora
        List<RelatorioDTO.VendasHoraDTO> porHora = relatorioRepository
                .vendasPorHora(id, inicio, fim).stream()
                .map(r -> RelatorioDTO.VendasHoraDTO.builder()
                        .hora(r[0] != null ? ((Number) r[0]).intValue() : 0)
                        .qtd(toLong(r[1]))
                        .total(toBD(r[2]))
                        .build())
                .toList();

        // 6. Itens em batch — Map<vendaId, List<String>>
        Map<Long, List<String>> itensPorVenda = new HashMap<>();
        relatorioRepository.itensPorPeriodo(id, inicio, fim).forEach(r -> {
            Long   vendaId = toLong(r[0]);
            String desc    = r[1] + " x" + toLong(r[2]) + " = " + fmtMoeda(toBD(r[3]));
            itensPorVenda.computeIfAbsent(vendaId, k -> new ArrayList<>()).add(desc);
        });

        // 7. Lista de vendas (raw, sem lazy)
        List<RelatorioDTO.VendaItemDTO> vendas = relatorioRepository
                .listarVendasRaw(id, inicio, fim).stream()
                .map(r -> {
                    Long   vendaId = toLong(r[0]);
                    String forma   = r[2] != null ? FORMA_LABEL.getOrDefault(r[2].toString(), r[2].toString()) : "—";
                    String forma2  = r[3] != null ? FORMA_LABEL.getOrDefault(r[3].toString(), r[3].toString()) : null;
                    return RelatorioDTO.VendaItemDTO.builder()
                            .id(vendaId)
                            .data(r[1] != null ? r[1].toString() : "")
                            .formaPagamento(forma)
                            .formaPagamento2(forma2)
                            .valorFinal(toBD(r[4]))
                            .desconto(toBD(r[5]))
                            .troco(r[6] != null ? toBD(r[6]) : null)
                            .observacao(r[7] != null ? r[7].toString() : null)
                            .nomeCliente(r[8] != null ? r[8].toString() : null)
                            .itens(itensPorVenda.getOrDefault(vendaId, List.of()))
                            .build();
                }).toList();

        return RelatorioDTO.builder()
                .titulo(titulo)
                .periodo(inicio.format(FMT) + " → " + fim.format(FMT))
                .nomeEmpresa(emp.getNomeFantasia())
                .geradoEm(LocalDateTime.now().format(FMT))
                .totalVendas(totalVendas)
                .receitaTotal(receita)
                .lucroTotal(lucro)
                .totalDescontos(descontos)
                .ticketMedio(ticket)
                .maiorVenda(maior)
                .menorVenda(menor)
                .cancelamentos(cancelQtd)
                .valorCancelado(cancelVal)
                .vendasDiarias(diarias)
                .pagamentos(pagamentos)
                .topProdutos(top)
                .vendasPorHora(porHora)
                .vendas(vendas)
                .build();
    }

    // ── Helpers ──────────────────────────────────────────────────────────
    private Object safeGet(Object[] arr, int i) {
        if (arr == null || arr.length <= i) return null;
        return arr[i];
    }

    private long safeIndex(Object[] arr, int i) {
        return toLong(safeGet(arr, i));
    }

    private BigDecimal toBD(Object v) {
        if (v == null) return BigDecimal.ZERO;
        if (v instanceof BigDecimal bd) return bd;
        if (v instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        try { return new BigDecimal(v.toString().trim()); } catch (Exception e) { return BigDecimal.ZERO; }
    }

    private long toLong(Object v) {
        if (v == null) return 0L;
        if (v instanceof Number n) return n.longValue();
        try { return Long.parseLong(v.toString().trim()); } catch (Exception e) { return 0L; }
    }

    private String fmtMoeda(BigDecimal v) {
        if (v == null) return "R$ 0,00";
        return "R$ " + String.format("%.2f", v).replace(".", ",");
    }
}