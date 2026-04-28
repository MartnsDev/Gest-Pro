package br.com.gestpro.marketplace.dto;

import br.com.gestpro.pedidos.CanalVenda;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class VincularProdutoDTO {

@NotNull
public Long produtoId;

@NotNull
public CanalVenda marketplace;

/** ID do anúncio na plataforma */
@NotBlank
public String anuncioId;

/** Título exibido no painel — pode ser preenchido pelo front */
public String anuncioTitulo;
}
