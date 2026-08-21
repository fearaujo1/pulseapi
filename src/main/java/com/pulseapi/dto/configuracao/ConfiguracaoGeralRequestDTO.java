package com.pulseapi.dto.configuracao;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ConfiguracaoGeralRequestDTO(

        @NotNull
        Boolean controleAcessoTurnoAtivo,

        @NotNull
        @Min(0)
        Integer toleranciaTurnoMinutos

) {
}