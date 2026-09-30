package com.pulseapi.dto.producao;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.Map;

public record ProducaoItemImportacaoDTO(

        @NotNull(message = "A sequência é obrigatória.")
        @Positive(message = "A sequência deve ser maior que zero.")
        Integer sequencia,

        @Size(
                max = 150,
                message = "A referência externa deve possuir no máximo 150 caracteres."
        )
        String referenciaExterna,

        @NotEmpty(message = "Informe os valores do item.")
        Map<
                @NotBlank(message = "A chave do campo não pode estar vazia.")
                        String,
                String
                > valores

) {
}