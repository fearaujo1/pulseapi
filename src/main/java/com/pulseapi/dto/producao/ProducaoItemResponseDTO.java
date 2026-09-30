package com.pulseapi.dto.producao;

import com.pulseapi.entity.producao.StatusProducaoItem;

import java.time.LocalDateTime;
import java.util.Map;

public record ProducaoItemResponseDTO(

        Long id,
        Long versao,
        Long producaoId,
        Integer sequencia,
        String referenciaExterna,
        Map<String, String> valores,
        StatusProducaoItem status,
        String mensagemErro,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm,
        LocalDateTime impressoEm

) {
}