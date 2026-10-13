package com.pulseapi.service;

import com.pulseapi.event.EquipamentoDesconectadoEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class EquipamentoDesconectadoListener {

    private static final Logger log =
            LoggerFactory.getLogger(
                    EquipamentoDesconectadoListener.class
            );

    private final ProducaoExecucaoService producaoExecucaoService;

    public EquipamentoDesconectadoListener(
            ProducaoExecucaoService producaoExecucaoService
    ) {
        this.producaoExecucaoService =
                producaoExecucaoService;
    }

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void aoPerderConexao(
            EquipamentoDesconectadoEvent evento
    ) {
        try {
            producaoExecucaoService
                    .pausarPorPerdaDeConexao(
                            evento.equipamentoId(),
                            evento.ocorridoEm()
                    );

        } catch (RuntimeException exception) {
            log.error(
                    "Não foi possível pausar automaticamente "
                            + "a produção do equipamento {}: {}",
                    evento.equipamentoId(),
                    exception.getMessage(),
                    exception
            );
        }
    }
}