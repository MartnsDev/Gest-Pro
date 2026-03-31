package br.com.gestpro.pedidos;

/**
 * Canal de origem de um Pedido (venda rápida, sem caixa físico).
 * Permite filtrar e relatar por plataforma no dashboard.
 */
public enum CanalVenda {
    WHATSAPP,
    INSTAGRAM,
    MERCADO_LIVRE,
    SHOPEE,
    IFOOD,
    TELEFONE,
    OUTRO
}