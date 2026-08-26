package com.pulseapi.integration.domino.service;

import com.pulseapi.entity.Equipamento;
import com.pulseapi.integration.domino.DominoCommands;
import com.pulseapi.integration.domino.DominoTcpClient;
import com.pulseapi.integration.domino.dto.*;
import com.pulseapi.integration.domino.exception.DominoCommunicationException;
import com.pulseapi.integration.domino.parser.*;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class DominoService {

    private final DominoTcpClient dominoTcpClient;
    private final DominoHistoricoService historicoService;

    public DominoService(
            DominoTcpClient dominoTcpClient,
            DominoHistoricoService historicoService
    ) {
        this.dominoTcpClient = dominoTcpClient;
        this.historicoService = historicoService;
    }

    /*
     * ============================================================
     * METODO CENTRAL DE COMUNICAÇÃO
     * ============================================================
     *
     * Responsabilidades:
     * - enviar comando TCP;
     * - registrar comunicação com sucesso;
     * - registrar falha de comunicação;
     * - centralizar tratamento das exceções.
     */
    private byte[] executarComHistorico(
            Equipamento equipamento,
            String nomeComando,
            byte[] comando,
            boolean registrarHistorico
    ) {
        try {
            byte[] resposta = dominoTcpClient.enviar(
                    equipamento.getIp(),
                    equipamento.getPorta(),
                    nomeComando,
                    comando
            );

            if (registrarHistorico) {
                registrarHistoricoSucessoSeguro(
                        equipamento,
                        nomeComando,
                        comando,
                        resposta
                );
            }

            return resposta;

        } catch (Exception e) {

            // Erros são sempre registrados, mesmo em comandos de polling.
            registrarHistoricoErroSeguro(
                    equipamento,
                    nomeComando,
                    comando,
                    e.getMessage()
            );

            if (e instanceof DominoCommunicationException dominoException) {
                throw dominoException;
            }

            throw new DominoCommunicationException(
                    "Falha na comunicação com a impressora Domino durante "
                            + nomeComando
                            + ": "
                            + e.getMessage(),
                    e
            );
        }
    }

    /*
     * ============================================================
     * HISTÓRICO SEGURO
     * ============================================================
     */

    private void registrarHistoricoSucessoSeguro(
            Equipamento equipamento,
            String nomeComando,
            byte[] comando,
            byte[] resposta
    ) {
        try {
            historicoService.registrarSucesso(
                    equipamento,
                    nomeComando,
                    comando,
                    resposta
            );

        } catch (Exception e) {
            System.err.println(
                    "Falha ao registrar histórico Domino do comando "
                            + nomeComando
                            + ": "
                            + e.getMessage()
            );
        }
    }

    private void registrarHistoricoErroSeguro(
            Equipamento equipamento,
            String nomeComando,
            byte[] comando,
            String mensagemErro
    ) {
        try {
            historicoService.registrarErro(
                    equipamento,
                    nomeComando,
                    comando,
                    mensagemErro
            );

        } catch (Exception e) {
            System.err.println(
                    "Falha ao registrar histórico de erro Domino do comando "
                            + nomeComando
                            + ": "
                            + e.getMessage()
            );
        }
    }

    /*
     * ============================================================
     * STATUS
     * ============================================================
     */

    public DominoStatusResponse consultarStatus(
            Equipamento equipamento
    ) {

        byte[] resposta = executarComHistorico(
                equipamento,
                "CONSULTAR_STATUS_ATUAL",
                DominoCommands.consultarStatusAtual(),
                true
        );



        try {
            DominoStatusResponse status = DominoStatusParser.parse(resposta);

            System.out.println(
                    "STATUS DOMINO | codigo="
                            + status.codigoStatus()
                            + " | descricao="
                            + status.descricao()
                            + " | severidade="
                            + status.severidade()
                            + " | jato="
                            + status.jato()
                            + " | horario="
                            + status.horarioAlteracao()
            );

            return status;

        } catch (IllegalArgumentException e) {
            throw new DominoCommunicationException(
                    "A impressora retornou uma resposta de status inválida: "
                            + e.getMessage(),
                    e
            );
        }
    }

    /*
     * ============================================================
     * CONFIGURAÇÃO
     * ============================================================
     */

    public DominoConfigurationResponse consultarConfiguracao(
            Equipamento equipamento
    ) {

        byte[] resposta = executarComHistorico(
                equipamento,
                "CONSULTAR_CONFIGURACAO",
                DominoCommands.consultarConfiguracao(),
                true
        );

        try {
            return DominoConfigurationParser.parse(resposta);

        } catch (IllegalArgumentException e) {
            throw new DominoCommunicationException(
                    "A impressora retornou uma configuração inválida: "
                            + e.getMessage(),
                    e
            );
        }
    }

    /*
     * ============================================================
     * IDENTIDADE
     * ============================================================
     */

    public DominoIdentityResponse consultarIdentidade(
            Equipamento equipamento
    ) {

        byte[] resposta = executarComHistorico(
                equipamento,
                "CONSULTAR_IDENTIDADE",
                DominoCommands.consultarIdentidade(),
                true
        );

        try {
            return DominoIdentityParser.parse(resposta);

        } catch (IllegalArgumentException e) {
            throw new DominoCommunicationException(
                    "A impressora retornou uma identidade inválida: "
                            + e.getMessage(),
                    e
            );
        }
    }

    /*
     * ============================================================
     * FIFO - QUANTIDADE
     * ============================================================
     */

    public DominoFifoCountResponse consultarQuantidadeFifo(
            Equipamento equipamento
    ) {

        byte[] resposta = executarComHistorico(
                equipamento,
                "CONSULTAR_QUANTIDADE_FIFO",
                DominoCommands.consultarQuantidadeItensFifoTcp(),
                false
        );

        try {
            return DominoFifoCountParser.parse(resposta);

        } catch (IllegalArgumentException e) {
            throw new DominoCommunicationException(
                    "A impressora retornou uma resposta inválida ao consultar o FIFO: "
                            + e.getMessage(),
                    e
            );
        }
    }

    /*
     * ============================================================
     * FIFO - LIMPAR E ENVIAR
     * ============================================================
     * O fluxo automático da fila utiliza adicionarDadosFifo(),
     * e não este metodo, justamente para não apagar itens
     * existentes silenciosamente.
     */

    public DominoFifoSendResponse enviarDadosFifo(
            Equipamento equipamento,
            String dados
    ) {

        /*
         * Primeiro limpa o FIFO.
         */
        byte[] respostaLimpeza = executarComHistorico(
                equipamento,
                "LIMPAR_FIFO_TCP",
                DominoCommands.limparFifoTcp(),
                true
        );

        validarAck(
                respostaLimpeza,
                "limpeza do FIFO"
        );

        /*
         * Depois envia o novo bloco.
         */
        byte[] respostaEnvio = executarComHistorico(
                equipamento,
                "ENVIAR_DADOS_FIFO",
                DominoCommands.enviarDadosFifo(dados),
                true
        );

        validarAck(
                respostaEnvio,
                "envio ao FIFO"
        );

        int tamanho = dados.getBytes(
                StandardCharsets.US_ASCII
        ).length;

        return new DominoFifoSendResponse(
                true,
                dados,
                tamanho,
                "Dados enviados ao FIFO com sucesso."
        );
    }

    /*
     * ============================================================
     * FIFO - ADICIONAR SEM LIMPAR
     * ============================================================
     *
     * Esse é o metodo utilizado pela fila automática.
     */

    public DominoFifoSendResponse adicionarDadosFifo(
            Equipamento equipamento,
            String dados
    ) {

        byte[] resposta = executarComHistorico(
                equipamento,
                "ADICIONAR_DADOS_FIFO",
                DominoCommands.enviarDadosFifo(dados),
                true
        );

        validarAck(
                resposta,
                "envio ao FIFO"
        );

        int tamanho = dados.getBytes(
                StandardCharsets.US_ASCII
        ).length;

        return new DominoFifoSendResponse(
                true,
                dados,
                tamanho,
                "Dados adicionados ao FIFO com sucesso."
        );
    }

    /*
     * ============================================================
     * LAYOUT ONLINE
     * ============================================================
     */

    public DominoLayoutOnlineResponse consultarLayoutOnline(
            Equipamento equipamento
    ) {

        byte[] resposta = executarComHistorico(
                equipamento,
                "CONSULTAR_LAYOUT_ONLINE",
                DominoCommands.consultarLayoutOnline(),
                true
        );

        try {
            return DominoLayoutOnlineParser.parse(resposta);

        } catch (IllegalArgumentException e) {
            throw new DominoCommunicationException(
                    "A impressora retornou uma resposta inválida ao consultar o layout online: "
                            + e.getMessage(),
                    e
            );
        }
    }

    /*
     * ============================================================
     * SELECIONAR LAYOUT
     * ============================================================
     */

    public void selecionarLayout(
            Equipamento equipamento,
            String nomeLayout
    ) {

        String nomeComando =
                "SELECIONAR_LAYOUT_" + nomeLayout;

        byte[] resposta = executarComHistorico(
                equipamento,
                nomeComando,
                DominoCommands.selecionarLayout(nomeLayout),
                true
        );

        validarAck(
                resposta,
                "seleção do layout " + nomeLayout
        );
    }

    /*
     * ============================================================
     * CONTADOR DE PRODUTOS
     * ============================================================
     */

    public DominoProductCountResponse consultarContadorProduto(
            Equipamento equipamento
    ) {

        byte[] resposta = executarComHistorico(
                equipamento,
                "CONSULTAR_CONTADOR_PRODUTO_1",
                DominoCommands.consultarContadorProduto1(),
                false
        );

        try {
            return DominoProductCountParser.parse(resposta);

        } catch (IllegalArgumentException e) {
            throw new DominoCommunicationException(
                    "A impressora retornou um contador de produtos inválido: "
                            + e.getMessage(),
                    e
            );
        }
    }

    /*
     * ============================================================
     * VALIDAÇÃO ACK / NAK
     * ============================================================
     */

    private void validarAck(
            byte[] resposta,
            String operacao
    ) {

        if (resposta == null || resposta.length == 0) {
            throw new DominoCommunicationException(
                    "A impressora não respondeu durante a "
                            + operacao
                            + "."
            );
        }

        int primeiroByte =
                resposta[0] & 0xFF;

        /*
         * ACK
         */
        if (primeiroByte == 0x06) {
            return;
        }

        /*
         * NAK
         */
        if (primeiroByte == 0x15) {

            String codigo =
                    resposta.length >= 4
                            ? new String(
                            resposta,
                            1,
                            3,
                            StandardCharsets.US_ASCII
                    )
                            : "desconhecido";

            throw new DominoCommunicationException(
                    "A impressora recusou a operação. Código NAK: "
                            + codigo
            );
        }

        throw new DominoCommunicationException(
                "Resposta inesperada da impressora durante a "
                        + operacao
                        + "."
        );
    }
}