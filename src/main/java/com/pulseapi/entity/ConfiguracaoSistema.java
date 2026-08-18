package com.pulseapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "configuracao_sistema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfiguracaoSistema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "controle_acesso_turno_ativo",
            nullable = false
    )
    private Boolean controleAcessoTurnoAtivo;

    @Column(
            name = "tolerancia_turno_minutos",
            nullable = false
    )
    private Integer toleranciaTurnoMinutos;

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
        if (controleAcessoTurnoAtivo == null) {
            controleAcessoTurnoAtivo = false;
        }

        if (toleranciaTurnoMinutos == null) {
            toleranciaTurnoMinutos = 60;
        }

        LocalDateTime agora = LocalDateTime.now();

        criadoEm = agora;
        atualizadoEm = agora;
    }

    @PreUpdate
    public void preUpdate() {
        atualizadoEm = LocalDateTime.now();
    }
}