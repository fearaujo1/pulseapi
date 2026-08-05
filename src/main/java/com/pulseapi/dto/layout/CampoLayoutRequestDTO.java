package com.pulseapi.dto.layout;

import com.pulseapi.entity.TipoCampoLayout;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CampoLayoutRequestDTO {

    @NotBlank(message = "A chave do campo é obrigatória.")
    private String chave;

    @NotBlank(message = "O rótulo do campo é obrigatório.")
    private String rotulo;

    @NotNull(message = "A ordem do campo é obrigatória.")
    @Min(value = 1, message = "A ordem deve ser maior que zero.")
    private Integer ordem;

    @NotNull(message = "O tipo de dado é obrigatório.")
    private TipoCampoLayout tipoDado;

    @Min(value = 1, message = "O comprimento deve ser maior que zero.")
    private Integer comprimento;

    @NotNull(message = "Informe se o campo é obrigatório.")
    private Boolean obrigatorio;

    private String formato;

    @Min(value = 0, message = "O offset não pode ser negativo.")
    private Integer offset;

    private String valorPadrao;
}