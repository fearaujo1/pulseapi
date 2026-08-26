package com.pulseapi.integration.domino.monitoring;

import com.pulseapi.entity.Equipamento;
import com.pulseapi.entity.StatusEquipamento;
import com.pulseapi.repository.EquipamentoRepository;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class DominoMonitoringManager {

    private static final Logger log =
            LoggerFactory.getLogger(DominoMonitoringManager.class);

    private final EquipamentoRepository equipamentoRepository;
    private final DominoMonitoringEventHandler eventHandler;
    private final DominoMonitoringProperties properties;

    private final ExecutorService executor =
            Executors.newVirtualThreadPerTaskExecutor();

    private final Map<Long, SessionHolder> sessions =
            new ConcurrentHashMap<>();

    public DominoMonitoringManager(
            EquipamentoRepository equipamentoRepository,
            DominoMonitoringEventHandler eventHandler,
            DominoMonitoringProperties properties
    ) {
        this.equipamentoRepository = equipamentoRepository;
        this.eventHandler = eventHandler;
        this.properties = properties;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void inicializar() {
        if (!properties.isEnabled()) {
            log.info("Monitoramento automático Domino está desativado.");
            return;
        }

        reconciliar();
    }

    @Scheduled(
            fixedDelayString =
                    "${pulseapi.domino.monitoramento.reconciliation-interval-ms:30000}",
            initialDelayString =
                    "${pulseapi.domino.monitoramento.reconciliation-interval-ms:30000}"
    )
    public synchronized void reconciliar() {
        if (!properties.isEnabled()) {
            encerrarTodas();
            return;
        }

        Map<Long, DominoMonitoringEndpoint> desejados =
                equipamentoRepository.findAll()
                        .stream()
                        .filter(this::deveMonitorar)
                        .map(this::toEndpoint)
                        .collect(Collectors.toMap(
                                DominoMonitoringEndpoint::equipamentoId,
                                Function.identity()
                        ));

        sessions.entrySet().removeIf(entry -> {
            DominoMonitoringEndpoint desejado =
                    desejados.get(entry.getKey());

            boolean remover =
                    desejado == null
                            || !desejado.equals(
                            entry.getValue().endpoint()
                    );

            if (remover) {
                encerrar(entry.getValue());
            }

            return remover;
        });

        desejados.forEach((equipamentoId, endpoint) ->
                sessions.computeIfAbsent(
                        equipamentoId,
                        ignored -> iniciar(endpoint)
                )
        );
    }

    private boolean deveMonitorar(Equipamento equipamento) {

        boolean equipamentoSelecionado =
                properties.isTodosEquipamentosEnabled()
                        || properties.getEquipamentoIds()
                        .contains(equipamento.getId());

        if (!equipamentoSelecionado) {
            return false;
        }

        return equipamento.getId() != null
                && equipamento.getIp() != null
                && !equipamento.getIp().isBlank()
                && equipamento.getPorta() != null
                && equipamento.getPorta() >= 1
                && equipamento.getPorta() <= 65535
                && equipamento.getProtocolo() != null
                && equipamento.getProtocolo()
                .equalsIgnoreCase("CODENET")
                && equipamento.getStatus()
                != StatusEquipamento.INATIVO;
    }

    private DominoMonitoringEndpoint toEndpoint(
            Equipamento equipamento
    ) {
        return new DominoMonitoringEndpoint(
                equipamento.getId(),
                equipamento.getNome(),
                equipamento.getIp(),
                equipamento.getPorta()
        );
    }

    private SessionHolder iniciar(
            DominoMonitoringEndpoint endpoint
    ) {
        DominoMonitoringSession session =
                new DominoMonitoringSession(
                        endpoint,
                        eventHandler,
                        properties
                );

        Future<?> future =
                executor.submit(session);

        log.info(
                "Sessão Domino agendada: equipamento={} host={}:{}",
                endpoint.equipamentoId(),
                endpoint.host(),
                endpoint.porta()
        );

        return new SessionHolder(
                endpoint,
                session,
                future
        );
    }

    private void encerrar(SessionHolder holder) {
        holder.session().close();
        holder.future().cancel(true);

        log.info(
                "Sessão Domino removida: equipamento={}",
                holder.endpoint().equipamentoId()
        );
    }

    private void encerrarTodas() {
        sessions.values().forEach(this::encerrar);
        sessions.clear();
    }

    @PreDestroy
    public void destruir() {
        encerrarTodas();
        executor.shutdownNow();
    }

    private record SessionHolder(
            DominoMonitoringEndpoint endpoint,
            DominoMonitoringSession session,
            Future<?> future
    ) {
    }
}