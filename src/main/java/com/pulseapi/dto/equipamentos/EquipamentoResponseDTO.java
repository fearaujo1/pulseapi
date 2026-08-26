package com.pulseapi.dto.equipamentos;

import com.pulseapi.entity.StatusEquipamento;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import com.pulseapi.entity.StatusConexaoEquipamento;

public class EquipamentoResponseDTO {

    @Getter
    @Setter
    private Long id;

    @Getter
    @Setter
    private String nome;

    @Getter
    @Setter
    private String codigo;

    @Getter
    @Setter
    private String tipo;

    @Getter
    @Setter
    private String fabricante;

    @Getter
    @Setter
    private String modelo;

    @Getter
    @Setter
    private String numeroSerie;

    @Getter
    @Setter
    private String setor;

    @Getter
    @Setter
    private StatusEquipamento status;

    @Getter
    @Setter
    private LocalDateTime dataCadastro;

    @Getter
    @Setter
    private LocalDateTime ultimaAtualizacao;

    @Getter
    @Setter
    private String ip;

    @Getter
    @Setter
    private Integer porta;

    @Getter
    @Setter
    private String protocolo;

    @Getter
    @Setter
    private StatusConexaoEquipamento statusConexao;

    @Getter
    @Setter
    private LocalDateTime ultimaConexaoEm;

    @Getter
    @Setter
    private LocalDateTime ultimaFalhaConexaoEm;

    public EquipamentoResponseDTO() {}

    public EquipamentoResponseDTO(Long id, String nome, String codigo,
                                  String tipo, String fabricante, String modelo,
                                  String numeroSerie, String setor,
                                  StatusEquipamento status,
                                  StatusConexaoEquipamento statusConexao,
                                  LocalDateTime ultimaConexaoEm,
                                  LocalDateTime ultimaFalhaConexaoEm,
                                  LocalDateTime dataCadastro,
                                  LocalDateTime ultimaAtualizacao, String ip,
                                  Integer porta, String protocolo) {
        this.id = id;
        this.nome = nome;
        this.codigo = codigo;
        this.tipo = tipo;
        this.fabricante = fabricante;
        this.modelo = modelo;
        this.numeroSerie = numeroSerie;
        this.setor = setor;
        this.status = status;
        this.statusConexao = statusConexao;
        this.ultimaConexaoEm = ultimaConexaoEm;
        this.ultimaFalhaConexaoEm = ultimaFalhaConexaoEm;
        this.dataCadastro = dataCadastro;
        this.ultimaAtualizacao = ultimaAtualizacao;
        this.ip = ip;
        this.porta = porta;
        this.protocolo = protocolo;

    }

}
