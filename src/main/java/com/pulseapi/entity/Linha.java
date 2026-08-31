package com.pulseapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "linhas",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_linha_planta_codigo",
                        columnNames = {
                                "planta_id",
                                "codigo"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Linha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 50)
    private String codigo;

    @Column(length = 500)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusLinha status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "planta_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_linhas_planta"
            )
    )
    private Planta planta;

    @Column(name = "data_cadastro", nullable = false)
    private LocalDateTime dataCadastro;

    @Column(name = "ultima_atualizacao", nullable = false)
    private LocalDateTime ultimaAtualizacao;

    @PrePersist
    public void prePersist() {
        LocalDateTime agora = LocalDateTime.now();

        this.dataCadastro = agora;
        this.ultimaAtualizacao = agora;

        if (this.status == null) {
            this.status = StatusLinha.ATIVA;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.ultimaAtualizacao = LocalDateTime.now();
    }
}