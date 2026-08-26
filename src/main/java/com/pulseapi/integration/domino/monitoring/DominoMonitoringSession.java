package com.pulseapi.integration.domino.monitoring;

import com.pulseapi.integration.domino.DominoCommands;
import com.pulseapi.integration.domino.DominoResponseReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicBoolean;
import com.pulseapi.integration.domino.dto.DominoStatusResponse;
import com.pulseapi.integration.domino.parser.DominoStatusParser;
import java.util.ArrayList;
import java.util.List;

// responsável por conectar, ativar o modo 6, ler os eventos e realizar heartbeat somente após 60 segundos sem tráfego.
    public class DominoMonitoringSession implements Runnable, AutoCloseable {

    private static final Logger log =
            LoggerFactory.getLogger(DominoMonitoringSession.class);

    private final DominoMonitoringEndpoint endpoint;
    private final DominoMonitoringEventHandler eventHandler;
    private final DominoMonitoringProperties properties;

    private final AtomicBoolean running = new AtomicBoolean(true);

    private volatile Socket socket;

    public DominoMonitoringSession(
            DominoMonitoringEndpoint endpoint,
            DominoMonitoringEventHandler eventHandler,
            DominoMonitoringProperties properties
    ) {
        this.endpoint = endpoint;
        this.eventHandler = eventHandler;
        this.properties = properties;
    }

    private void aguardarInicializacao() throws InterruptedException {
        long limite =
                properties.getStartupJitterMaxMs();

        if (limite <= 0) {
            return;
        }

        long espera =
                ThreadLocalRandom.current()
                        .nextLong(limite + 1);

        log.debug(
                "Sessão Domino do equipamento {} iniciará em {} ms",
                endpoint.equipamentoId(),
                espera
        );

        Thread.sleep(espera);
    }


    @Override
    public void run() {
        long reconnectDelay =
                properties.getInitialReconnectDelayMs();

        try {
            aguardarInicializacao();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            return;
        }

        while (running.get() && !Thread.currentThread().isInterrupted()) {
            try {
                conectarEMonitorar();

                reconnectDelay =
                        properties.getInitialReconnectDelayMs();

            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
                break;

            } catch (Exception exception) {
                if (!running.get()) {
                    break;
                }

                eventHandler.desconectado(
                        endpoint,
                        exception
                );

                aguardarReconexao(reconnectDelay);

                reconnectDelay = Math.min(
                        reconnectDelay * 2,
                        properties.getMaxReconnectDelayMs()
                );
            } finally {
                fecharSocket();
            }
        }

        log.info(
                "Sessão de monitoramento encerrada: equipamento={}",
                endpoint.equipamentoId()
        );
    }

    private void conectarEMonitorar() throws Exception {
        Socket novoSocket = new Socket();

        this.socket = novoSocket;

        novoSocket.connect(
                new InetSocketAddress(
                        endpoint.host(),
                        endpoint.porta()
                ),
                properties.getConnectionTimeoutMs()
        );

        novoSocket.setKeepAlive(true);
        novoSocket.setTcpNoDelay(true);
        novoSocket.setSoTimeout(
                properties.getInactivityTimeoutMs()
        );

        InputStream input = novoSocket.getInputStream();
        OutputStream output = novoSocket.getOutputStream();

        ativarMonitoramento(
                input,
                output
        );

        eventHandler.conectado(endpoint);

        sincronizarEstadoInicial(
                input,
                output
        );

        int heartbeatsSemResposta = 0;

        while (running.get() && !novoSocket.isClosed()) {
            try {
                byte[] frame =
                        DominoResponseReader.ler(input);

                if (frame.length == 0) {
                    throw new IllegalStateException(
                            "A impressora encerrou a conexão de monitoramento."
                    );
                }

                heartbeatsSemResposta = 0;

                eventHandler.processar(
                        endpoint,
                        frame
                );

            } catch (SocketTimeoutException exception) {
                heartbeatsSemResposta++;

                if (heartbeatsSemResposta
                        >= properties.getMaxMissedHeartbeats()) {
                    throw new SocketTimeoutException(
                            "A impressora não respondeu a "
                                    + heartbeatsSemResposta
                                    + " heartbeats consecutivos."
                    );
                }

                enviarHeartbeat(output);
            }
        }
    }

    private void ativarMonitoramento(
            InputStream input,
            OutputStream output
    ) throws Exception {
        byte[] comando =
                DominoCommands.ativarMonitoramentoStatus();

        output.write(comando);
        output.flush();

        byte[] resposta =
                DominoResponseReader.ler(input);

        if (resposta.length == 0) {
            throw new IllegalStateException(
                    "A impressora não respondeu à ativação do monitoramento."
            );
        }

        int primeiroByte = resposta[0] & 0xFF;

        if (primeiroByte == DominoCommands.NAK) {
            throw new IllegalStateException(
                    "A impressora recusou a ativação do monitoramento."
            );
        }

        if (primeiroByte != DominoCommands.ACK) {
            // Algumas versões podem responder com um status imediatamente.
            eventHandler.processar(
                    endpoint,
                    resposta
            );
        }
    }

    private void enviarHeartbeat(
            OutputStream output
    ) throws Exception {
        log.debug(
                "Enviando heartbeat Domino: equipamento={}",
                endpoint.equipamentoId()
        );

        output.write(
                DominoCommands.consultarStatusAtual()
        );

        output.flush();

        /*
         * A resposta não é lida aqui.
         * O mesmo loop principal continuará sendo o único
         * consumidor do InputStream.
         */
    }

    private void aguardarReconexao(long delayMs) {
        long jitter =
                ThreadLocalRandom.current()
                        .nextLong(0, 1001);

        long total = delayMs + jitter;

        log.info(
                "Nova tentativa de conexão Domino em {} ms: equipamento={}",
                total,
                endpoint.equipamentoId()
        );

        try {
            Thread.sleep(total);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
        }
    }

    public DominoMonitoringEndpoint getEndpoint() {
        return endpoint;
    }

    public boolean isRunning() {
        return running.get();
    }

    @Override
    public void close() {
        running.set(false);
        fecharSocket();
    }

    private void fecharSocket() {
        Socket socketAtual = this.socket;
        this.socket = null;

        if (socketAtual == null) {
            return;
        }

        try {
            socketAtual.close();
        } catch (Exception exception) {
            log.debug(
                    "Erro ao fechar socket de monitoramento do equipamento {}: {}",
                    endpoint.equipamentoId(),
                    exception.getMessage()
            );
        }
    }

    private void sincronizarEstadoInicial(
            InputStream input,
            OutputStream output
    ) throws Exception {
        byte[] frameAtual =
                consultarStatusSincrono(
                        input,
                        output,
                        DominoCommands.consultarStatusAtual(),
                        (byte) 0x43 // C
                );

        DominoStatusResponse statusAtual =
                DominoStatusParser.parse(frameAtual);

        List<byte[]> historicos =
                new ArrayList<>();

        for (
                int indice = 0;
                indice < properties.getMaxHistoricalEvents();
                indice++
        ) {
            byte[] frameHistorico =
                    consultarStatusSincrono(
                            input,
                            output,
                            DominoCommands.consultarHistoricoStatus(),
                            (byte) 0x48 // H
                    );

            DominoStatusResponse statusHistorico =
                    DominoStatusParser.parse(frameHistorico);

            /*
             * Quando não existem mais eventos históricos,
             * a impressora devolve seu status atual.
             */
            if (mesmoEstado(
                    statusHistorico,
                    statusAtual
            )) {
                break;
            }

            historicos.add(frameHistorico);
        }

        /*
         * Os históricos são entregues do mais antigo
         * para o mais recente.
         */
        historicos.forEach(frame ->
                eventHandler.processar(
                        endpoint,
                        frame
                )
        );

        /*
         * Por último aplicamos o estado atual, garantindo
         * que o tracker termine sincronizado.
         */
        eventHandler.processar(
                endpoint,
                frameAtual
        );

        log.info(
                "Estado Domino sincronizado: equipamento={} historicosRecuperados={} codigoAtual={}",
                endpoint.equipamentoId(),
                historicos.size(),
                statusAtual.codigoStatus()
        );
    }

    private byte[] consultarStatusSincrono(
            InputStream input,
            OutputStream output,
            byte[] comando,
            byte tipoEsperado
    ) throws Exception {
        output.write(comando);
        output.flush();

        /*
         * Um evento espontâneo pode chegar entre o envio
         * da consulta e sua resposta.
         */
        for (int tentativa = 0; tentativa < 20; tentativa++) {
            byte[] frame =
                    DominoResponseReader.ler(input);

            if (frame.length == 0) {
                throw new IllegalStateException(
                        "A impressora encerrou a conexão durante a sincronização."
                );
            }

            int primeiroByte =
                    frame[0] & 0xFF;

            if (primeiroByte == DominoCommands.NAK) {
                throw new IllegalStateException(
                        "A impressora recusou uma consulta de status."
                );
            }

            if (primeiroByte == DominoCommands.ACK) {
                continue;
            }

            if (ehRespostaStatus(
                    frame,
                    tipoEsperado
            )) {
                return frame;
            }

            /*
             * Frame espontâneo: processamos normalmente,
             * mantendo este método como único leitor.
             */
            eventHandler.processar(
                    endpoint,
                    frame
            );
        }

        throw new IllegalStateException(
                "A resposta esperada de status não foi recebida."
        );
    }

    private boolean ehRespostaStatus(
            byte[] frame,
            byte tipoEsperado
    ) {
        return frame.length >= 4
                && frame[0] == DominoCommands.ESC
                && frame[1] == 0x31
                && frame[2] == tipoEsperado;
    }

    private boolean mesmoEstado(
            DominoStatusResponse primeiro,
            DominoStatusResponse segundo
    ) {
        return primeiro.codigoStatus()
                .equals(segundo.codigoStatus())
                && primeiro.jato() == segundo.jato();
    }

}