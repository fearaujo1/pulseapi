package com.pulseapi.dto.fila;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record FilaImpressaoRequestDTO(

        @NotNull(message = "O layout é obrigatório.")
        Long layoutId,

        @NotEmpty(message = "Informe os valores da impressão.")
        Map<String, String> valores

) {
}