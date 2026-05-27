package com.pulseapi.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="parada")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Parada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;

    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoParada tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusParada status;

    @ManyToOne
    @JoinColumn(name = "FK_equipamento_id")
    private Equipamento equipamento;
    
    @PrePersist
    public void prePersist() {
        if (this.status == null) {
            this.status = StatusParada.ABERTA;
        }
    }
}
