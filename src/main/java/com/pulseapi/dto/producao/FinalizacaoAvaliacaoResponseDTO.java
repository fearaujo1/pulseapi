package com.pulseapi.dto.producao;

import com.pulseapi.entity.producao.StatusProducao;

import java.time.LocalDateTime;

public record FinalizacaoAvaliacaoResponseDTO(

        Long producaoId,
        StatusProducao status,
        int quantidadeAprovada,
        long quantidadeRetrabalho,
        LocalDateTime concluidaEm,
        String mensagem

) {
}