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
    private BigDecimal valorTotal; // soma dos itens
    private BigDecimal desconto;
    private BigDecimal valorFinal; // valor total - desconto
    private String formaPagamento;
    private LocalDateTime dataVenda;
    private String observacao;

    public VendaResponseDTO(Venda venda) {
        this.id = venda.getId();
        this.emailUsuario = venda.getUsuario() != null ? venda.getUsuario().getEmail() : null;
        this.idCaixa = venda.getCaixa() != null ? venda.getCaixa().getId() : null;
        this.nomeCliente = venda.getCliente() != null ? venda.getCliente().getNome() : null;

        this.itens = venda.getItens().stream()
                .map(ItemVendaDTO::new)
                .collect(Collectors.toList());

        this.valorTotal = venda.getTotal();      // soma dos itens
        this.desconto = venda.getDesconto();
        this.valorFinal = venda.getValorFinal(); // total após desconto
        this.formaPagamento = venda.getFormaPagamento() != null ? venda.getFormaPagamento().name() : null;
        this.dataVenda = venda.getDataVenda();
        this.observacao = venda.getObservacao();
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getEmailUsuario() {
        return emailUsuario;
    }

    public Long getIdCaixa() {
        return idCaixa;
    }

    public String getNomeCliente() {
        return nomeCliente;
    }

    public List<ItemVendaDTO> getItens() {
        return itens;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public BigDecimal getDesconto() {
        return desconto;
    }

    public BigDecimal getValorFinal() {
        return valorFinal;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public LocalDateTime getDataVenda() {
        return dataVenda;
    }

    public String getObservacao() {
        return observacao;
    }
}
