package com.pulseapi.dto.dashboard;

import com.pulseapi.entity.equipamento.StatusConexaoEquipamento;
import com.pulseapi.integration.domino.dto.NivelLiquidoResponse;

public record DashboardEquipamentoResponseDTO(

        Long equipamentoId,

        String equipamentoNome,

        String equipamentoCodigo,

        StatusConexaoEquipamento statusConexao,

        boolean consultaLiquidosDisponivel,

        NivelLiquidoResponse tinta,

        NivelLiquidoResponse makeup,

        String mensagem

) {
}