package com.pulseapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "configuracao_notificacao",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_config_notificacao_tipo",
                        columnNames = "tipo"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracaoNotificacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            unique = true,
            length = 50
    )
    private TipoNotificacao tipo;

    @Column(
            name = "notificacao_sistema_ativa",
            nullable = false
    )
    private Boolean notificacaoSistemaAtiva;

    @Column(
            name = "notificacao_email_ativa",
            nullable = false
    )
    private Boolean notificacaoEmailAtiva;

    @Column(
            name = "criado_em",
            nullable = false,
            updatable = false
    )
    private LocalDateTime criadoEm;

    @Column(
            name = "atualizado_em",
            nullable = false
    )
    private LocalDateTime atualizadoEm;

    @PrePersist
    public void prePersist() {

        if (notificacaoSistemaAtiva == null) {
            notificacaoSistemaAtiva = true;
        }

        if (notificacaoEmailAtiva == null) {
            notificacaoEmailAtiva = false;
        }

        LocalDateTime agora =
                LocalDateTime.now();

        criadoEm = agora;
        atualizadoEm = agora;
    }

    @PreUpdate
    public void preUpdate() {
        atualizadoEm = LocalDateTime.now();
    }
}