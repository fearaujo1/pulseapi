package com.pulseapi.dto.configuracao;

import jakarta.validation.constraints.NotNull;

public record ConfiguracaoNotificacaoUpdateDTO(

        @NotNull(
                message = "Informe se a notificação no sistema está ativa."
        )
        Boolean notificacaoSistemaAtiva,

        @NotNull(
                message = "Informe se a notificação por e-mail está ativa."
        )
        Boolean notificacaoEmailAtiva

) {
}