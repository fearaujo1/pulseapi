package com.pulseapi.dto.layout;

import com.pulseapi.entity.TipoCampoLayout;

public record CampoLayoutResponseDTO(
        Long id,
        String chave,
        String rotulo,
        Integer ordem,
        TipoCampoLayout tipoDado,
        Integer comprimento,
        Boolean obrigatorio,
        String formato,
        Integer offset,
        String valorPadrao
) {
}