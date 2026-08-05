package com.pulseapi.dto.layout;

import com.pulseapi.entity.EstrategiaMontagemPayload;

import java.time.LocalDateTime;
import java.util.List;

public record LayoutImpressaoResponseDTO(
        Long id,
        String nome,
        String nomeNaImpressora,
        EstrategiaMontagemPayload estrategiaMontagem,
        String delimitador,
        Boolean ativo,
        Long equipamentoId,
        String equipamentoNome,
        List<CampoLayoutResponseDTO> campos,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
}