package com.pulseapi.integration.domino.dto;

import java.util.List;

public record DominoConfigurationResponse (
        int quantidadeJatos,
        List<Integer> configuracoesJatos,
        int maximoLayouts,
        int tamanhoMaximoLayout,
        String formatoCodigoBarras,
        String baudRateSerial,
        String controleFluxoSerial,
        int comandosAplicacao
) {

}
