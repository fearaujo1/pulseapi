package com.pulseapi.dto.fila;

public record SincronizacaoFilaResponseDTO(
        Long equipamentoId,
        Long filaId,
        String acao,
        String status,
        Integer quantidadeFifo,
        String mensagem
) {
}