package com.pulseapi.dto.parada;

import com.pulseapi.entity.TipoParada;
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

    @NotNull(message = "O tipo é obrigatório.")
    private TipoParada tipo;

    @NotNull(message = "O equipamento é obrigatório.")
    private Long equipamentoId;
}