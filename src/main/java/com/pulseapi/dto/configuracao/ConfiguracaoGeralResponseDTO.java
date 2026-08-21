package com.pulseapi.dto.configuracao;

import java.time.LocalDateTime;

public record ConfiguracaoGeralResponseDTO(
        Long id,
        Boolean controleAcessoTurnoAtivo,
        Integer toleranciaTurnoMinutos,
        LocalDateTime atualizadoEm
) {
}