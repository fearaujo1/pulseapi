package com.pulseapi.entity.impressao;

import com.pulseapi.entity.equipamento.Equipamento;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import com.pulseapi.entity.producao.ProducaoItem;

@Entity
@Table(name = "fila_impressao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FilaImpressao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipamento_id", nullable = false)
    private Equipamento equipamento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "layout_id", nullable = false)
    private LayoutImpressao layout;

    /*
     * Nulo para impressões adicionadas manualmente.
     *
     * Quando preenchido, indica qual item da produção
     * originou este registro da fila.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "producao_item_id",
            foreignKey = @ForeignKey(
                    name = "fk_fila_impressao_producao_item"
            )
    )
    private ProducaoItem producaoItem;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "etapa_producao",
            length = 20
    )
    private EtapaFilaProducao etapaProducao;

    @Lob
    @Column(name = "valores_json", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String valoresJson;

    @Lob
    @Column(name = "payload_montado", columnDefinition = "NVARCHAR(MAX)")
    private String payloadMontado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusFilaImpressao status;

    @Column(name = "ordem_fila", nullable = false)
    private Long ordemFila;

    @Column(nullable = false)
    private Integer tentativas;

    @Column(name = "mensagem_erro", length = 1000)
    private String mensagemErro;

    @Column(name = "contador_antes_envio")
    private Long contadorAntesEnvio;

    @Column(name = "contador_carregamento")
    private Long contadorCarregamento;

    @Column(name = "contador_apos_impressao")
    private Long contadorAposImpressao;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "enviado_em")
    private LocalDateTime enviadoEm;

    @Column(name = "impresso_em")
    private LocalDateTime impressoEm;

    @PrePersist
    public void prePersist() {
        criadoEm = LocalDateTime.now();

        if (status == null) {
            status = StatusFilaImpressao.PENDENTE;
        }

        if (tentativas == null) {
            tentativas = 0;
        }
    }
}