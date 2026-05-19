package com.pulseapi.dto.parada;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ParadaResponseDTO {

    private Long id;
    private String titulo;
    private String descricao;
    private String tipo;

    private Long equipamentoId;
    private String equipamentoNome;
    private String equipamentoCodigo;
}