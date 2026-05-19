package com.pulseapi.dto.parada;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ParadaRequestDTO {

    @NotBlank(message = "O título é obrigatório.")
    private String titulo;

    @NotBlank(message = "A descrição é obrigatória.")
    private String descricao;

    @NotBlank(message = "O tipo é obrigatório.")
    private String tipo;

    @NotNull(message = "O equipamento é obrigatório.")
    private Long equipamentoId;
}