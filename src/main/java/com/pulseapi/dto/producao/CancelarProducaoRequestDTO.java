package com.pulseapi.dto.producao;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelarProducaoRequestDTO(

        @NotBlank(
                message = "O motivo do cancelamento é obrigatório."
        )
        @Size(
                max = 500,
                message = "O motivo deve possuir no máximo 500 caracteres."
        )
        String motivo

) {
}