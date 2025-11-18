package br.com.gestpro.gestpro_backend.api.dto.modules.caixa;

import br.com.gestpro.gestpro_backend.domain.model.enums.StatusCaixa;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CaixaResponseDTO {

    private Long id;
    private LocalDateTime dataAbertura;
    private LocalDateTime dataFechamento;
    private BigDecimal valorInicial;
    private BigDecimal valorFinal;
    private StatusCaixa status;
    private Long usuarioId;
    private List<Long> vendasIds;

    // Construtor que recebe o DTO do serviço
    public CaixaResponseDTO(CaixaDTO dto) {
        this.id = dto.getId();
        this.dataAbertura = dto.getDataAbertura();
        this.dataFechamento = dto.getDataFechamento();
        this.valorInicial = dto.getValorInicial();
        this.valorFinal = dto.getValorFinal();
        this.status = dto.getStatus();
        this.usuarioId = dto.getUsuarioId();
        this.vendasIds = dto.getVendasIds();
    }

    // Getters e setters
}
