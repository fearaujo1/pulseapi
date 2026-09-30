package com.pulseapi.dto.producao;

import com.pulseapi.entity.producao.StatusProducao;

import java.time.LocalDateTime;
import java.util.List;

public record InicioProducaoResponseDTO(

        Long producaoId,
        StatusProducao status,
        LocalDateTime iniciadaEm,
        int quantidadeItensEnfileirados,
        List<Long> filaIds,
        String mensagem

) {
}