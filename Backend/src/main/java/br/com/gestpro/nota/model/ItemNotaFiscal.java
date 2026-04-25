package br.com.gestpro.nota.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "itens_nota_fiscal")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemNotaFiscal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nota_fiscal_id", nullable = false)
    private NotaFiscal notaFiscal;

    @Column(name = "produto_id")
    private Long produtoId;

    @Column(name = "codigo_produto", length = 60)
    private String codigoProduto;

    @Column(name = "descricao", length = 200, nullable = false)
    private String descricao;

    @Column(name = "ncm", length = 8, nullable = false)
    private String ncm;

    @Column(name = "cfop", length = 4, nullable = false)
    private String cfop;

    @Column(name = "unidade", length = 6)
    private String unidade;

    @Column(name = "quantidade", precision = 15, scale = 4, nullable = false)
    private BigDecimal quantidade;

    @Column(name = "valor_unitario", precision = 15, scale = 4, nullable = false)
    private BigDecimal valorUnitario;

    @Column(name = "valor_bruto", precision = 15, scale = 2)
    private BigDecimal valorBruto;

    @Builder.Default
    @Column(name = "valor_desconto", precision = 15, scale = 2)
    private BigDecimal valorDesconto = BigDecimal.ZERO;

    @Column(name = "valor_total", precision = 15, scale = 2, nullable = false)
    private BigDecimal valorTotal;

    // ── Tributação ICMS ──────────────────────────────────────────────────────

    /** Código de Situação da Operação do Simples Nacional. Usar para empresas no Simples. */
    @Column(name = "csosn", length = 3)
    private String csosn;

    /** Código de Situação Tributária do ICMS. Usar para Lucro Presumido / Real. */
    @Column(name = "cst_icms", length = 3)
    private String cstIcms;

    @Builder.Default
    @Column(name = "icms_base_calculo", precision = 15, scale = 2)
    private BigDecimal icmsBaseCalculo = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "icms_aliquota", precision = 5, scale = 2)
    private BigDecimal icmsAliquota = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "icms_valor", precision = 15, scale = 2)
    private BigDecimal icmsValor = BigDecimal.ZERO;

    // ── Tributação PIS ───────────────────────────────────────────────────────

    @Column(name = "cst_pis", length = 2)
    private String cstPis;

    @Builder.Default
    @Column(name = "pis_base_calculo", precision = 15, scale = 2)
    private BigDecimal pisBaseCalculo = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "pis_aliquota", precision = 5, scale = 4)
    private BigDecimal pisAliquota = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "pis_valor", precision = 15, scale = 2)
    private BigDecimal pisValor = BigDecimal.ZERO;

    // ── Tributação COFINS ────────────────────────────────────────────────────

    @Column(name = "cst_cofins", length = 2)
    private String cstCofins;

    @Builder.Default
    @Column(name = "cofins_base_calculo", precision = 15, scale = 2)
    private BigDecimal cofinsBaseCalculo = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "cofins_aliquota", precision = 5, scale = 4)
    private BigDecimal cofinsAliquota = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "cofins_valor", precision = 15, scale = 2)
    private BigDecimal cofinsValor = BigDecimal.ZERO;

    // ── Controle ─────────────────────────────────────────────────────────────

    @Column(name = "numero_item")
    private Integer numeroItem;

    @Column(name = "informacoes_adicionais", length = 500)
    private String informacoesAdicionais;

    // ── Helper bidirecional (mantido manual, não interferir no @Builder) ─────

    /**
     * Vincula este item à sua nota fiscal (mantém a consistência bidirecional do JPA).
     * Chamado internamente pelo {@code NotaFiscal#addItem}.
     */
    public void vincularNota(NotaFiscal notaFiscal) {
        this.notaFiscal = notaFiscal;
    }
}