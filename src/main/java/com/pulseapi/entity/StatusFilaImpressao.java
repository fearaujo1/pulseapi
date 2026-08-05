package com.pulseapi.entity;

public enum StatusFilaImpressao {
    PENDENTE, // Está no banco aguardando envio
    ENVIANDO, // Backend processando
    ENVIADO_FIFO, // Ax150i retornou ACK e o item entrou no FIFO
    IMPRESSO, // Existe evidência de que o pulso consumiu o item
    ERRO, // Falha na comunicação, NAK ou payload inválido
    CANCELADO // Removido pelo usuário
}
