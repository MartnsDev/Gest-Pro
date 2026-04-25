package br.com.gestpro.nota.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancelarNotaRequest {
    private Long notaId;
    private String justificativa;
}