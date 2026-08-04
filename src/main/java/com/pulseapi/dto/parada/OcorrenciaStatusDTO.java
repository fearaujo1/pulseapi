package com.pulseapi.dto.parada;

import com.pulseapi.entity.StatusOcorrencia;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OcorrenciaStatusDTO {

    @NotNull(message = "O status é obrigatório.")
    private StatusOcorrencia status;
}