package com.pulseapi.dto.auth;

import com.pulseapi.entity.PerfilUsuario;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponseDTO {

    private Long id;
    private String nome;
    private String email;
    private String perfil;
    private Boolean primeiroAcesso;
    private String token;
    private String mensagem;
}


