package com.pulseapi.dto.configuracao;

import com.pulseapi.entity.TipoNotificacao;

import java.time.LocalDateTime;

public record ConfiguracaoNotificacaoResponseDTO(
        Long id,
        TipoNotificacao tipo,
        Boolean notificacaoSistemaAtiva,
        Boolean notificacaoEmailAtiva,
        LocalDateTime atualizadoEm
) {
}