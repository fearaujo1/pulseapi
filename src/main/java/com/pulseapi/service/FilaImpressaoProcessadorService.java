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
                        equipamento.getIp(),
                        equipamento.getPorta()
                );

        /*
         * 3. Caso o layout correto ainda não esteja online,
         * solicita a troca para a impressora.
         */
        if (!layoutEsperado.equals(layoutAtual.nome())) {
            dominoService.selecionarLayout(
                    equipamento.getIp(),
                    equipamento.getPorta(),
                    layoutEsperado
            );

            /*
             * 4. Consulta novamente para confirmar que a troca realmente ocorreu.
             */
            DominoLayoutOnlineResponse layoutConfirmado =
                    dominoService.consultarLayoutOnline(
                            equipamento.getIp(),
                            equipamento.getPorta()
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
                        equipamento.getIp(),
                        equipamento.getPorta()
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
                        equipamento.getIp(),
                        equipamento.getPorta()
                );

        fila.setContadorAntesEnvio(contadorAntes.quantidade());
        fila.setContadorAposImpressao(null);
        fila.setStatus(StatusFilaImpressao.ENVIANDO);
        fila.setMensagemErro(null);
        fila.setTentativas(fila.getTentativas() + 1);

        filaRepository.saveAndFlush(fila);

        try {
            dominoService.adicionarDadosFifo(
                    equipamento.getIp(),
                    equipamento.getPorta(),
                    fila.getPayloadMontado()
            );

            DominoFifoCountResponse fifoDepois =
                    dominoService.consultarQuantidadeFifo(
                            equipamento.getIp(),
                            equipamento.getPorta()
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
                        equipamento.getIp(),
                        equipamento.getPorta()
                );

        DominoProductCountResponse contadorAtual =
                dominoService.consultarContadorProduto(
                        equipamento.getIp(),
                        equipamento.getPorta()
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

        var enviado = filaRepository
                .findFirstByEquipamentoIdAndStatusOrderByOrdemFilaAsc(
                        equipamentoId,
                        StatusFilaImpressao.ENVIADO_FIFO
                );

        /*
         * Se já existe um item enviado ao FIFO,
         * primeiro verificamos se ele foi realmente impresso.
         */
        if (enviado.isPresent()) {
            FilaImpressao fila = enviado.get();
            Equipamento equipamento = fila.getEquipamento();

            validarConexaoEquipamento(equipamento);

            DominoFifoCountResponse fifo =
                    dominoService.consultarQuantidadeFifo(
                            equipamento.getIp(),
                            equipamento.getPorta()
                    );

            DominoProductCountResponse contadorAtual =
                    dominoService.consultarContadorProduto(
                            equipamento.getIp(),
                            equipamento.getPorta()
                    );

            Long contadorAntes = fila.getContadorAntesEnvio();

            if (contadorAntes == null) {
                throw new BusinessException(
                        "O registro enviado ao FIFO não possui o contador anterior ao envio."
                );
            }

            /*
             * O item ainda está dentro do FIFO.
             * Portanto, ainda não foi consumido pela impressora.
             */
            if (fifo.quantidadeItens() > 0) {
                return new SincronizacaoFilaResponseDTO(
                        equipamentoId,
                        fila.getId(),
                        "AGUARDANDO_CONSUMO",
                        fila.getStatus().name(),
                        fifo.quantidadeItens(),
                        "O item continua no FIFO aguardando o pulso de impressão."
                );
            }

            /*
             * O FIFO ficou vazio, mas o contador não aumentou.
             *
             * Isso pode significar:
             * - troca de layout;
             * - limpeza manual do FIFO;
             * - remoção do item sem impressão.
             *
             * Por segurança, não marcamos como IMPRESSO.
             */
            if (contadorAtual.quantidade() <= contadorAntes) {
                return new SincronizacaoFilaResponseDTO(
                        equipamentoId,
                        fila.getId(),
                        "CONSUMO_NAO_CONFIRMADO",
                        fila.getStatus().name(),
                        0,
                        "O item saiu do FIFO, mas o contador de produtos não aumentou. "
                                + "A impressão ainda não foi confirmada."
                );
            }

            /*
             * Confirmação segura:
             * FIFO vazio + contador aumentou.
             */
            fila.setStatus(StatusFilaImpressao.IMPRESSO);
            fila.setImpressoEm(LocalDateTime.now());
            fila.setContadorAposImpressao(
                    contadorAtual.quantidade()
            );
            fila.setMensagemErro(null);

            filaRepository.save(fila);

            return new SincronizacaoFilaResponseDTO(
                    equipamentoId,
                    fila.getId(),
                    "CONFIRMADO_IMPRESSO",
                    fila.getStatus().name(),
                    0,
                    "Impressão confirmada. O FIFO foi consumido e o contador aumentou de "
                            + contadorAntes
                            + " para "
                            + contadorAtual.quantidade()
                            + "."
            );
        }

        /*
         * Se não existe item aguardando confirmação,
         * verificamos se existe algum PENDENTE.
         */
        boolean possuiPendente =
                filaRepository.existsByEquipamentoIdAndStatus(
                        equipamentoId,
                        StatusFilaImpressao.PENDENTE
                );

        /*
         * Nenhum item enviado e nenhum item pendente:
         * a fila está ociosa.
         */
        if (!possuiPendente) {
            return new SincronizacaoFilaResponseDTO(
                    equipamentoId,
                    null,
                    "FILA_OCIOSA",
                    null,
                    0,
                    "Não existem registros pendentes ou aguardando impressão."
            );
        }

        /*
         * Existe um item pendente.
         * Então enviamos o próximo ao FIFO.
         */
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
}