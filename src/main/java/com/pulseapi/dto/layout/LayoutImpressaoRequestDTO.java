package com.pulseapi.dto.layout;

import com.pulseapi.entity.EstrategiaMontagemPayload;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class LayoutImpressaoRequestDTO {

    @NotBlank(message = "O nome do layout é obrigatório.")
    private String nome;

    @NotBlank(message = "O nome do layout na impressora é obrigatório.")
    private String nomeNaImpressora;

    @NotNull(message = "O equipamento é obrigatório.")
    private Long equipamentoId;

    @NotNull(message = "A estratégia de montagem é obrigatória.")
    private EstrategiaMontagemPayload estrategiaMontagem;

    private String delimitador;

    private Boolean ativo;

    @Valid
    @NotEmpty(message = "O layout deve possuir pelo menos um campo.")
    private List<CampoLayoutRequestDTO> campos;
}