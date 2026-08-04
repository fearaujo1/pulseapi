package com.pulseapi.dto.parada;

import com.pulseapi.entity.StatusOcorrencia;
import com.pulseapi.entity.TipoOcorrencia;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OcorrenciaResponseDTO {

    private Long id;
    private String titulo;
    private String descricao;
    private TipoOcorrencia tipo;
    private StatusOcorrencia status;
    private Long equipamentoId;
    private String equipamentoNome;
    private String equipamentoCodigo;
}