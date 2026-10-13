package com.pulseapi.websocket;

import com.pulseapi.dto.websocket.AtualizacaoTempoRealDTO;
import com.pulseapi.event.DashboardAtualizadoEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class DashboardWebSocketListener {

    private final SimpMessagingTemplate messagingTemplate;

    public DashboardWebSocketListener(
            SimpMessagingTemplate messagingTemplate
    ) {
        this.messagingTemplate = messagingTemplate;
    }

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT,
            fallbackExecution = true
    )
    public void publicar(
            DashboardAtualizadoEvent evento
    ) {
        AtualizacaoTempoRealDTO mensagem =
                new AtualizacaoTempoRealDTO(
                        evento.tipo(),
                        evento.recursoId(),
                        evento.ocorridoEm()
                );

        messagingTemplate.convertAndSend(
                "/topic/dashboard",
                mensagem
        );
    }
}