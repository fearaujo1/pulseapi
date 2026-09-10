package com.pulseapi.dto.linhas;

import com.pulseapi.entity.linha.PapelNaLinha;

import java.time.LocalDateTime;

public record LinhaUsuarioResponseDTO(
        Long id,

        Long linhaId,
        String linhaNome,

        Long usuarioId,
        String usuarioNome,
        String usuarioEmail,
        String usuarioPerfil,

        PapelNaLinha papelNaLinha,
        LocalDateTime dataCadastro
) {
}