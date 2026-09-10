package com.pulseapi.dto.linhas;

import com.pulseapi.entity.linha.PapelNaLinha;
import jakarta.validation.constraints.NotNull;

public record LinhaUsuarioRequestDTO(

        @NotNull(message = "O usuário é obrigatório.")
        Long usuarioId,

        @NotNull(message = "O papel na linha é obrigatório.")
        PapelNaLinha papelNaLinha

) {
}