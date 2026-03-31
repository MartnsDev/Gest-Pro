package br.com.gestpro.pedidos.dto;

/**
 * Ciclo de vida de um Pedido (venda rápida).
 *
 * PENDENTE   → aguardando confirmação de pagamento
 * CONFIRMADO → pagamento confirmado, aguardando envio/retirada
 * ENVIADO    → em trânsito
 * ENTREGUE   → concluído com sucesso
 * CANCELADO  → pedido cancelado (estoque devolvido)
 */
public enum StatusPedido {
    PENDENTE,
    CONFIRMADO,
    ENVIADO,
    ENTREGUE,
    CANCELADO
}