package com.pulseapi.dto.relatorio;

import com.pulseapi.entity.StatusFilaImpressao;
import java.time.LocalDateTime;

public record RelatorioImpressaoItemDTO(
        Long id,
        Long equipamentoId,
        String equipamentoNome,
        Long layoutId,
        String layoutNome,
        String payloadMontado,
        StatusFilaImpressao status,
        Long ordemFila,
        Integer tentativas,
        Long contadorAntesEnvio,
        Long contadorCarregamento,
        Long contadorAposImpressao,
        LocalDateTime criadoEm,
        LocalDateTime enviadoEm,
        LocalDateTime impressoEm,
        String mensagemErro
) {
}
