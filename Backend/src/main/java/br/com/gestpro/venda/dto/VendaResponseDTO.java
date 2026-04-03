package br.com.gestpro.venda.dto;

import br.com.gestpro.venda.model.Venda;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class VendaResponseDTO {

    private Long id;
    private String emailUsuario;
    private Long idCaixa;
    private String nomeCliente;
    private List<ItemVendaDTO> itens;
    private BigDecimal valorTotal;
    private BigDecimal desconto;
    private BigDecimal valorFinal;
    private BigDecimal valorRecebido;
    private BigDecimal troco;
    private String formaPagamento;
    private String formaPagamento2;
    private BigDecimal valorPagamento2;
    private LocalDateTime dataVenda;
    private String observacao;
    private Boolean cancelada;
    private LocalDateTime dataCancelamento;
    private String motivoCancelamento;

    public VendaResponseDTO(Venda venda) {

        var usuario = venda.getUsuario();
        var caixa = venda.getCaixa();
        var cliente = venda.getCliente();

        this.id = venda.getId();

        this.emailUsuario = usuario != null ? usuario.getEmail() : null;
        this.idCaixa = caixa != null ? caixa.getId() : null;
        this.nomeCliente = cliente != null ? cliente.getNome() : null;

        this.itens = venda.getItens() != null
                ? venda.getItens().stream()
                .map(ItemVendaDTO::new)
                .collect(Collectors.toList())
                : List.of();

        this.valorTotal = venda.getTotal();

        this.desconto = venda.getDesconto() != null
                ? venda.getDesconto()
                : BigDecimal.ZERO;

        this.valorFinal = venda.getValorFinal() != null
                ? venda.getValorFinal()
                : BigDecimal.ZERO;

        this.valorRecebido = venda.getValorRecebido();
        this.troco = venda.getTroco();

        this.formaPagamento = venda.getFormaPagamento() != null
                ? venda.getFormaPagamento().name()
                : null;

        this.formaPagamento2 = venda.getFormaPagamento2() != null
                ? venda.getFormaPagamento2().name()
                : null;

        this.valorPagamento2 = venda.getValorPagamento2();

        this.dataVenda = venda.getDataVenda();
        this.observacao = venda.getObservacao();

        this.cancelada = Boolean.TRUE.equals(venda.getCancelada());

        this.dataCancelamento = venda.getDataCancelamento();
        this.motivoCancelamento = venda.getMotivoCancelamento();
    }

    // Getters
    public Long getId()                       { return id; }
    public String getEmailUsuario()           { return emailUsuario; }
    public Long getIdCaixa()                  { return idCaixa; }
    public String getNomeCliente()            { return nomeCliente; }
    public List<ItemVendaDTO> getItens()      { return itens; }
    public BigDecimal getValorTotal()         { return valorTotal; }
    public BigDecimal getDesconto()           { return desconto; }
    public BigDecimal getValorFinal()         { return valorFinal; }
    public BigDecimal getValorRecebido()      { return valorRecebido; }
    public BigDecimal getTroco()              { return troco; }
    public String getFormaPagamento()         { return formaPagamento; }
    public String getFormaPagamento2()        { return formaPagamento2; }
    public BigDecimal getValorPagamento2()    { return valorPagamento2; }
    public LocalDateTime getDataVenda()       { return dataVenda; }
    public String getObservacao()             { return observacao; }
    public Boolean getCancelada()             { return cancelada; }
    public LocalDateTime getDataCancelamento(){ return dataCancelamento; }
    public String getMotivoCancelamento()     { return motivoCancelamento; }
}