package com.pulseapi.dto.relatorio;

import java.time.LocalDate;
import java.util.List;

public record RelatorioOcorrenciaResponseDTO(
        LocalDate dataInicial,
        LocalDate dataFinal,
        Long total,
        Long abertas,
        Long emAnalise,
        Long emAtendimento,
        Long resolvidas,
        Long canceladas,
        List<RelatorioOcorrenciaItemDTO> itens
) {
}