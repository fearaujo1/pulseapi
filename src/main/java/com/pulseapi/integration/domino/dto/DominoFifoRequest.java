package com.pulseapi.integration.domino.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DominoFifoRequest (
        @NotBlank(message = "Os dados são obrigatórios.")
        @Size(max = 1024, message = "Os dados podem ter no máximo 1024 caracteres")
        String dados
){
}
