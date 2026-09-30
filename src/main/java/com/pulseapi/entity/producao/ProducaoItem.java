package com.pulseapi.entity.producao;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "producao_itens",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_producao_item_sequencia",
                        columnNames = {
                                "producao_id",
                                "sequencia"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_producao_item_producao",
                        columnList = "producao_id"
                ),
                @Index(
                        name = "idx_producao_item_status",
                        columnList = "status"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProducaoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long versao;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "producao_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_producao_itens_producao"
            )
    )
    private Producao producao;

    @Column(nullable = false)
    private Integer sequencia;

    /*
     * Identificador opcional recebido do ERP.
     * Pode ser código, chave, serial ou outro
     * identificador externo.
     */
    @Column(
            name = "referencia_externa",
            length = 150
    )
    private String referenciaExterna;

    @Lob
    @Column(
            name = "valores_json",
            nullable = false,
            columnDefinition = "NVARCHAR(MAX)"
    )
    private String valoresJson;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 40
    )
    private StatusProducaoItem status;

    @Column(
            name = "mensagem_erro",
            length = 1000
    )
    private String mensagemErro;

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

    @Column(name = "impresso_em")
    private LocalDateTime impressoEm;

    @PrePersist
    public void prePersist() {
        LocalDateTime agora =
                LocalDateTime.now();

        criadoEm = agora;
        atualizadoEm = agora;

        if (status == null) {
            status =
                    StatusProducaoItem.AGUARDANDO;
        }
    }

    @PreUpdate
    public void preUpdate() {
        atualizadoEm =
                LocalDateTime.now();
    }
}