package com.pulseapi.service;

import com.pulseapi.event.ProducaoIniciadaEvent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class FilaImpressaoInicioListener {

    private final FilaImpressaoProcessadorService processadorService;

    public FilaImpressaoInicioListener(
            FilaImpressaoProcessadorService processadorService
    ) {
        this.processadorService = processadorService;
    }

    /**
     * A preparação da impressora acontece antes da confirmação
     * da transação que inicia a produção.
     *
     * Se qualquer comando da impressora falhar, a exceção será
     * propagada e toda a transação será revertida.
     *
     * Dessa forma, a produção não ficará como EM_ANDAMENTO
     * quando a impressora estiver indisponível.
     */
    @TransactionalEventListener(
            phase = TransactionPhase.BEFORE_COMMIT
    )
    public void aoIniciarProducao(
            ProducaoIniciadaEvent evento
    ) {
        processadorService.prepararInicioProducao(
                evento.equipamentoId()
        );
    }
}