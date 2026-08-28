package com.pulseapi.dto.relatorio;

import com.pulseapi.entity.StatusConexaoEquipamento;
import com.pulseapi.entity.StatusEquipamento;

public record RelatorioEquipamentoItemDTO(
        Long id,
        String codigo,
        String nome,
        String tipo,
        String fabricante,
        String modelo,
        StatusEquipamento status,
        StatusConexaoEquipamento statusConexao,
        String ip,
        Integer porta,
        String protocolo
) {
}