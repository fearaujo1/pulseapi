package com.pulseapi.dto.producao;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ProducaoItensLoteRequestDTO(

        @NotEmpty(message = "Informe pelo menos um item.")
        @Size(
                max = 500,
                message = "Cada lote pode possuir no máximo 500 itens."
        )
        List<@Valid ProducaoItemImportacaoDTO> itens

) {
}