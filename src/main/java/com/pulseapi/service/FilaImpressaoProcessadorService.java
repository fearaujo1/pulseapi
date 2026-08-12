package com.pulseapi.service;

import com.pulseapi.dto.fila.ConfirmacaoImpressaoResponseDTO;
import com.pulseapi.dto.fila.ProcessamentoFilaResponseDTO;
import com.pulseapi.dto.fila.SincronizacaoFilaResponseDTO;
import com.pulseapi.entity.Equipamento;
import com.pulseapi.entity.FilaImpressao;
import com.pulseapi.entity.StatusFilaImpressao;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.integration.domino.dto.DominoFifoCountResponse;
import com.pulseapi.integration.domino.dto.DominoLayoutOnlineResponse;
import com.pulseapi.integration.domino.service.DominoService;
import com.pulseapi.repository.FilaImpressaoRepository;
import org.springframework.stereotype.Service;
import com.pulseapi.integration.domino.dto.DominoProductCountResponse;
import java.time.LocalDateTime;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FilaImpressaoProcessadorService {

    private final FilaImpressaoRepository filaRepository;
    private final DominoService dominoService;

    public FilaImpressaoProcessadorService(
            FilaImpressaoRepository filaRepository,
            DominoService dominoService
    ) {
        this.filaRepository = filaRepository;
        this.dominoService = dominoService;
    }

    @Transactional
    public ProcessamentoFilaResponseDTO processarProximo(
            Long equipamentoId
    ) {
        FilaImpressao fila = filaRepository
                .findFirstByEquipamentoIdAndStatusOrderByOrdemFilaAsc(
                        equipamentoId,
                        StatusFilaImpressao.PENDENTE
                )
                .orElseThrow(() -> new BusinessException(
                        "Não existem registros pendentes para esse equipamento."
                ));

        Equipamento equipamento = fila.getEquipamento();

        validarConexaoEquipamento(equipamento);

        /*
         * 1. Descobre qual layout esse item da fila precisa utilizar.
         */
        String layoutEsperado = fila
                .getLayout()
                .getNomeNaImpressora();

        /*
         * 2. Consulta qual layout está atualmente online na impressora.
         */
        DominoLayoutOnlineResponse layoutAtual =
                dominoService.consultarLayoutOnline(
                        equipamento
                );

        /*
         * 3. Caso o layout correto ainda não esteja online,
         * solicita a troca para a impressora.
         */
        if (!layoutEsperado.equals(layoutAtual.nome())) {
            dominoService.selecionarLayout(
                    equipamento,
                    layoutEsperado
            );

            /*
             * 4. Consulta novamente para confirmar que a troca realmente ocorreu.
             */
            DominoLayoutOnlineResponse layoutConfirmado =
                    dominoService.consultarLayoutOnline(
                            equipamento
                    );

            if (!layoutEsperado.equals(layoutConfirmado.nome())) {
                throw new BusinessException(
                        "A impressora não confirmou o layout "
                                + layoutEsperado
                                + " como online."
                );
            }
        }

        /*
         * 5. A consulta do FIFO vem depois da seleção do layout,
         * porque trocar o layout pode zerar o FIFO físico.
         */
        DominoFifoCountResponse fifoAntes =
                dominoService.consultarQuantidadeFifo(
                        equipamento
                );

        /*
         * Primeira política segura:
         * só enviamos quando o FIFO físico está vazio.
         */
        if (fifoAntes.quantidadeItens() > 0) {
            throw new BusinessException(
                    "O FIFO da impressora possui "
                            + fifoAntes.quantidadeItens()
                            + " item(ns). Aguarde o consumo antes de enviar o próximo."
            );
        }

        DominoProductCountResponse contadorAntes =
                dominoService.consultarContadorProduto(
                        equipamento
                );

        fila.setContadorAntesEnvio(contadorAntes.quantidade());
        fila.setContadorCarregamento(null);
        fila.setContadorAposImpressao(null);
        fila.setStatus(StatusFilaImpressao.ENVIANDO);
        fila.setMensagemErro(null);
        fila.setTentativas(fila.getTentativas() + 1);

        filaRepository.saveAndFlush(fila);

        try {
            dominoService.adicionarDadosFifo(
                    equipamento,
                    fila.getPayloadMontado()
            );

            DominoFifoCountResponse fifoDepois =
                    dominoService.consultarQuantidadeFifo(
                            equipamento
                    );

            fila.setStatus(StatusFilaImpressao.ENVIADO_FIFO);
            fila.setEnviadoEm(LocalDateTime.now());
            fila.setMensagemErro(null);

            filaRepository.save(fila);

            return new ProcessamentoFilaResponseDTO(
                    fila.getId(),
                    equipamento.getId(),
                    fila.getOrdemFila(),
                    fila.getPayloadMontado(),
                    fila.getStatus(),
                    fifoAntes.quantidadeItens(),
                    fifoDepois.quantidadeItens(),
                    "Registro enviado ao FIFO com sucesso."
            );

        } catch (RuntimeException e) {
            fila.setStatus(StatusFilaImpressao.ERRO);
            fila.setMensagemErro(limitarMensagem(e.getMessage()));

            filaRepository.save(fila);

            throw e;
        }
    }

    private void validarConexaoEquipamento(Equipamento equipamento) {
        if (equipamento.getIp() == null
                || equipamento.getIp().isBlank()) {
            throw new BusinessException(
                    "O equipamento não possui IP configurado."
            );
        }

        if (equipamento.getPorta() == null) {
            throw new BusinessException(
                    "O equipamento não possui porta configurada."
            );
        }

        if (equipamento.getProtocolo() == null
                || !equipamento.getProtocolo()
                .equalsIgnoreCase("CODENET")) {
            throw new BusinessException(
                    "O equipamento não está configurado com o protocolo CODENET."
            );
        }
    }

    private String limitarMensagem(String mensagem) {
        if (mensagem == null || mensagem.isBlank()) {
            return "Erro desconhecido durante o envio ao FIFO.";
        }

        return mensagem.length() <= 1000
                ? mensagem
                : mensagem.substring(0, 1000);
    }

    @Transactional
    public ConfirmacaoImpressaoResponseDTO verificarConsumo(
            Long equipamentoId
    ) {
        FilaImpressao fila = filaRepository
                .findFirstByEquipamentoIdAndStatusOrderByOrdemFilaAsc(
                        equipamentoId,
                        StatusFilaImpressao.ENVIADO_FIFO
                )
                .orElseThrow(() -> new BusinessException(
                        "Não existe registro enviado ao FIFO aguardando confirmação."
                ));

        Equipamento equipamento = fila.getEquipamento();

        validarConexaoEquipamento(equipamento);

        DominoFifoCountResponse fifoAtual =
                dominoService.consultarQuantidadeFifo(
                        equipamento
                );

        DominoProductCountResponse contadorAtual =
                dominoService.consultarContadorProduto(
                        equipamento
                );

        Long contadorAntes = fila.getContadorAntesEnvio();

        if (contadorAntes == null) {
            fila.setStatus(StatusFilaImpressao.ERRO);
            fila.setMensagemErro(
                    "Registro enviado sem contador anterior. Não é possível confirmar a impressão."
            );

            filaRepository.save(fila);

            throw new BusinessException(
                    "O registro não possui o contador anterior ao envio."
            );
        }

        /*
         * O item ainda está fisicamente no FIFO.
         */
        if (fifoAtual.quantidadeItens() > 0) {
            return new ConfirmacaoImpressaoResponseDTO(
                    fila.getId(),
                    equipamento.getId(),
                    fila.getStatus(),
                    fifoAtual.quantidadeItens(),
                    null,
                    "O registro continua no FIFO aguardando o pulso. "
                            + "Contador atual: " + contadorAtual.quantidade()
            );
        }

        /*
         * O FIFO zerou, mas o contador não aumentou.
         * Pode ter ocorrido troca de layout, limpeza manual ou outro consumo
         * não confirmado como impressão.
         */
        if (contadorAtual.quantidade() <= contadorAntes) {
            return new ConfirmacaoImpressaoResponseDTO(
                    fila.getId(),
                    equipamento.getId(),
                    fila.getStatus(),
                    0,
                    null,
                    "O item saiu do FIFO, mas o contador de produtos não aumentou. "
                            + "A impressão ainda não foi confirmada."
            );
        }

        /*
         * FIFO zerou e contador aumentou:
         * impressão confirmada.
         */
        fila.setStatus(StatusFilaImpressao.IMPRESSO);
        fila.setImpressoEm(LocalDateTime.now());
        fila.setContadorAposImpressao(contadorAtual.quantidade());
        fila.setMensagemErro(null);

        filaRepository.save(fila);

        return new ConfirmacaoImpressaoResponseDTO(
                fila.getId(),
                equipamento.getId(),
                fila.getStatus(),
                0,
                fila.getImpressoEm(),
                "Impressão confirmada. O FIFO foi consumido e o contador aumentou de "
                        + contadorAntes
                        + " para "
                        + contadorAtual.quantidade()
                        + "."
        );
    }

    @Transactional
    public SincronizacaoFilaResponseDTO sincronizar(Long equipamentoId) {

        /*
         * Pode existir simultaneamente:
         *
         * 1 item PRONTO_IMPRESSAO:
         * será impresso no próximo pulso.
         *
         * 1 item ENVIADO_FIFO:
         * será carregado na tela no próximo pulso.
         */
        var prontoOptional = filaRepository
                .findFirstByEquipamentoIdAndStatusOrderByOrdemFilaAsc(
                        equipamentoId,
                        StatusFilaImpressao.PRONTO_IMPRESSAO
                );

        var enviadoOptional = filaRepository
                .findFirstByEquipamentoIdAndStatusOrderByOrdemFilaAsc(
                        equipamentoId,
                        StatusFilaImpressao.ENVIADO_FIFO
                );

        FilaImpressao registroReferencia = prontoOptional
                .orElseGet(() -> enviadoOptional.orElse(null));

        /*
         * Se não há item em processamento, verificamos se existe PENDENTE.
         */
        if (registroReferencia == null) {
            boolean possuiPendente =
                    filaRepository.existsByEquipamentoIdAndStatus(
                            equipamentoId,
                            StatusFilaImpressao.PENDENTE
                    );

            if (!possuiPendente) {
                return new SincronizacaoFilaResponseDTO(
                        equipamentoId,
                        null,
                        "FILA_OCIOSA",
                        null,
                        0,
                        "Não existem registros pendentes ou em processamento."
                );
            }

            ProcessamentoFilaResponseDTO processamento =
                    processarProximo(equipamentoId);

            return new SincronizacaoFilaResponseDTO(
                    equipamentoId,
                    processamento.filaId(),
                    "ENVIADO_AO_FIFO",
                    processamento.status().name(),
                    processamento.quantidadeFifoDepois(),
                    processamento.mensagem()
            );
        }

        Equipamento equipamento = registroReferencia.getEquipamento();

        validarConexaoEquipamento(equipamento);

        DominoFifoCountResponse fifoAtual =
                dominoService.consultarQuantidadeFifo(
                        equipamento
                );

        DominoProductCountResponse contadorAtual =
                dominoService.consultarContadorProduto(
                        equipamento
                );

        boolean confirmouImpressao = false;
        boolean carregouNovoItem = false;

        Long ultimoRegistroAlterado = null;
        StringBuilder mensagem = new StringBuilder();

        /*
         * ETAPA 1:
         * PRONTO_IMPRESSAO → IMPRESSO
         *
         * O item já estava na tela.
         * Se o contador aumentou depois do carregamento,
         * ocorreu o pulso que realmente imprimiu esse item.
         */
        if (prontoOptional.isPresent()) {
            FilaImpressao pronto = prontoOptional.get();

            Long contadorCarregamento =
                    pronto.getContadorCarregamento();

            if (contadorCarregamento == null) {
                pronto.setStatus(StatusFilaImpressao.ERRO);
                pronto.setMensagemErro(
                        "Registro PRONTO_IMPRESSAO sem contador de carregamento."
                );

                filaRepository.save(pronto);

                throw new BusinessException(
                        "O registro pronto para impressão não possui contador de carregamento."
                );
            }

            if (contadorAtual.quantidade() > contadorCarregamento) {
                pronto.setStatus(StatusFilaImpressao.IMPRESSO);
                pronto.setContadorAposImpressao(
                        contadorAtual.quantidade()
                );
                pronto.setImpressoEm(LocalDateTime.now());
                pronto.setMensagemErro(null);

                filaRepository.save(pronto);

                confirmouImpressao = true;
                ultimoRegistroAlterado = pronto.getId();

                mensagem.append(
                        "Item "
                                + pronto.getId()
                                + " confirmado como IMPRESSO. "
                );
            }
        }

        /*
         * ETAPA 2:
         * ENVIADO_FIFO → PRONTO_IMPRESSAO
         *
         * O FIFO precisa ter sido consumido e o contador precisa
         * ter aumentado em relação ao momento anterior ao envio.
         *
         * Isso significa que ocorreu o pulso que carregou os dados
         * na tela para a próxima impressão.
         */
        if (enviadoOptional.isPresent()) {
            FilaImpressao enviado = enviadoOptional.get();

            Long contadorAntes =
                    enviado.getContadorAntesEnvio();

            if (contadorAntes == null) {
                enviado.setStatus(StatusFilaImpressao.ERRO);
                enviado.setMensagemErro(
                        "Registro enviado sem contador anterior ao envio."
                );

                filaRepository.save(enviado);

                throw new BusinessException(
                        "O registro enviado ao FIFO não possui contador anterior."
                );
            }

            boolean fifoFoiConsumido =
                    fifoAtual.quantidadeItens() == 0;

            boolean contadorAumentou =
                    contadorAtual.quantidade() > contadorAntes;

            if (fifoFoiConsumido && contadorAumentou) {
                enviado.setStatus(
                        StatusFilaImpressao.PRONTO_IMPRESSAO
                );

                enviado.setContadorCarregamento(
                        contadorAtual.quantidade()
                );

                enviado.setMensagemErro(null);

                filaRepository.save(enviado);

                carregouNovoItem = true;
                ultimoRegistroAlterado = enviado.getId();

                mensagem.append(
                        "Item "
                                + enviado.getId()
                                + " carregado na tela e marcado como PRONTO_IMPRESSAO. "
                );
            }
        }

        /*
         * ETAPA 3:
         * Se não existe mais item ENVIADO_FIFO e o FIFO está vazio,
         * podemos abastecer a impressora com o próximo PENDENTE.
         *
         * Pode continuar existindo um item PRONTO_IMPRESSAO.
         * Isso é esperado: ele está na tela, enquanto o próximo
         * ficará aguardando dentro do FIFO.
         */
        boolean aindaExisteEnviado =
                filaRepository.existsByEquipamentoIdAndStatus(
                        equipamentoId,
                        StatusFilaImpressao.ENVIADO_FIFO
                );

        boolean possuiPendente =
                filaRepository.existsByEquipamentoIdAndStatus(
                        equipamentoId,
                        StatusFilaImpressao.PENDENTE
                );

        /*
         * Se acabamos de consumir o FIFO, ele está vazio.
         * Também fazemos nova consulta para evitar usar informação desatualizada.
         */
        if (!aindaExisteEnviado && possuiPendente) {

            DominoFifoCountResponse fifoDepoisTransicoes =
                    dominoService.consultarQuantidadeFifo(
                            equipamento
                    );

            if (fifoDepoisTransicoes.quantidadeItens() == 0) {
                ProcessamentoFilaResponseDTO processamento =
                        processarProximo(equipamentoId);

                ultimoRegistroAlterado =
                        processamento.filaId();

                mensagem.append(
                        "Próximo item "
                                + processamento.filaId()
                                + " enviado ao FIFO."
                );

                return new SincronizacaoFilaResponseDTO(
                        equipamentoId,
                        ultimoRegistroAlterado,
                        "ESTEIRA_AVANCADA",
                        processamento.status().name(),
                        processamento.quantidadeFifoDepois(),
                        mensagem.toString().trim()
                );
            }
        }

        /*
         * Nenhuma transição ocorreu.
         */
        if (!confirmouImpressao && !carregouNovoItem) {
            String acao;

            if (enviadoOptional.isPresent()
                    && fifoAtual.quantidadeItens() > 0) {
                acao = "AGUARDANDO_CARREGAMENTO";

                mensagem.append(
                        "O item permanece no FIFO aguardando o próximo pulso."
                );

            } else if (prontoOptional.isPresent()) {
                acao = "AGUARDANDO_IMPRESSAO";

                mensagem.append(
                        "O item está na tela aguardando o pulso que realizará a impressão."
                );

            } else {
                acao = "AGUARDANDO_EVENTO";

                mensagem.append(
                        "Nenhuma alteração detectada nesta sincronização."
                );
            }

            return new SincronizacaoFilaResponseDTO(
                    equipamentoId,
                    registroReferencia.getId(),
                    acao,
                    registroReferencia.getStatus().name(),
                    fifoAtual.quantidadeItens(),
                    mensagem.toString().trim()
            );
        }

        String statusFinal;

        if (carregouNovoItem) {
            statusFinal =
                    StatusFilaImpressao.PRONTO_IMPRESSAO.name();
        } else {
            statusFinal =
                    StatusFilaImpressao.IMPRESSO.name();
        }

        return new SincronizacaoFilaResponseDTO(
                equipamentoId,
                ultimoRegistroAlterado,
                "ESTEIRA_AVANCADA",
                statusFinal,
                fifoAtual.quantidadeItens(),
                mensagem.toString().trim()
        );
    }
}