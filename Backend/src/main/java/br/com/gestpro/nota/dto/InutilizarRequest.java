package br.com.gestpro.nota.dto;

import br.com.gestpro.nota.TipoNota;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InutilizarRequest {
    private Long empresaId;
    private TipoNota tipo;
    private String serie;
    private Long numeroInicio;
    private Long numeroFim;
    private String justificativa;
}