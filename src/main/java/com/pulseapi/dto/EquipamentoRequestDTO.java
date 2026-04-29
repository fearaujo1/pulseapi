package com.pulseapi.dto;

import com.pulseapi.entity.StatusEquipamento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

public class EquipamentoRequestDTO {

    @Getter
    @Setter
    @NotBlank(message = "O nome é obrigatório.")
    private String nome;

    @Getter
    @Setter
    @NotBlank(message = "O código é obrigatório")
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
    @NotNull(message = "O status é obrigatório.")
    private StatusEquipamento status;

    @Getter
    @Setter
    private String ip;

    @Getter
    @Setter
    private Integer porta;

    @Getter
    @Setter
    private String protocolo;

    public EquipamentoRequestDTO()  {}

}
