package com.pulseapi.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "campo_layout",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_campo_layout_chave",
                        columnNames = {"layout_id", "chave"}
                ),
                @UniqueConstraint(
                        name = "uk_campo_layout_ordem",
                        columnNames = {"layout_id", "ordem"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampoLayout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "layout_id", nullable = false)
    private LayoutImpressao layout;

    @Column(nullable = false, length = 50)
    private String chave;

    @Column(nullable = false, length = 100)
    private String rotulo;

    @Column(nullable = false)
    private Integer ordem;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_dado", nullable = false, length = 30)
    private TipoCampoLayout tipoDado;

    private Integer comprimento;

    @Column(nullable = false)
    private Boolean obrigatorio;

    @Column(length = 50)
    private String formato;

    private Integer offset;

    @Column(name = "valor_padrao", length = 255)
    private String valorPadrao;

    @PrePersist
    public void prePersist() {
        if (obrigatorio == null) {
            obrigatorio = false;
        }
    }
}