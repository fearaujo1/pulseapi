package com.pulseapi.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pulseapi.dto.layout.MontarPayloadResponseDTO;
import com.pulseapi.dto.producao.ControleProducaoResponseDTO;
import com.pulseapi.dto.producao.InicioProducaoResponseDTO;
import com.pulseapi.entity.equipamento.Equipamento;
import com.pulseapi.entity.impressao.EtapaFilaProducao;
import com.pulseapi.entity.impressao.FilaImpressao;
import com.pulseapi.entity.impressao.LayoutImpressao;
import com.pulseapi.entity.impressao.StatusFilaImpressao;
import com.pulseapi.entity.producao.Producao;
import com.pulseapi.entity.producao.ProducaoItem;
import com.pulseapi.entity.producao.StatusProducao;
import com.pulseapi.entity.producao.StatusProducaoItem;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.FilaImpressaoRepository;
import com.pulseapi.repository.ProducaoItemRepository;
import com.pulseapi.repository.ProducaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.pulseapi.dto.producao.FinalizacaoAvaliacaoResponseDTO;
import com.pulseapi.dto.producao.ItemRetrabalhoResponseDTO;
import com.pulseapi.dto.producao.CancelamentoProducaoResponseDTO;
import com.pulseapi.dto.producao.CancelarProducaoRequestDTO;
import com.pulseapi.event.ProducaoIniciadaEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import com.pulseapi.integration.domino.service.DominoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ProducaoExecucaoService {

    private static final Logger log = LoggerFactory.getLogger(ProducaoExecucaoService.class);

    private static final Set<StatusFilaImpressao>
            STATUS_ATIVOS_FILA = Set.of(
            StatusFilaImpressao.PENDENTE,
            StatusFilaImpressao.ENVIANDO,
            StatusFilaImpressao.ENVIADO_FIFO,
            StatusFilaImpressao.PRONTO_IMPRESSAO
    );

    private final ProducaoRepository producaoRepository;
    private final ProducaoItemRepository itemRepository;
    private final FilaImpressaoRepository filaRepository;
    private final PayloadMontadorService payloadMontadorService;
    private final ObjectMapper objectMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final int capacidadeBuffer;
    private final DominoService dominoService;

    public ProducaoExecucaoService(
            ProducaoRepository producaoRepository,
            ProducaoItemRepository itemRepository,
            FilaImpressaoRepository filaRepository,
            PayloadMontadorService payloadMontadorService,
            ObjectMapper objectMapper,
            ApplicationEventPublisher eventPublisher,
            @Value(
                    "${pulseapi.fila-impressao.capacidade-buffer:50}"
            )
            int capacidadeBuffer,
            DominoService dominoService
    ) {
        if (capacidadeBuffer < 1 || capacidadeBuffer > 4096) {
            throw new IllegalArgumentException("A capacidade do buffer deve estar entre 1 e 4096");
        }

        this.producaoRepository = producaoRepository;
        this.itemRepository = itemRepository;
        this.filaRepository = filaRepository;
        this.payloadMontadorService = payloadMontadorService;
        this.objectMapper = objectMapper;
        this.eventPublisher = eventPublisher;
        this.capacidadeBuffer = capacidadeBuffer;
        this.dominoService = dominoService;
    }

    @Transactional
    public InicioProducaoResponseDTO iniciar(
            Long producaoId
    ) {
        Producao producao =
                buscarParaAtualizacao(producaoId);

        validarInicio(producao);

        Equipamento equipamento =
                producao.getEquipamentoPrincipal();

        LayoutImpressao layout =
                producao.getLayoutPrincipal();

        validarEquipamento(equipamento);
        validarLayout(layout);

        boolean equipamentoPossuiFilaAtiva =
                filaRepository
                        .existsByEquipamentoIdAndStatusIn(
                                equipamento.getId(),
                                STATUS_ATIVOS_FILA
                        );

        if (equipamentoPossuiFilaAtiva) {
            throw new BusinessException(
                    "O equipamento principal possui impressões pendentes ou em processamento."
            );
        }

        LocalDateTime agora = LocalDateTime.now();

        producao.setStatus(StatusProducao.EM_ANDAMENTO);
        producao.setIniciadaEm(agora);
        producaoRepository.saveAndFlush(producao);

        /*
         * Cria até capacidadeBuffer registros no banco.
         * Ainda não ocorre comunicação com a impressora.
         */
        abastecerJanelaPrincipal(producao);

        List<FilaImpressao> filasCriadas =
                filaRepository.
                        findAllByProducaoItemProducaoIdAndStatusInOrderByOrdemFilaAsc(
                                producaoId,
                                STATUS_ATIVOS_FILA
                        );

        List<Long> filaIds =
                filasCriadas
                        .stream()
                        .map(FilaImpressao::getId)
                        .toList();

        List<ProducaoItem> primeirosItens =
                itemRepository
                        .findTop2ByProducaoIdAndStatusOrderBySequenciaAsc(
                                producaoId,
                                StatusProducaoItem.AGUARDANDO
                        );

        /*
         * O evento é recebido somente depois do commit.
         * Depois disso, o listener:
         * 1. Confirma o Layout;
         * 2. Envia os itens ao FIFO;
         * 3. Executa o Software Print Go;
         * 4. Deixa o primeiro item pronto para impressão
         *
         */
        eventPublisher.publishEvent(new ProducaoIniciadaEvent(producao.getId(), equipamento.getId()));

        return new InicioProducaoResponseDTO(
                producao.getId(),
                producao.getStatus(),
                producao.getIniciadaEm(),
                filaIds.size(),
                filaIds,
                "Produção iniciada com "
                    + filaIds.size()
                    + " item(ns) preparados para o buffer da impressora."
        );
    }

    @Transactional
    public ControleProducaoResponseDTO pausar(
            Long producaoId
    ) {
        Producao producao =
                buscarParaAtualizacao(producaoId);

        if (producao.getStatus()
                != StatusProducao.EM_ANDAMENTO
                && producao.getStatus()
                != StatusProducao.EM_RETRABALHO) {
            throw new BusinessException(
                    "Somente produções em andamento ou em retrabalho podem ser pausadas."
            );
        }

        StatusProducao statusAnterior =
                producao.getStatus();

        EtapaFilaProducao etapaAtual;
        Equipamento equipamento;

        if (statusAnterior == StatusProducao.EM_RETRABALHO) {
            etapaAtual = EtapaFilaProducao.RETRABALHO;
            equipamento = producao.getEquipamentoRetrabalho();
        } else {
            etapaAtual = EtapaFilaProducao.PRINCIPAL;
            equipamento = producao.getEquipamentoPrincipal();
        }

        if (equipamento == null) {
            throw new BusinessException(
                    "A produção não possui equipamento configurado para a etapa atual."
            );
        }

        validarEquipamento(equipamento);

        /*
         * Primeiro interrompe a capacidade de impressão.
         *
         * A esteira deve estar fisicamente parada antes que este
         * endpoint seja chamado.
         */
        dominoService.desabilitarCabecote(
                equipamento
        );

        /*
         * Depois remove todos os dados ainda presentes
         * no FIFO físico da Domino.
         */
        dominoService.limparFifo(
                equipamento
        );

        Set<StatusFilaImpressao> statusCancelaveis =
                Set.of(
                        StatusFilaImpressao.PENDENTE,
                        StatusFilaImpressao.ENVIANDO,
                        StatusFilaImpressao.ENVIADO_FIFO,
                        StatusFilaImpressao.PRONTO_IMPRESSAO,
                        StatusFilaImpressao.ERRO
                );

        List<FilaImpressao> filasCanceladas =
                filaRepository
                        .findAllByProducaoItemProducaoIdAndStatusInOrderByOrdemFilaAsc(
                                producaoId,
                                statusCancelaveis
                        );

        for (FilaImpressao fila : filasCanceladas) {
            fila.setStatus(
                    StatusFilaImpressao.CANCELADO
            );

            fila.setMensagemErro(
                    "Registro removido da fila devido à pausa da produção."
            );

            ProducaoItem item =
                    fila.getProducaoItem();

            if (item == null) {
                continue;
            }

            /*
             * Somente itens cuja impressão ainda não foi confirmada
             * retornam para pendência.
             */
            if (etapaAtual == EtapaFilaProducao.PRINCIPAL
                    && fila.getEtapaProducao()
                    == EtapaFilaProducao.PRINCIPAL
                    && item.getStatus()
                    == StatusProducaoItem.EM_IMPRESSAO) {

                item.setStatus(
                        StatusProducaoItem.AGUARDANDO
                );

                item.setMensagemErro(null);
                itemRepository.save(item);
            }

            if (etapaAtual == EtapaFilaProducao.RETRABALHO
                    && fila.getEtapaProducao()
                    == EtapaFilaProducao.RETRABALHO
                    && item.getStatus()
                    == StatusProducaoItem.EM_RETRABALHO) {

                item.setStatus(
                        StatusProducaoItem.AGUARDANDO_RETRABALHO
                );

                item.setMensagemErro(null);
                itemRepository.save(item);
            }
        }

        filaRepository.saveAll(
                filasCanceladas
        );

        producao.setStatusAntesPausa(
                statusAnterior
        );

        producao.setStatus(
                StatusProducao.PAUSADA
        );

        producaoRepository.save(
                producao
        );

        return new ControleProducaoResponseDTO(
                producao.getId(),
                producao.getStatus(),
                statusAnterior,
                filasCanceladas.size(),
                LocalDateTime.now(),
                "Produção pausada, cabeçote desabilitado e FIFO limpo com sucesso."
        );
    }

    @Transactional
    public ControleProducaoResponseDTO retomar(
            Long producaoId
    ) {
        Producao producao =
                buscarParaAtualizacao(producaoId);

        if (producao.getStatus()
                != StatusProducao.PAUSADA) {
            throw new BusinessException(
                    "Somente produções pausadas podem ser retomadas."
            );
        }

        StatusProducao statusRetomada =
                producao.getStatusAntesPausa();

        if (statusRetomada
                != StatusProducao.EM_ANDAMENTO
                && statusRetomada
                != StatusProducao.EM_RETRABALHO) {
            throw new BusinessException(
                    "A produção não possui uma etapa válida para retomada."
            );
        }

        Equipamento equipamento;

        producao.setStatus(
                statusRetomada
        );

        producao.setStatusAntesPausa(null);

        producaoRepository.saveAndFlush(
                producao
        );

        if (statusRetomada
                == StatusProducao.EM_ANDAMENTO) {

            equipamento =
                    producao.getEquipamentoPrincipal();

            validarEquipamento(
                    equipamento
            );

            abastecerJanelaPrincipal(
                    producao
            );

            verificarFimImpressaoPrincipal(
                    producao
            );

        } else {
            equipamento =
                    producao.getEquipamentoRetrabalho();

            validarEquipamento(
                    equipamento
            );

            abastecerJanelaRetrabalho(
                    producao
            );

            verificarFimRetrabalho(
                    producao
            );
        }

        /*
         * O listener receberá este evento somente depois do commit.
         * Ele preencherá o FIFO e habilitará o cabeçote.
         */
        eventPublisher.publishEvent(
                new ProducaoIniciadaEvent(
                        producao.getId(),
                        equipamento.getId()
                )
        );

        return new ControleProducaoResponseDTO(
                producao.getId(),
                producao.getStatus(),
                StatusProducao.PAUSADA,
                0,
                LocalDateTime.now(),
                "Produção retomada. A impressora será preparada após a confirmação da operação."
        );
    }

    @Transactional
    public CancelamentoProducaoResponseDTO cancelar(
            Long producaoId,
            CancelarProducaoRequestDTO dto
    ) {
        Producao producao =
                buscarParaAtualizacao(producaoId);

        validarCancelamento(producao);

        Set<StatusFilaImpressao> statusFisicamenteAtivos =
                Set.of(
                        StatusFilaImpressao.ENVIANDO,
                        StatusFilaImpressao.ENVIADO_FIFO,
                        StatusFilaImpressao.PRONTO_IMPRESSAO
                );

        boolean possuiFilaFisicamenteAtiva =
                filaRepository
                        .existsByProducaoItemProducaoIdAndStatusIn(
                                producaoId,
                                statusFisicamenteAtivos
                        );

        if (possuiFilaFisicamenteAtiva) {
            throw new BusinessException(
                    "A produção possui itens enviados para a impressora. "
                            + "Pause a produção e aguarde a confirmação "
                            + "dos itens que já estão no equipamento."
            );
        }

        Set<StatusFilaImpressao> statusFilaCancelaveis =
                Set.of(
                        StatusFilaImpressao.PENDENTE,
                        StatusFilaImpressao.ERRO
                );

        List<FilaImpressao> filasCancelaveis =
                filaRepository
                        .findAllByProducaoItemProducaoIdAndStatusInOrderByOrdemFilaAsc(
                                producaoId,
                                statusFilaCancelaveis
                        );

        String motivo =
                dto.motivo().trim();

        for (FilaImpressao fila : filasCancelaveis) {
            fila.setStatus(
                    StatusFilaImpressao.CANCELADO
            );

            fila.setMensagemErro(
                    limitarMensagem(
                            "Cancelada junto com a produção. Motivo: "
                                    + motivo
                    )
            );
        }

        filaRepository.saveAll(
                filasCancelaveis
        );

        List<ProducaoItem> itens =
                itemRepository
                        .findAllByProducaoIdOrderBySequenciaAsc(
                                producaoId
                        );

        int quantidadeItensCancelados = 0;

        for (ProducaoItem item : itens) {
            if (item.getStatus()
                    == StatusProducaoItem.CONCLUIDO
                    || item.getStatus()
                    == StatusProducaoItem.CANCELADO) {
                continue;
            }

            item.setStatus(
                    StatusProducaoItem.CANCELADO
            );

            item.setMensagemErro(
                    limitarMensagem(
                            "Item cancelado junto com a produção. Motivo: "
                                    + motivo
                    )
            );

            quantidadeItensCancelados++;
        }

        itemRepository.saveAll(itens);

        LocalDateTime agora =
                LocalDateTime.now();

        producao.setStatus(
                StatusProducao.CANCELADA
        );

        producao.setStatusAntesPausa(null);
        producao.setMotivoCancelamento(motivo);
        producao.setCanceladaEm(agora);

        producaoRepository.save(producao);

        return new CancelamentoProducaoResponseDTO(
                producao.getId(),
                producao.getStatus(),
                quantidadeItensCancelados,
                filasCancelaveis.size(),
                producao.getMotivoCancelamento(),
                producao.getCanceladaEm(),
                "Produção cancelada com sucesso."
        );
    }

    private FilaImpressao criarRegistroFila(
            ProducaoItem item,
            Equipamento equipamento,
            LayoutImpressao layout,
            EtapaFilaProducao etapa,
            Long ordemFila
    ) {
        Map<String, String> valores =
                converterValores(
                        item.getValoresJson()
                );

        MontarPayloadResponseDTO payload =
                payloadMontadorService.montar(
                        layout.getId(),
                        valores
                );

        return FilaImpressao.builder()
                .equipamento(equipamento)
                .layout(layout)
                .producaoItem(item)
                .etapaProducao(etapa)
                .valoresJson(
                        item.getValoresJson()
                )
                .payloadMontado(
                        payload.payload()
                )
                .status(
                        StatusFilaImpressao.PENDENTE
                )
                .ordemFila(ordemFila)
                .tentativas(0)
                .build();
    }

    private void validarInicio(
            Producao producao
    ) {
        if (producao.getStatus()
                != StatusProducao.PRONTA) {
            throw new BusinessException(
                    "Somente produções prontas podem ser iniciadas."
            );
        }

        long quantidadeItens =
                itemRepository.countByProducaoId(
                        producao.getId()
                );

        if (quantidadeItens == 0) {
            throw new BusinessException(
                    "A produção não possui itens importados."
            );
        }

        if (producao.getQuantidadeTotal() == null
                || !producao.getQuantidadeTotal()
                .equals(quantidadeItens)) {
            throw new BusinessException(
                    "A quantidade de itens da produção está inconsistente."
            );
        }
    }

    private void validarEquipamento(
            Equipamento equipamento
    ) {
        if (equipamento.getIp() == null
                || equipamento.getIp().isBlank()) {
            throw new BusinessException(
                    "O equipamento principal não possui IP configurado."
            );
        }

        if (equipamento.getPorta() == null) {
            throw new BusinessException(
                    "O equipamento principal não possui porta configurada."
            );
        }

        if (equipamento.getProtocolo() == null
                || !equipamento.getProtocolo()
                .equalsIgnoreCase("CODENET")) {
            throw new BusinessException(
                    "O equipamento principal não utiliza o protocolo CODENET."
            );
        }
    }

    private void validarLayout(
            LayoutImpressao layout
    ) {
        if (!Boolean.TRUE.equals(
                layout.getAtivo()
        )) {
            throw new BusinessException(
                    "O layout principal está inativo."
            );
        }
    }

    private Long calcularProximaOrdem(
            Long equipamentoId
    ) {
        return filaRepository
                .findFirstByEquipamentoIdOrderByOrdemFilaDesc(
                        equipamentoId
                )
                .map(registro ->
                        registro.getOrdemFila() + 1
                )
                .orElse(1L);
    }

    private Map<String, String> converterValores(
            String valoresJson
    ) {
        try {
            return objectMapper.readValue(
                    valoresJson,
                    new TypeReference<
                            Map<String, String>
                            >() {
                    }
            );

        } catch (JsonProcessingException exception) {
            throw new BusinessException(
                    "Não foi possível interpretar os valores do item da produção."
            );
        }
    }

    private Producao buscarParaAtualizacao(
            Long producaoId
    ) {
        return producaoRepository
                .buscarPorIdParaAtualizacao(
                        producaoId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Produção não encontrada com ID: "
                                        + producaoId
                        )
                );
    }

    @Transactional
    public void registrarImpressaoConfirmada(
            FilaImpressao fila
    ) {
        if (fila.getProducaoItem() == null
                || fila.getEtapaProducao() == null) {
            return;
        }

        ProducaoItem item =
                fila.getProducaoItem();

        Producao producao =
                item.getProducao();

        if (fila.getEtapaProducao()
                == EtapaFilaProducao.PRINCIPAL) {

            if (item.getStatus()
                    == StatusProducaoItem.EM_IMPRESSAO) {
                item.setStatus(
                        StatusProducaoItem
                                .AGUARDANDO_VALIDACAO
                );

                item.setImpressoEm(
                        fila.getImpressoEm()
                );

                item.setMensagemErro(null);

                itemRepository.save(item);
            }

            if (producao.getStatus()
                    == StatusProducao.EM_ANDAMENTO) {
                abastecerJanelaPrincipal(producao);
                verificarFimImpressaoPrincipal(producao);
            }

            return;
        }

        if (fila.getEtapaProducao()
                == EtapaFilaProducao.RETRABALHO) {

            if (item.getStatus()
                    == StatusProducaoItem.EM_RETRABALHO) {
                item.setStatus(
                        StatusProducaoItem
                                .AGUARDANDO_VALIDACAO
                );

                /*
                 * impressoEm passa a representar a impressão
                 * mais recente do item.
                 */
                item.setImpressoEm(
                        fila.getImpressoEm()
                );

                item.setMensagemErro(null);

                itemRepository.save(item);
            }

            if (producao.getStatus()
                    == StatusProducao.EM_RETRABALHO) {
                abastecerJanelaRetrabalho(producao);
                verificarFimRetrabalho(producao);
            }
        }
    }

    private void verificarFimRetrabalho(
            Producao producao
    ) {
        long itensPendentes =
                itemRepository
                        .countByProducaoIdAndStatusIn(
                                producao.getId(),
                                Set.of(
                                        StatusProducaoItem.AGUARDANDO_RETRABALHO,
                                        StatusProducaoItem.EM_RETRABALHO
                                )
                        );

        if (itensPendentes > 0) {
            return;
        }

        finalizarEtapaFisica(
                producao.getEquipamentoRetrabalho(),
                producao.getId(),
                EtapaFilaProducao.RETRABALHO
        );

        producao.setStatus(
                StatusProducao.AGUARDANDO_AVALIACAO
        );

        producao.setStatusAntesPausa(null);

        producaoRepository.save(producao);
    }


    private void abastecerJanelaPrincipal(
            Producao producao
    ) {
        long quantidadeAtiva =
                filaRepository
                        .countByProducaoItemProducaoIdAndEtapaProducaoAndStatusIn(
                                producao.getId(),
                                EtapaFilaProducao.PRINCIPAL,
                                STATUS_ATIVOS_FILA
                        );

        while (quantidadeAtiva < capacidadeBuffer) {
            ProducaoItem proximoItem =
                    itemRepository
                            .findFirstByProducaoIdAndStatusOrderBySequenciaAsc(
                                    producao.getId(),
                                    StatusProducaoItem.AGUARDANDO
                            )
                            .orElse(null);

            if (proximoItem == null) {
                break;
            }

            boolean jaPossuiFilaAtiva =
                    filaRepository
                            .existsByProducaoItemIdAndEtapaProducaoAndStatusIn(
                                    proximoItem.getId(),
                                    EtapaFilaProducao.PRINCIPAL,
                                    STATUS_ATIVOS_FILA
                            );

            if (jaPossuiFilaAtiva) {
                throw new BusinessException(
                        "O item "
                                + proximoItem.getSequencia()
                                + " já possui registro na fila principal."
                );
            }

            Long ordemFila =
                    calcularProximaOrdem(
                            producao
                                    .getEquipamentoPrincipal()
                                    .getId()
                    );

            FilaImpressao fila =
                    criarRegistroFila(
                            proximoItem,
                            producao.getEquipamentoPrincipal(),
                            producao.getLayoutPrincipal(),
                            EtapaFilaProducao.PRINCIPAL,
                            ordemFila
                    );
            filaRepository.save(fila);

            proximoItem.setStatus(
                    StatusProducaoItem.EM_IMPRESSAO
            );

            proximoItem.setMensagemErro(null);

            itemRepository.save(proximoItem);

            quantidadeAtiva++;
        }
    }

    private void verificarFimImpressaoPrincipal(
            Producao producao
    ) {
        long itensAindaEmProcessamento =
                itemRepository
                        .countByProducaoIdAndStatusIn(
                                producao.getId(),
                                Set.of(
                                        StatusProducaoItem.AGUARDANDO,
                                        StatusProducaoItem.EM_IMPRESSAO
                                )
                        );

        if (itensAindaEmProcessamento > 0) {
            return;
        }

        /*
         * O último item já teve a impressão confirmada.
         * Interrompemos o cabeçote antes que outro pulso
         * tente consumir dados inexistentes.
         */
        finalizarEtapaFisica(
                producao.getEquipamentoPrincipal(),
                producao.getId(),
                EtapaFilaProducao.PRINCIPAL
        );

        producao.setStatus(StatusProducao.AGUARDANDO_AVALIACAO);
        producao.setStatusAntesPausa(null);

        producaoRepository.save(producao);
    }

    @Transactional
    public FinalizacaoAvaliacaoResponseDTO finalizarAvaliacao(
            Long producaoId
    ) {
        Producao producao =
                buscarParaAtualizacao(producaoId);

        validarProducaoEmAvaliacao(producao);

        int quantidadeAprovada =
                itemRepository.atualizarStatusEmLote(
                        producaoId,
                        StatusProducaoItem.AGUARDANDO_VALIDACAO,
                        StatusProducaoItem.CONCLUIDO
                );

        long quantidadeRetrabalho =
                itemRepository
                        .countByProducaoIdAndStatus(
                                producaoId,
                                StatusProducaoItem
                                        .AGUARDANDO_RETRABALHO
                        );

        if (quantidadeRetrabalho == 0) {
            LocalDateTime agora =
                    LocalDateTime.now();

            producao.setStatus(
                    StatusProducao.CONCLUIDA
            );

            producao.setConcluidaEm(agora);

            producaoRepository.save(producao);

            return new FinalizacaoAvaliacaoResponseDTO(
                    producaoId,
                    producao.getStatus(),
                    quantidadeAprovada,
                    0,
                    producao.getConcluidaEm(),
                    "Avaliação finalizada e produção concluída."
            );
        }

        validarConfiguracaoRetrabalho(producao);
        iniciarFluxoRetrabalho(producao);

        return new FinalizacaoAvaliacaoResponseDTO(
                producaoId,
                producao.getStatus(),
                quantidadeAprovada,
                quantidadeRetrabalho,
                null,
                "Avaliação finalizada e itens enviados para retrabalho."
        );
    }

    private void iniciarFluxoRetrabalho(
            Producao producao
    ) {
        Equipamento equipamento =
                producao.getEquipamentoRetrabalho();

        LayoutImpressao layout =
                producao.getLayoutRetrabalho();

        validarEquipamento(equipamento);
        validarLayout(layout);

        boolean possuiFilaAtiva =
                filaRepository
                        .existsByEquipamentoIdAndStatusIn(
                                equipamento.getId(),
                                STATUS_ATIVOS_FILA
                        );

        if (possuiFilaAtiva) {
            throw new BusinessException(
                    "O equipamento de retrabalho possui impressões "
                            + "pendentes ou em processamento."
            );
        }

        producao.setStatus(
                StatusProducao.EM_RETRABALHO
        );

        producaoRepository.saveAndFlush(producao);

        abastecerJanelaRetrabalho(producao);

        eventPublisher.publishEvent(
                new ProducaoIniciadaEvent(
                        producao.getId(),
                        equipamento.getId()
                )
        );
    }

    private void abastecerJanelaRetrabalho(
            Producao producao
    ) {
        long quantidadeAtiva =
                filaRepository
                        .countByProducaoItemProducaoIdAndEtapaProducaoAndStatusIn(
                                producao.getId(),
                                EtapaFilaProducao.RETRABALHO,
                                STATUS_ATIVOS_FILA
                        );

        while (quantidadeAtiva < capacidadeBuffer) {
            ProducaoItem proximoItem =
                    itemRepository
                            .findFirstByProducaoIdAndStatusOrderBySequenciaAsc(
                                    producao.getId(),
                                    StatusProducaoItem
                                            .AGUARDANDO_RETRABALHO
                            )
                            .orElse(null);

            if (proximoItem == null) {
                break;
            }

            boolean possuiFilaAtiva =
                    filaRepository
                            .existsByProducaoItemIdAndEtapaProducaoAndStatusIn(
                                    proximoItem.getId(),
                                    EtapaFilaProducao.RETRABALHO,
                                    STATUS_ATIVOS_FILA
                            );

            if (possuiFilaAtiva) {
                throw new BusinessException(
                        "O item já possui uma impressão de retrabalho ativa."
                );
            }

            Long ordemFila =
                    calcularProximaOrdem(
                            producao
                                    .getEquipamentoRetrabalho()
                                    .getId()
                    );

            FilaImpressao fila =
                    criarRegistroFila(
                            proximoItem,
                            producao.getEquipamentoRetrabalho(),
                            producao.getLayoutRetrabalho(),
                            EtapaFilaProducao.RETRABALHO,
                            ordemFila
                    );

            filaRepository.save(fila);

            proximoItem.setStatus(
                    StatusProducaoItem.EM_RETRABALHO
            );

            proximoItem.setMensagemErro(null);

            itemRepository.save(proximoItem);

            quantidadeAtiva++;
        }
    }

    @Transactional
    public ItemRetrabalhoResponseDTO marcarParaRetrabalho(
            Long producaoId,
            Long itemId
    ) {
        Producao producao =
                buscarParaAtualizacao(producaoId);

        validarProducaoEmAvaliacao(producao);
        validarConfiguracaoRetrabalho(producao);

        ProducaoItem item =
                buscarItemDaProducao(
                        producaoId,
                        itemId
                );

        if (item.getStatus()
                != StatusProducaoItem.AGUARDANDO_VALIDACAO) {
            throw new BusinessException(
                    "Somente itens aguardando validação podem ser enviados para retrabalho."
            );
        }

        item.setStatus(
                StatusProducaoItem.AGUARDANDO_RETRABALHO
        );

        item.setMensagemErro(null);

        itemRepository.save(item);

        return new ItemRetrabalhoResponseDTO(
                producaoId,
                item.getId(),
                item.getSequencia(),
                item.getStatus(),
                "Item marcado para retrabalho."
        );
    }

    @Transactional
    public ItemRetrabalhoResponseDTO desmarcarRetrabalho(
            Long producaoId,
            Long itemId
    ) {
        Producao producao =
                buscarParaAtualizacao(producaoId);

        validarProducaoEmAvaliacao(producao);

        ProducaoItem item =
                buscarItemDaProducao(
                        producaoId,
                        itemId
                );

        if (item.getStatus()
                != StatusProducaoItem.AGUARDANDO_RETRABALHO) {
            throw new BusinessException(
                    "O item não está aguardando retrabalho."
            );
        }

        item.setStatus(
                StatusProducaoItem.AGUARDANDO_VALIDACAO
        );

        itemRepository.save(item);

        return new ItemRetrabalhoResponseDTO(
                producaoId,
                item.getId(),
                item.getSequencia(),
                item.getStatus(),
                "Marcação de retrabalho removida."
        );
    }

    private void validarProducaoEmAvaliacao(
            Producao producao
    ) {
        if (producao.getStatus()
                != StatusProducao.AGUARDANDO_AVALIACAO) {
            throw new BusinessException(
                    "A produção não está aguardando avaliação."
            );
        }
    }

    private void validarConfiguracaoRetrabalho(
            Producao producao
    ) {
        if (producao.getEquipamentoRetrabalho() == null
                || producao.getLayoutRetrabalho() == null) {
            throw new BusinessException(
                    "A produção não possui equipamento e layout de retrabalho configurados."
            );
        }
    }

    private ProducaoItem buscarItemDaProducao(
            Long producaoId,
            Long itemId
    ) {
        return itemRepository
                .findByIdAndProducaoId(
                        itemId,
                        producaoId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Item não encontrado nesta produção."
                        )
                );
    }

    private void validarCancelamento(
            Producao producao
    ) {
        if (producao.getStatus()
                == StatusProducao.CONCLUIDA) {
            throw new BusinessException(
                    "Uma produção concluída não pode ser cancelada."
            );
        }

        if (producao.getStatus()
                == StatusProducao.CANCELADA) {
            throw new BusinessException(
                    "A produção já está cancelada."
            );
        }

        Set<StatusProducao> statusCancelaveis =
                Set.of(
                        StatusProducao.AGUARDANDO_DADOS,
                        StatusProducao.PRONTA,
                        StatusProducao.PAUSADA
                );

        if (!statusCancelaveis.contains(
                producao.getStatus()
        )) {
            throw new BusinessException(
                    "A produção não pode ser cancelada no estado atual. "
                            + "Se ela estiver sendo executada, pause-a primeiro."
            );
        }
    }

    private String limitarMensagem(
            String mensagem
    ) {
        if (mensagem.length() <= 1000) {
            return mensagem;
        }

        return mensagem.substring(0, 1000);
    }

    private void finalizarEtapaFisica(
            Equipamento equipamento,
            Long producaoId,
            EtapaFilaProducao etapa
    ) {
        if (equipamento == null) {
            log.error(
                    "Não foi possível finalizar fisicamente a etapa {} "
                            + "da produção {}: equipamento não configurado.",
                    etapa,
                    producaoId
            );

            return;
        }

        /*
         * Os comandos são tratados separadamente porque uma falha
         * de comunicação não pode apagar a confirmação de que o
         * último item já foi fisicamente impresso.
         */
        try {
            dominoService.desabilitarCabecote(
                    equipamento
            );

        } catch (RuntimeException exception) {
            log.error(
                    "A etapa {} da produção {} terminou, mas não foi "
                            + "possível desabilitar o cabeçote do equipamento {}: {}",
                    etapa,
                    producaoId,
                    equipamento.getId(),
                    exception.getMessage(),
                    exception
            );
        }

        try {
            dominoService.limparFifo(
                    equipamento
            );

        } catch (RuntimeException exception) {
            log.error(
                    "A etapa {} da produção {} terminou, mas não foi "
                            + "possível limpar o FIFO do equipamento {}: {}",
                    etapa,
                    producaoId,
                    equipamento.getId(),
                    exception.getMessage(),
                    exception
            );
        }
    }
}