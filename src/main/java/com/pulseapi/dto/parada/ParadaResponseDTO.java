package com.pulseapi.dto.parada;

import com.pulseapi.entity.TipoParada;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ParadaResponseDTO {

    private Long id;
    private String titulo;
    private String descricao;
    private TipoParada tipo;

    private Long equipamentoId;
    private String equipamentoNome;
    private String equipamentoCodigo;
}