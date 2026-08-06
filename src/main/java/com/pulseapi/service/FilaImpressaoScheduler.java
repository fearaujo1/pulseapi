package com.pulseapi.service;

import com.pulseapi.entity.StatusFilaImpressao;
import com.pulseapi.repository.FilaImpressaoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Set;


@Component
public class FilaImpressaoScheduler {

    private static final Logger log =  LoggerFactory.getLogger(FilaImpressaoScheduler.class);

    private final FilaImpressaoRepository filaRepository;
    private final FilaImpressaoProcessadorService processadorService;

    public FilaImpressaoScheduler(
            FilaImpressaoRepository filaRepository,
            FilaImpressaoProcessadorService processadorService
    ) {
        this.filaRepository = filaRepository;
        this.processadorService = processadorService;
    }

    @Scheduled(fixedDelayString = "${pulseapi.fila-impressao.intervalo-ms:2000}")
    public void sincronizarFilas() {
        Set<Long> equipamentosIds =
                filaRepository.findEquipamentosIdsPorStatus(
                        Set.of(
                                StatusFilaImpressao.PENDENTE,
                                StatusFilaImpressao.ENVIADO_FIFO,
                                StatusFilaImpressao.PRONTO_IMPRESSAO
                        )
                );

        for (Long equipamentoId : equipamentosIds) {
            try {
                processadorService.sincronizar(equipamentoId);
            } catch (Exception e) {
                log.error(
                        "Erro ao sincronizar fila do equipamento {}: {}",
                        equipamentoId,
                        e.getMessage()
                );
            }
        }
    }
}
