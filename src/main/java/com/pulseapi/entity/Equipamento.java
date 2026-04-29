package com.pulseapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "equipamentos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String codigo;

    private String tipo;
    private String fabricante;
    private String modelo;
    private String numeroSerie;
    private String setor;

    @Column(name = "ip")
    private String ip;

    @Column(name = "porta")
    private Integer porta;

    @Column(name = "protocolo")
    private String protocolo;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING) // Armazena o valor como texto no banco (Enum)
    private StatusEquipamento status;

    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaAtualizacao;

    @PrePersist // Metodo será executado antes de salvar a entidade pela primeira vez no banco
    public void prePersist() {
        this.dataCadastro = LocalDateTime.now();
        this.ultimaAtualizacao = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.ultimaAtualizacao = LocalDateTime.now();
    }


}
