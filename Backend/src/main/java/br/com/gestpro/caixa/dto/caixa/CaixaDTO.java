package br.com.gestpro.caixa.dto.caixa;

import br.com.gestpro.caixa.StatusCaixa;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class CaixaDTO {
    private Long id;
    private LocalDateTime dataAbertura;
    private LocalDateTime dataFechamento;
    private BigDecimal valorInicial;
    private BigDecimal valorFinal;
    private StatusCaixa status;
    private Long usuarioId;
    private List<Long> vendasIds = new ArrayList<>(); // inicializa vazio
}
