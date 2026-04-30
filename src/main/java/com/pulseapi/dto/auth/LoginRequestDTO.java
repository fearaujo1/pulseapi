package com.pulseapi.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequestDTO {

    @Email(message = "Email Inválido.")
    @NotBlank(message = "O email é obrigatório.")
    private String email;

    @NotBlank(message = "A senha é obrigatória")
    private String senha;
    
}
