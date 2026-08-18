package com.pulseapi.dto.configuracao;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record TurnoRequestDTO(

        @NotBlank(message = "O nome do turno é obrigatório.")
        String nome,

        @NotNull(message = "O horário inicial é obrigatório.")
        LocalTime horaInicio,

        @NotNull(message = "O horário final é obrigatório.")
        LocalTime horaFim,

        @NotNull(message = "Informe se o turno está ativo.")
        Boolean ativo

) {
}