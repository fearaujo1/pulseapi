package com.pulseapi.dto.usuario;

import com.pulseapi.entity.usuario.StatusUsuario;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UsuarioStatusDTO {

    @NotNull(message = "O status é obrigatório.")
    private StatusUsuario status;
}