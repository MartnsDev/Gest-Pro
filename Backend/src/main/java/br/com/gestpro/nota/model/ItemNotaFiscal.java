package br.com.gestpro.nota.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "itens_nota_fiscal")
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

    @Column(name = "valor_desconto", precision = 15, scale = 2)
    private BigDecimal valorDesconto = BigDecimal.ZERO;

    @Column(name = "valor_total", precision = 15, scale = 2, nullable = false)
    private BigDecimal valorTotal;

    // Tributação ICMS
    @Column(name = "csosn", length = 3)
    private String csosn; // Para Simples Nacional

    @Column(name = "cst_icms", length = 3)
    private String cstIcms; // Para Lucro Presumido/Real

    @Column(name = "icms_base_calculo", precision = 15, scale = 2)
    private BigDecimal icmsBaseCalculo = BigDecimal.ZERO;

    @Column(name = "icms_aliquota", precision = 5, scale = 2)
    private BigDecimal icmsAliquota = BigDecimal.ZERO;

    @Column(name = "icms_valor", precision = 15, scale = 2)
    private BigDecimal icmsValor = BigDecimal.ZERO;

    // Tributação PIS
    @Column(name = "cst_pis", length = 2)
    private String cstPis;

    @Column(name = "pis_base_calculo", precision = 15, scale = 2)
    private BigDecimal pisBaseCalculo = BigDecimal.ZERO;

    @Column(name = "pis_aliquota", precision = 5, scale = 4)
    private BigDecimal pisAliquota = BigDecimal.ZERO;

    @Column(name = "pis_valor", precision = 15, scale = 2)
    private BigDecimal pisValor = BigDecimal.ZERO;

    // Tributação COFINS
    @Column(name = "cst_cofins", length = 2)
    private String cstCofins;

    @Column(name = "cofins_base_calculo", precision = 15, scale = 2)
    private BigDecimal cofinsBaseCalculo = BigDecimal.ZERO;

    @Column(name = "cofins_aliquota", precision = 5, scale = 4)
    private BigDecimal cofinsAliquota = BigDecimal.ZERO;

    @Column(name = "cofins_valor", precision = 15, scale = 2)
    private BigDecimal cofinsValor = BigDecimal.ZERO;

    @Column(name = "numero_item")
    private Integer numeroItem;

    @Column(name = "informacoes_adicionais", length = 500)
    private String informacoesAdicionais;

    public void setNotaFiscal(NotaFiscal notaFiscal) {
        this.notaFiscal = notaFiscal;
    }

    public NotaFiscal getNotaFiscal() {
        return notaFiscal;
    }
}