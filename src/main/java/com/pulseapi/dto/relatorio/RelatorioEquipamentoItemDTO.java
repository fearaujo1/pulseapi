package com.pulseapi.dto.relatorio;

import com.pulseapi.entity.StatusEquipamento;

public record RelatorioEquipamentoItemDTO(
        Long id,
        String codigo,
        String nome,
        String tipo,
        String fabricante,
        String modelo,
        String setor,
        StatusEquipamento status,
        String ip,
        Integer porta,
        String protocolo
) {
}