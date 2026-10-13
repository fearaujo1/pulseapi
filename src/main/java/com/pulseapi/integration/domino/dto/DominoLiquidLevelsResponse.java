package com.pulseapi.integration.domino.dto;

public record DominoLiquidLevelsResponse(

        NivelLiquidoResponse tinta,

        NivelLiquidoResponse makeup

) {
}