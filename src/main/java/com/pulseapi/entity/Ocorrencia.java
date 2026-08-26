package com.pulseapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "ocorrencias",
        indexes = {
                @Index(
                        name = "idx_ocorrencia_domino_status",
                        columnList = "FK_equipamento_id, origem, familia_status, jato, status"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ocorrencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;

    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoOcorrencia tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusOcorrencia status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FK_equipamento_id", nullable = false)
    private Equipamento equipamento;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;

    @Enumerated(EnumType.STRING)
    @Column(name = "origem", length = 20)
    private OrigemOcorrencia origem;

    @Column(name = "codigo_falha", length = 3)
    private String codigoFalha;

    @Column(name = "codigo_normalizacao", length = 3)
    private String codigoNormalizacao;

    @Column(name = "familia_status", length = 2)
    private String familiaStatus;

    @Column(name = "jato")
    private Integer jato;

    @Column(name = "detectado_em")
    private LocalDateTime detectadoEm;

    @Column(name = "normalizado_em")
    private LocalDateTime normalizadoEm;

    @PrePersist
    public void prePersist() {
        if (this.status == null) {
            this.status = StatusOcorrencia.ABERTA;
        }

        if (this.origem == null) {
            this.origem = OrigemOcorrencia.MANUAL;
        }

        LocalDateTime agora = LocalDateTime.now();

        this.criadoEm = agora;
        this.atualizadoEm = agora;
    }

    @PreUpdate
    public void preUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }


}