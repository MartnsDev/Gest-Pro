package br.com.gestpro.analytics.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO único retornado pelo endpoint /api/v1/relatorios/*.
 * Combina dados de PDV (Venda) + Pedidos.
 */
@Data
@NoArgsConstructor
public class RelatorioDTO {

    private String titulo;
    private String periodo;
    private String nomeEmpresa;
    private String geradoEm;

    // ── KPIs ───────────────────────────────────────────────────────────────
    private long   totalVendas;      // PDV + Pedidos
    private double receitaTotal;
    private double lucroTotal;       // PDV (preco_custo) + Pedidos (preco_custo via item_pedido)
    private double totalDescontos;
    private double ticketMedio;
    private double maiorVenda;
    private double menorVenda;
    private long   cancelamentos;    // PDV + Pedidos
    private double valorCancelado;

    // ── Origem (para gráfico de pizza) ─────────────────────────────────────
    private double receitaPdv;
    private double receitaPedidos;

    // ── Gráficos ───────────────────────────────────────────────────────────
    private List<VendasDiaItem>  vendasDiarias;
    private List<PagamentoItem>  pagamentos;
    private List<ProdutoItem>    topProdutos;
    private List<VendasHoraItem> vendasPorHora;

    // ── Listagem individual ────────────────────────────────────────────────
    private List<VendaItem> vendas;

    // ────────────────────────────────────────────────────────────────────────
    //  Itens internos
    // ────────────────────────────────────────────────────────────────────────

    @Data @NoArgsConstructor
    public static class VendasDiaItem {
        private String dia;
        private int    qtdVendas;
        private double total;
        private double desconto;

        public VendasDiaItem(String dia, double total) {
            this.dia   = dia;
            this.total = total;
        }
    }

    @Data @NoArgsConstructor
    public static class PagamentoItem {
        private String forma;
        private long   qtd;
        private double total;
        private double percentual;

        public PagamentoItem(String forma, long qtd, double total) {
            this.forma = forma;
            this.qtd   = qtd;
            this.total = total;
        }
    }

    @Data @NoArgsConstructor
    public static class ProdutoItem {
        private String nome;
        private long   quantidade;
        private double receita;
        private double lucro;

        public ProdutoItem(String nome, long quantidade, double receita, double lucro) {
            this.nome       = nome;
            this.quantidade = quantidade;
            this.receita    = receita;
            this.lucro      = lucro;
        }
    }

    @Data @NoArgsConstructor
    public static class VendasHoraItem {
        private int    hora;
        private long   qtd;
        private double total;

        public VendasHoraItem(int hora, long qtd, double total) {
            this.hora  = hora;
            this.qtd   = qtd;
            this.total = total;
        }
    }

    @Data @NoArgsConstructor
    public static class VendaItem {
        private long    id;
        private String  data;
        private String  formaPagamento;
        private String  formaPagamento2; // canal para pedidos
        private double  valorFinal;
        private double  desconto;
        private double  troco;
        private String  observacao;
        private String  nomeCliente;
        private String  origem;          // "PDV" ou "PEDIDO"
        private List<String> itens;

        public VendaItem(long id, String data, String formaPagamento, String formaPagamento2,
                         double valorFinal, double desconto, double troco,
                         String observacao, String nomeCliente, String origem,
                         List<String> itens) {
            this.id              = id;
            this.data            = data;
            this.formaPagamento  = formaPagamento;
            this.formaPagamento2 = formaPagamento2;
            this.valorFinal      = valorFinal;
            this.desconto        = desconto;
            this.troco           = troco;
            this.observacao      = observacao;
            this.nomeCliente     = nomeCliente;
            this.origem          = origem;
            this.itens           = itens;
        }
    }
}

