package com.pulseapi.integration.domino.monitoring;

import com.pulseapi.integration.domino.DominoCommands;
import com.pulseapi.integration.domino.dto.DominoStatusResponse;
import com.pulseapi.integration.domino.parser.DominoStatusParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import java.util.HexFormat;
import com.pulseapi.integration.domino.service.DominoOcorrenciaService;
import com.pulseapi.integration.domino.service.DominoConnectionStatusService;

@Component
public class DominoMonitoringEventHandler {

    private static final Logger log =
            LoggerFactory.getLogger(DominoMonitoringEventHandler.class);

    private final DominoStatusStateTracker stateTracker;
    private final DominoOcorrenciaService ocorrenciaService;
    private final DominoMonitoringProperties properties;
    private final DominoConnectionStatusService connectionStatusService;

    public DominoMonitoringEventHandler(
            DominoStatusStateTracker stateTracker,
            DominoOcorrenciaService ocorrenciaService,
            DominoMonitoringProperties properties,
            DominoConnectionStatusService connectionStatusService
    ) {
        this.stateTracker = stateTracker;
        this.ocorrenciaService = ocorrenciaService;
        this.properties = properties;
        this.connectionStatusService = connectionStatusService;
    }

    public void conectado(DominoMonitoringEndpoint endpoint) {
        log.info(
                "Monitoramento Domino conectado: equipamento={} host={}:{}",
                endpoint.equipamentoId(),
                endpoint.host(),
                endpoint.porta()
        );

        try {
            connectionStatusService.registrarConexao(
                    endpoint.equipamentoId()
            );
        } catch (Exception exception) {
            log.error(
                    "Erro ao atualizar conexão do equipamento {}",
                    endpoint.equipamentoId(),
                    exception
            );
        }
    }

    public void desconectado(
            DominoMonitoringEndpoint endpoint,
            Exception exception
    ) {
        log.warn(
                "Monitoramento Domino desconectado: equipamento={} motivo={}",
                endpoint.equipamentoId(),
                exception.getMessage()
        );

        try {
            connectionStatusService.registrarDesconexao(
                    endpoint.equipamentoId()
            );
        } catch (Exception statusException) {
            log.error(
                    "Erro ao atualizar desconexão do equipamento {}",
                    endpoint.equipamentoId(),
                    statusException
            );
        }
    }

    public void processar(
            DominoMonitoringEndpoint endpoint,
            byte[] frame
    ) {
        if (frame == null || frame.length == 0) {
            return;
        }

        int primeiroByte = frame[0] & 0xFF;

        if (primeiroByte == DominoCommands.ACK) {
            log.debug(
                    "ACK recebido no monitoramento do equipamento {}",
                    endpoint.equipamentoId()
            );
            return;
        }

        if (primeiroByte == DominoCommands.NAK) {
            log.warn(
                    "NAK recebido no monitoramento do equipamento {}",
                    endpoint.equipamentoId()
            );
            return;
        }

        try {
            DominoStatusResponse status =
                    DominoStatusParser.parse(frame);

            DominoStatusStateChange change =
                    stateTracker.processar(
                            endpoint.equipamentoId(),
                            status
                    );

            switch (change.transition()) {
                case NOVA_FALHA -> log.warn(
                        "Nova falha Domino: equipamento={} codigo={} descricao={} jato={}",
                        endpoint.equipamentoId(),
                        status.codigoStatus(),
                        status.descricao(),
                        status.jato()
                );

                case FALHA_REPETIDA -> log.debug(
                        "Falha Domino repetida: equipamento={} codigo={} recebimentos={}",
                        endpoint.equipamentoId(),
                        status.codigoStatus(),
                        change.quantidadeRecebimentos()
                );

                case FALHA_ATUALIZADA -> log.warn(
                        "Falha Domino atualizada: equipamento={} anterior={} atual={}",
                        endpoint.equipamentoId(),
                        change.anterior().codigoStatus(),
                        status.codigoStatus()
                );

                case NORMALIZADA -> log.info(
                        "Falha Domino normalizada: equipamento={} anterior={} normalizacao={}",
                        endpoint.equipamentoId(),
                        change.anterior().codigoStatus(),
                        status.codigoStatus()
                );

                case STATUS_INFORMATIVO -> log.debug(
                        "Status Domino informativo: equipamento={} codigo={}",
                        endpoint.equipamentoId(),
                        status.codigoStatus()
                );
            }

            persistirTransicao(
                    endpoint,
                    status,
                    change
            );

        } catch (IllegalArgumentException exception) {
            log.warn(
                    "Frame Domino não reconhecido: equipamento={} tamanho={} hex={} motivo={}",
                    endpoint.equipamentoId(),
                    frame.length,
                    HexFormat.ofDelimiter(" ")
                            .withUpperCase()
                            .formatHex(frame),
                    exception.getMessage()
            );
        }
    }

    private void persistirTransicao(
            DominoMonitoringEndpoint endpoint,
            DominoStatusResponse status,
            DominoStatusStateChange change
    ) {
        if (!properties.isOcorrenciasEnabled()) {
            return;
        }

        try {
            char categoria =
                    status.codigoStatus().charAt(0);

            if (categoria == '0') {
                /*
                 * A recuperação informada pela máquina não resolve
                 * automaticamente a ocorrência. A conclusão continua
                 * sendo responsabilidade de um usuário.
                 */
                return;
            }

            /*
             * Heartbeats repetidos não precisam consultar nem
             * atualizar o banco.
             */
            if (change.transition()
                    == DominoStatusTransition.FALHA_REPETIDA) {
                return;
            }

            if (categoria == '1' || categoria == '2') {
                ocorrenciaService
                        .registrarOuAtualizarFalha(
                                endpoint.equipamentoId(),
                                status
                        )
                        .ifPresent(ocorrenciaId ->
                                log.warn(
                                        "Ocorrência Domino registrada/atualizada: ocorrencia={} equipamento={} codigo={}",
                                        ocorrenciaId,
                                        endpoint.equipamentoId(),
                                        status.codigoStatus()
                                )
                        );
            }

        } catch (Exception exception) {
            /*
             * Um erro no banco nunca deve encerrar a conexão
             * persistente com a impressora.
             */
            log.error(
                    "Erro ao persistir ocorrência Domino: equipamento={} codigo={}",
                    endpoint.equipamentoId(),
                    status.codigoStatus(),
                    exception
            );
        }
    }
}