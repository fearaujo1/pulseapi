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

    private String tipo;

    @ManyToOne
    @JoinColumn(name = "FK_equipamento_id")
    private Equipamento equipamento;
}
