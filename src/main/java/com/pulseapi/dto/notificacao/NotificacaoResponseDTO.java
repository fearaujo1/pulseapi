package com.pulseapi.dto.notificacao;

import com.pulseapi.entity.NivelNotificacao;
import com.pulseapi.entity.TipoNotificacao;

import java.time.LocalDateTime;

public record NotificacaoResponseDTO(
        Long id,
        TipoNotificacao tipo,
        NivelNotificacao nivel,
        String titulo,
        String mensagem,
        Boolean lida,
        Long equipamentoId,
        Long ocorrenciaId,
        Long producaoId,
        Long filaImpressaoId,
        LocalDateTime criadoEm
) {
}