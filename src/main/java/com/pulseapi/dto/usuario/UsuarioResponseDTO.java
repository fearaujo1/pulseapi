package com.pulseapi.dto.usuario;


import com.pulseapi.entity.StatusUsuario;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class UsuarioResponseDTO {

    private Long id;
    private String nome;
    private String email;
    private String perfil;
    private StatusUsuario status;
    private Boolean primeiroAcesso;
    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaAtualizacao;
}
