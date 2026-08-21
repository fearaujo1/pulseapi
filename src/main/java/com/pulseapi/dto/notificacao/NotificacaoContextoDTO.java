package com.pulseapi.dto.notificacao;

public record NotificacaoContextoDTO (
        Long equipamentoId,
        Long ocorrenciaId,
        Long producaoId,
        Long filaImpressaoId
    ) {
}