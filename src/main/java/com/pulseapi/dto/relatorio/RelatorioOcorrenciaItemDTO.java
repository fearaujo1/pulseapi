package com.pulseapi.dto.relatorio;

import com.pulseapi.entity.StatusOcorrencia;
import com.pulseapi.entity.TipoOcorrencia;

import java.time.LocalDateTime;

public record RelatorioOcorrenciaItemDTO(
        Long id,
        String titulo,
        String descricao,
        TipoOcorrencia tipo,
        StatusOcorrencia status,
        Long equipamentoId,
        String equipamentoNome,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
}