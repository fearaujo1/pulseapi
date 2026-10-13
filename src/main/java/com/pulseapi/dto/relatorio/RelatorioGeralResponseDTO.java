package com.pulseapi.dto.relatorio;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record RelatorioGeralResponseDTO(
        LocalDate dataInicial,
        LocalDate dataFinal,

        String geradoPor,
        LocalDateTime geradoEm,

        RelatorioProducaoResponseDTO producoes,
        RelatorioImpressaoResponseDTO impressoes,
        RelatorioOcorrenciaResponseDTO ocorrencias,
        RelatorioEquipamentoResponseDTO equipamentos
) {
}