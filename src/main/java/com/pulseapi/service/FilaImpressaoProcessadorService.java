package com.pulseapi.service;

import com.pulseapi.dto.fila.ProcessamentoFilaResponseDTO;
import com.pulseapi.entity.Equipamento;
import com.pulseapi.entity.FilaImpressao;
import com.pulseapi.entity.StatusFilaImpressao;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.integration.domino.dto.DominoFifoCountResponse;
import com.pulseapi.integration.domino.service.DominoService;
import com.pulseapi.repository.FilaImpressaoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

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
}