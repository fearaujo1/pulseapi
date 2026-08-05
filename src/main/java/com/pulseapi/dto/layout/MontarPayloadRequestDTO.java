package com.pulseapi.dto.layout;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record MontarPayloadRequestDTO(

        @NotNull(message = "O layout é obrigatório.")
        Long layoutId,

        @NotEmpty(message = "Informe os valores do layout.")
        Map<String, String> valores

) {
}