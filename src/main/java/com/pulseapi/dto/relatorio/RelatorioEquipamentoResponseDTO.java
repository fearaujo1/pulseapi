package com.pulseapi.dto.relatorio;

import java.util.List;

public record RelatorioEquipamentoResponseDTO(
        Long total,
        Long ativos,
        Long inativos,
        Long emManutencao,
        Long semConexao,
        List<RelatorioEquipamentoItemDTO> itens
) {
}