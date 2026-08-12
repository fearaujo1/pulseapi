package com.pulseapi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="historico_comunicacao_domino")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoricoComunicacaoDomino {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipamento_id")
    private Equipamento equipamento;

    @Column(name="nome_comando", nullable = false, length = 100)
    private String nomeComando;

    @Lob
    @Column(name = "envio_hex", columnDefinition = "NVARCHAR(MAX)")
    private String envioHex;

    @Lob
    @Column(name = "envio_ascii", columnDefinition = "NVARCHAR(MAX)")
    private String envioAscii;

    @Lob
    @Column(name = "resposta_hex", columnDefinition = "NVARCHAR(MAX)")
    private String respostaHex;

    @Lob
    @Column(name = "resposta_ascii", columnDefinition = "NVARCHAR(MAX)")
    private String respostaAscii;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ResultadoComunicacaoDomino resultado;

    @Column(name = "mensagem_erro", length = 1000)
    private String mensagemErro;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    public void prePersist() {
        criadoEm = LocalDateTime.now();
    }
}
