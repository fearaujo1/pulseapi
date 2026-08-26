package com.pulseapi.integration.domino.monitoring;

import com.pulseapi.integration.domino.dto.DominoStatusResponse;

public record DominoStatusStateChange(
        DominoStatusTransition transition,
        DominoStatusResponse atual,
        DominoStatusResponse anterior,
        long quantidadeRecebimentos
) {
}