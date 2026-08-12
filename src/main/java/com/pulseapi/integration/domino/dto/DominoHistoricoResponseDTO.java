package com.pulseapi.integration.domino.dto;

import com.pulseapi.entity.ResultadoComunicacaoDomino;

import java.time.LocalDateTime;

public record DominoHistoricoResponseDTO(
        Long id,
        Long equipamentoId,
        String nomeComando,
        String envioAscii,
        String envioHex,
        String respostaAscii,
        String respostaHex,
        ResultadoComunicacaoDomino resultado,
        String mensagemErro,
        LocalDateTime criadoEm
) {
}