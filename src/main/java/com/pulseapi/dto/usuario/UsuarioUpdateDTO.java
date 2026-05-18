package com.pulseapi.dto.usuario;

import com.pulseapi.entity.PerfilUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UsuarioUpdateDTO {

    @NotBlank(message = "O nome é obrigatório.")
    private String nome;

    @Email(message = "Email inválido.")
    @NotBlank(message = "O email é obrigatório.")
    private String email;

    @NotNull(message = "O perfil é obrigatório.")
    private Long perfilId;
}