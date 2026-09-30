package com.pulseapi.entity.producao;

import com.pulseapi.entity.equipamento.Equipamento;
import com.pulseapi.entity.impressao.LayoutImpressao;
import com.pulseapi.entity.linha.Linha;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "producoes",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_producoes_codigo_ordem",
                        columnNames = "codigo_ordem"
                )
        },
        indexes = {
                @Index(
                        name = "idx_producoes_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_producoes_linha",
                        columnList = "linha_id"
                ),
                @Index(
                        name = "idx_producoes_equipamento_principal",
                        columnList = "equipamento_principal_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long versao;

    @Column(
            name = "codigo_ordem",
            nullable = false,
            length = 100
    )
    private String codigoOrdem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "linha_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_producoes_linha"
            )
    )
    private Linha linha;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "equipamento_principal_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_producoes_equipamento_principal"
            )
    )
    private Equipamento equipamentoPrincipal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "layout_principal_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_producoes_layout_principal"
            )
    )
    private LayoutImpressao layoutPrincipal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "equipamento_retrabalho_id",
            foreignKey = @ForeignKey(
                    name = "fk_producoes_equipamento_retrabalho"
            )
    )
    private Equipamento equipamentoRetrabalho;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "layout_retrabalho_id",
            foreignKey = @ForeignKey(
                    name = "fk_producoes_layout_retrabalho"
            )
    )
    private LayoutImpressao layoutRetrabalho;

    /*
     * Calculada automaticamente ao finalizar
     * a importação dos itens.
     */
    @Column(name = "quantidade_total")
    private Long quantidadeTotal;

    /*
     * Informação da produção.
     * A aplicação na impressora será tratada
     * posteriormente pela integração Domino.
     */
    @Column(name = "validade_dias")
    private Integer validadeDias;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private StatusProducao status;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status_antes_pausa",
            length = 30
    )
    private StatusProducao statusAntesPausa;

    @Column(length = 1000)
    private String observacoes;

    @Column(
            name = "motivo_cancelamento",
            length = 500
    )
    private String motivoCancelamento;

    @Column(
            name = "carga_finalizada_em"
    )
    private LocalDateTime cargaFinalizadaEm;

    @Column(name = "iniciada_em")
    private LocalDateTime iniciadaEm;

    @Column(name = "concluida_em")
    private LocalDateTime concluidaEm;

    @Column(name = "cancelada_em")
    private LocalDateTime canceladaEm;

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
        LocalDateTime agora =
                LocalDateTime.now();

        criadoEm = agora;
        atualizadoEm = agora;

        if (status == null) {
            status =
                    StatusProducao.AGUARDANDO_DADOS;
        }
    }

    @PreUpdate
    public void preUpdate() {
        atualizadoEm =
                LocalDateTime.now();
    }
}