package com.pulseapi.service;

import com.pulseapi.event.ProducaoIniciadaEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class FilaImpressaoInicioListener {

    private static final Logger log =
            LoggerFactory.getLogger(
                    FilaImpressaoInicioListener.class
            );

    private final FilaImpressaoProcessadorService processadorService;

    public FilaImpressaoInicioListener(
            FilaImpressaoProcessadorService processadorService
    ) {
        this.processadorService = processadorService;
    }

    /**
     * A comunicação com a impressora acontece somente depois
     * que a transação de início da produção foi confirmada.
     */
    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void aoIniciarProducao(
            ProducaoIniciadaEvent evento
    ) {
        try {
            processadorService.prepararInicioProducao(
                    evento.equipamentoId()
            );

        } catch (RuntimeException exception) {
            log.error(
                    "A produção {} foi iniciada, mas o abastecimento inicial "
                            + "do equipamento {} falhou: {}",
                    evento.producaoId(),
                    evento.equipamentoId(),
                    exception.getMessage(),
                    exception
            );
        }
    }
}