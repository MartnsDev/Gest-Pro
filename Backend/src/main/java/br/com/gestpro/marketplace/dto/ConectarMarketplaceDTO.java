package br.com.gestpro.marketplace.dto;

import br.com.gestpro.pedidos.CanalVenda;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ConectarMarketplaceDTO {

    /** SHOPEE ou MERCADO_LIVRE */
    @NotNull
    public CanalVenda marketplace;

    /** ID do vendedor na plataforma */
    @NotBlank
    public String sellerId;

    @NotBlank
    public String accessToken;

    public String refreshToken;

    /** Em segundos a partir de agora — ex: 21600 = 6h (padrão ML) */
    public Long expiresInSeconds;
}