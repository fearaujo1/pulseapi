package com.pulseapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PerfilUsuario perfil;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusUsuario status;

    @Column(name = "primeiro_acesso", nullable = false)
    private Boolean primeiroAcesso;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @Column(name = "ultima_atualizacao")
    private LocalDateTime ultimaAtualizacao;

    @PrePersist
    public void prePersist() {
        this.dataCadastro = LocalDateTime.now();
        this.ultimaAtualizacao = LocalDateTime.now();

        if (this.status == null) {
            this.status = StatusUsuario.ATIVO;
        }

        if (this.primeiroAcesso == null) {
            this.primeiroAcesso = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.ultimaAtualizacao = LocalDateTime.now();
    }
}
