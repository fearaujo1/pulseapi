package com.pulseapi.entity.linha;

import com.pulseapi.entity.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "linha_usuario",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_linha_usuario",
                        columnNames = {
                                "linha_id",
                                "usuario_id"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_linha_usuario_linha",
                        columnList = "linha_id"
                ),
                @Index(
                        name = "idx_linha_usuario_usuario",
                        columnList = "usuario_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LinhaUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "linha_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_linha_usuario_linha"
            )
    )
    private Linha linha;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "usuario_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_linha_usuario_usuario"
            )
    )
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "papel_na_linha",
            nullable = false,
            length = 20
    )
    private PapelNaLinha papelNaLinha;

    @Column(
            name = "data_cadastro",
            nullable = false,
            updatable = false
    )
    private LocalDateTime dataCadastro;

    @PrePersist
    public void prePersist() {
        if (this.dataCadastro == null) {
            this.dataCadastro =
                    LocalDateTime.now();
        }
    }
}