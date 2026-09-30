package com.pulseapi.dto.producao;

public record ProducaoItensLoteResponseDTO(

        Long producaoId,
        int quantidadeRecebida,
        int quantidadeImportada,
        long quantidadeTotalAtual

) {
}