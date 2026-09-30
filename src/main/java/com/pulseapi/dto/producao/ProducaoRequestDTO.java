package com.pulseapi.dto.producao;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProducaoRequestDTO(

        @NotNull(message = "A linha é obrigatória.")
        Long linhaId,

        @NotNull(message = "O equipamento principal é obrigatório.")
        Long equipamentoPrincipalId,

        @NotNull(message = "O layout principal é obrigatório.")
        Long layoutPrincipalId,

        Long equipamentoRetrabalhoId,

        Long layoutRetrabalhoId,

        @PositiveOrZero(
                message = "A validade em dias não pode ser negativa."
        )
        Integer validadeDias,

        @Size(
                max = 1000,
                message = "As observações devem possuir no máximo 1.000 caracteres."
        )
        String observacoes

) {
}