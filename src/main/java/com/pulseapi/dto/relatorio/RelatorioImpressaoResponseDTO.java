package com.pulseapi.dto.relatorio;

import java.time.LocalDate;
import java.util.List;

public record RelatorioImpressaoResponseDTO(
        LocalDate dataInicial,
        LocalDate dataFinal,
        Long total,
        Long pendentes,
        Long emProcessamento,
        Long impressos,
        Long erros,
        Long cancelados,
        List<RelatorioImpressaoItemDTO> itens
) {
}