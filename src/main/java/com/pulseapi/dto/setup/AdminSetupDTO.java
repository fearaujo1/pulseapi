package com.pulseapi.dto.setup;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminSetupDTO {

    @NotBlank(message="O nome do adminstrador é obrigatório.")
    private String nome;

    @Email(message="Email inválido.")
    @NotBlank(message="O email do adminstrasdor é obrigatório")
    private String email;

    @NotBlank(message="A senha é obrigatória")
    private String senha;

    private String telefone;
}
