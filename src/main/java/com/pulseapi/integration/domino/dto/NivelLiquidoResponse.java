package com.pulseapi.integration.domino.dto;

public record NivelLiquidoResponse(

        String codigo,

        Integer percentualMinimo,

        Integer percentualMaximo,

        Double percentualEstimado,

        String descricao,

        boolean sensorConectado

) {
}