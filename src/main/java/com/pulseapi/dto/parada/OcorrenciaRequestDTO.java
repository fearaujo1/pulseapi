package com.pulseapi.dto.parada;

import com.pulseapi.entity.StatusOcorrencia;
import com.pulseapi.entity.TipoOcorrencia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OcorrenciaRequestDTO {

    @NotBlank(message = "O título é obrigatório.")
    private String titulo;

    @NotBlank(message = "A descrição é obrigatória.")
    private String descricao;

    @NotNull(message = "O tipo é obrigatório.")
    private TipoOcorrencia tipo;

    @NotNull(message = "O equipamento é obrigatório.")
    private Long equipamentoId;
}