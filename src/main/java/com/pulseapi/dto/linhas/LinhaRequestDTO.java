package com.pulseapi.dto.linhas;

import com.pulseapi.entity.StatusLinha;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LinhaRequestDTO {

    @NotBlank(message = "O nome da linha é obrigatório.")
    @Size(
            max = 100,
            message = "O nome deve possuir no máximo 100 caracteres."
    )
    private String nome;

    @NotBlank(message = "O código da linha é obrigatório.")
    @Size(
            max = 50,
            message = "O código deve possuir no máximo 50 caracteres."
    )
    private String codigo;

    @Size(
            max = 500,
            message = "A descrição deve possuir no máximo 500 caracteres."
    )
    private String descricao;

    @NotNull(message = "O status da linha é obrigatório.")
    private StatusLinha status;

    @NotNull(message = "A planta é obrigatória.")
    private Long plantaId;

    public LinhaRequestDTO() {
    }
}