package com.pulseapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificacoes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 50
    )
    private TipoNotificacao tipo;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private NivelNotificacao nivel;

    @Column(
            nullable = false,
            length = 200
    )
    private String titulo;

    @Column(
            nullable = false,
            length = 1000
    )
    private String mensagem;

    @Column(
            nullable = false
    )
    private Boolean lida;

    /*
     * Campos de contexto.
     * Podem ser nulos dependendo do evento.
     */

    @Column(name = "equipamento_id")
    private Long equipamentoId;

    @Column(name = "ocorrencia_id")
    private Long ocorrenciaId;

    @Column(name = "producao_id")
    private Long producaoId;

    @Column(name = "fila_impressao_id")
    private Long filaImpressaoId;

    /*
     * Usuário destinatário da notificação.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "usuario_id",
            nullable = false
    )
    private Usuario usuario;

    @Column(
            name = "criado_em",
            nullable = false,
            updatable = false
    )
    private LocalDateTime criadoEm;

    @PrePersist
    public void prePersist() {

        if (lida == null) {
            lida = false;
        }

        criadoEm =
                LocalDateTime.now();
    }
}