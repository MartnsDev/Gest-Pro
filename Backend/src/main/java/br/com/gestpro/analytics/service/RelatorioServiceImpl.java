package br.com.gestpro.analytics.service;

import br.com.gestpro.analytics.dto.RelatorioDTO;
import br.com.gestpro.caixa.model.Caixa;
import br.com.gestpro.caixa.repository.CaixaRepository;
import br.com.gestpro.dashboard.repository.DashboardRepository;
import br.com.gestpro.empresa.model.Empresa;
import br.com.gestpro.empresa.repository.EmpresaRepository;
import br.com.gestpro.infra.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RelatorioServiceImpl implements RelatorioServiceInterface {

    private static final String PATH     = "/api/v1/relatorios";
    private static final DateTimeFormatter FMT_DT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter FMT_DAY =
            DateTimeFormatter.ofPattern("dd/MM");

    private final DashboardRepository dashboardRepository;
    private final EmpresaRepository   empresaRepository;
    private final CaixaRepository     caixaRepository;

    // ─── Endpoints de conveniência ────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public RelatorioDTO hoje(Long empresaId, String email) {
        Empresa emp = validar(empresaId, email);
        LocalDateTime inicio = LocalDate.now().atStartOfDay();
        LocalDateTime fim    = LocalDate.now().atTime(23, 59, 59);
        return montar(emp, "Relatório de Hoje", inicio, fim);
    }

    @Override
    @Transactional(readOnly = true)
    public RelatorioDTO semana(Long empresaId, String email) {
        Empresa emp = validar(empresaId, email);
        LocalDateTime inicio = LocalDate.now().with(DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime fim    = LocalDate.now().with(DayOfWeek.SUNDAY).atTime(23, 59, 59);
        return montar(emp, "Relatório da Semana", inicio, fim);
    }

    @Override
    @Transactional(readOnly = true)
    public RelatorioDTO mes(Long empresaId, String email) {
        Empresa emp   = validar(empresaId, email);
        LocalDate hoje = LocalDate.now();
        LocalDateTime inicio = hoje.withDayOfMonth(1).atStartOfDay();
        LocalDateTime fim    = hoje.withDayOfMonth(hoje.lengthOfMonth()).atTime(23, 59, 59);
        return montar(emp, "Relatório do Mês", inicio, fim);
    }

    @Override
    @Transactional(readOnly = true)
    public RelatorioDTO periodo(Long empresaId, String email,
                                LocalDateTime inicio, LocalDateTime fim) {
        Empresa emp = validar(empresaId, email);
        return montar(emp, "Relatório Personalizado", inicio, fim);
    }

    @Override
    @Transactional(readOnly = true)
    public RelatorioDTO porCaixa(Long caixaId, String email) {
        Caixa caixa = caixaRepository.findById(caixaId)
                .orElseThrow(() -> new ApiException("Caixa não encontrado", HttpStatus.NOT_FOUND, PATH));
        Empresa emp = caixa.getEmpresa();
        if (!emp.getDono().getEmail().equals(email))
            throw new ApiException("Sem permissão.", HttpStatus.FORBIDDEN, PATH);

        LocalDateTime inicio = caixa.getDataAbertura();
        LocalDateTime fim    = caixa.getDataFechamento() != null
                ? caixa.getDataFechamento()
                : LocalDateTime.now();
        return montar(emp, "Relatório do Caixa #" + caixaId, inicio, fim);
    }

    // ─── Montagem principal ────────────────────────────────────────────────

    private RelatorioDTO montar(Empresa emp, String titulo,
                                LocalDateTime inicio, LocalDateTime fim) {
        Long id = emp.getId();
        RelatorioDTO rel = new RelatorioDTO();
        rel.setTitulo(titulo);
        rel.setNomeEmpresa(emp.getNomeFantasia());
        rel.setGeradoEm(LocalDateTime.now().format(FMT_DT));
        rel.setPeriodo(inicio.format(FMT_DT) + " → " + fim.format(FMT_DT));

        // ── KPIs principais ───────────────────────────────────────────────
        double receita      = toDouble(dashboardRepository.faturamentoPeriodo(id, inicio, fim));
        double lucro        = toDouble(dashboardRepository.lucroPorPeriodo(id, inicio, fim));
        double descontos    = toDouble(dashboardRepository.descontoTotalPeriodo(id, inicio, fim));
        long   totalTx      = toLong(dashboardRepository.totalTransacoesPeriodo(id, inicio, fim));
        double maior        = toDouble(dashboardRepository.maiorVendaPeriodo(id, inicio, fim));
        double menor        = toDouble(dashboardRepository.menorVendaPeriodo(id, inicio, fim));
        long   cancelTot    = toLong(dashboardRepository.cancelamentosPdvPeriodo(id, inicio, fim))
                + toLong(dashboardRepository.cancelamentosPedidosPeriodo(id, inicio, fim));
        double valCancel    = toDouble(dashboardRepository.valorCanceladoPdvPeriodo(id, inicio, fim))
                + toDouble(dashboardRepository.valorCanceladoPedidosPeriodo(id, inicio, fim));

        rel.setReceitaTotal(receita);
        rel.setLucroTotal(lucro);
        rel.setTotalDescontos(descontos);
        rel.setTotalVendas(totalTx);
        rel.setTicketMedio(totalTx > 0 ? receita / totalTx : 0);
        rel.setMaiorVenda(maior);
        rel.setMenorVenda(menor);
        rel.setCancelamentos(cancelTot);
        rel.setValorCancelado(valCancel);

        // ── Origem (pizza) ────────────────────────────────────────────────
        double recPdv     = toDouble(dashboardRepository.somaPdvMes(id));     // approx — usa mês; para precisão exata teríamos query por período
        double recPedidos = toDouble(dashboardRepository.somaPedidosMes(id));
        // Sobrescreve com valores reais do período via faturamentoPeriodo já calculado
        // Usa as queries separadas de PDV e Pedidos para o período:
        double recPdvPeriodo     = toDouble(dashboardRepository.somaPdvPeriodo(id, inicio, fim));
        double recPedidosPeriodo = toDouble(dashboardRepository.somaPedidosPeriodo(id, inicio, fim));
        rel.setReceitaPdv(recPdvPeriodo);
        rel.setReceitaPedidos(recPedidosPeriodo);

        // ── Vendas diárias ────────────────────────────────────────────────
        List<Object[]> dias = dashboardRepository.vendasDiariasPeriodo(id, inicio, fim);
        rel.setVendasDiarias(dias.stream().map(r -> {
            String diaStr = r[0] != null ? r[0].toString().substring(5).replace("-", "/") : "?";
            return new RelatorioDTO.VendasDiaItem(diaStr, toDouble(r[1]));
        }).collect(Collectors.toList()));

        // ── Pagamentos ────────────────────────────────────────────────────
        Map<String, long[]> pagMap = new LinkedHashMap<>(); // [qtd, total_cents]
        for (Object[] r : dashboardRepository.pagamentosPdvPeriodo(id, inicio, fim)) {
            String forma = str(r[0]);
            long   qtd   = toLong(r[1]);
            double tot   = toDouble(r[2]);
            pagMap.merge(forma, new long[]{qtd, (long)(tot*100)},
                    (a,b) -> new long[]{a[0]+b[0], a[1]+b[1]});
        }
        for (Object[] r : dashboardRepository.pagamentosPedidosPeriodo(id, inicio, fim)) {
            String forma = str(r[0]);
            long   qtd   = toLong(r[1]);
            double tot   = toDouble(r[2]);
            pagMap.merge(forma, new long[]{qtd, (long)(tot*100)},
                    (a,b) -> new long[]{a[0]+b[0], a[1]+b[1]});
        }
        double totalPag = pagMap.values().stream().mapToDouble(v -> v[1] / 100.0).sum();
        List<RelatorioDTO.PagamentoItem> pags = pagMap.entrySet().stream().map(e -> {
                    double tot = e.getValue()[1] / 100.0;
                    RelatorioDTO.PagamentoItem p = new RelatorioDTO.PagamentoItem(e.getKey(), e.getValue()[0], tot);
                    p.setPercentual(totalPag > 0 ? (tot / totalPag) * 100 : 0);
                    return p;
                }).sorted(Comparator.comparingDouble(RelatorioDTO.PagamentoItem::getTotal).reversed())
                .collect(Collectors.toList());
        rel.setPagamentos(pags);

        // ── Top produtos ──────────────────────────────────────────────────
        List<Object[]> prods = dashboardRepository.topProdutosPeriodo(id, inicio, fim);
        rel.setTopProdutos(prods.stream().map(r -> new RelatorioDTO.ProdutoItem(
                str(r[0]), toLong(r[1]), toDouble(r[2]), toDouble(r[3])
        )).collect(Collectors.toList()));

        // ── Pico por hora ─────────────────────────────────────────────────
        List<Object[]> horas = dashboardRepository.vendasPorHoraPeriodo(id, inicio, fim);
        rel.setVendasPorHora(horas.stream().map(r ->
                new RelatorioDTO.VendasHoraItem((int) toLong(r[0]), toLong(r[1]), toDouble(r[2]))
        ).collect(Collectors.toList()));

        // ── Listagem individual (PDV + Pedidos) ───────────────────────────
        List<RelatorioDTO.VendaItem> vendas = new ArrayList<>();

        // PDV
        for (Object[] r : dashboardRepository.vendasPdvPeriodo(id, inicio, fim)) {
            long   vid  = toLong(r[0]);
            String data = fmtDt(r[1]);
            String fp   = str(r[2]);
            String fp2  = r[3] != null && !r[3].toString().isBlank() ? str(r[3]) : null;
            double vf   = toDouble(r[4]);
            double desc = toDouble(r[5]);
            double troco= toDouble(r[6]);
            String obs  = strNull(r[7]);
            String cli  = strNull(r[8]);

            List<String> itens = dashboardRepository.itensPorVendaId(vid).stream()
                    .map(i -> str(i[0]) + " x" + toLong(i[1]) + " = " + fmtMoeda(toDouble(i[3])))
                    .collect(Collectors.toList());

            vendas.add(new RelatorioDTO.VendaItem(vid, data, fp, fp2, vf, desc, troco, obs, cli, "PDV", itens));
        }

        // Pedidos
        for (Object[] r : dashboardRepository.pedidosPeriodo(id, inicio, fim)) {
            long   pid  = toLong(r[0]);
            String data = fmtDt(r[1]);
            String fp   = str(r[2]);
            String canal= str(r[3]); // canal_venda como "2ª forma"
            double vf   = toDouble(r[4]);
            double desc = toDouble(r[5]);
            double frete= toDouble(r[6]);
            String obs  = strNull(r[7]);
            String cli  = strNull(r[8]);

            List<String> itens = dashboardRepository.itensPorPedidoId(pid).stream()
                    .map(i -> str(i[0]) + " x" + toLong(i[1]) + " = " + fmtMoeda(toDouble(i[3])))
                    .collect(Collectors.toList());

            // Inclui frete nos itens se houver
            if (frete > 0) itens.add("Frete = " + fmtMoeda(frete));

            vendas.add(new RelatorioDTO.VendaItem(pid, data, fp, canal, vf, desc, 0, obs, cli, "PEDIDO", itens));
        }

        // Ordena por data desc
        vendas.sort((a, b) -> b.getData().compareTo(a.getData()));
        rel.setVendas(vendas);

        return rel;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    private Empresa validar(Long empresaId, String email) {
        Empresa e = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new ApiException("Empresa não encontrada", HttpStatus.NOT_FOUND, PATH));
        if (!e.getDono().getEmail().equals(email))
            throw new ApiException("Sem permissão.", HttpStatus.FORBIDDEN, PATH);
        return e;
    }

    private double toDouble(Object obj) {
        if (obj == null) return 0.0;
        if (obj instanceof Number n) return n.doubleValue();
        try { return Double.parseDouble(obj.toString().trim()); }
        catch (Exception e) { return 0.0; }
    }

    private long toLong(Object obj) {
        if (obj == null) return 0L;
        if (obj instanceof Number n) return n.longValue();
        try {
            String s = obj.toString().trim();
            if (s.contains(".")) s = s.split("\\.")[0];
            return Long.parseLong(s);
        } catch (Exception e) { return 0L; }
    }

    private String str(Object obj) {
        return obj != null ? obj.toString().trim() : "";
    }

    private String strNull(Object obj) {
        if (obj == null) return null;
        String s = obj.toString().trim();
        return s.isBlank() ? null : s;
    }

    private String fmtDt(Object obj) {
        if (obj == null) return "—";
        try {
            if (obj instanceof java.sql.Timestamp ts)
                return ts.toLocalDateTime().format(FMT_DT);
            if (obj instanceof java.sql.Date d)
                return d.toLocalDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            String s = obj.toString().trim();
            if (s.contains("T")) return LocalDateTime.parse(s).format(FMT_DT);
            return s;
        } catch (Exception e) { return obj.toString(); }
    }

    private String fmtMoeda(double v) {
        return String.format("R$\u00a0%.2f", v).replace('.', ',');
    }
}