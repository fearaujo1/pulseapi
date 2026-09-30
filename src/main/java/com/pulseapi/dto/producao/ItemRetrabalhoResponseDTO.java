package com.pulseapi.dto.producao;

import com.pulseapi.entity.producao.StatusProducaoItem;

public record ItemRetrabalhoResponseDTO(

        Long producaoId,
        Long itemId,
        Integer sequencia,
        StatusProducaoItem status,
        String mensagem

) {
}