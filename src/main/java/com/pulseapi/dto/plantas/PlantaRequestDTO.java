package com.pulseapi.dto.plantas;

import com.pulseapi.entity.StatusPlanta;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlantaRequestDTO {

    @NotBlank(message = "O nome da planta é obrigatório.")
    @Size(
            max = 100,
            message = "O nome deve possuir no máximo 100 caracteres."
    )
    private String nome;

    @NotBlank(message = "O código da planta é obrigatório.")
    @Size(
            max = 50,
            message = "O código deve possuir no máximo 50 caracteres."
    )
    private String codigo;

    @Size(
            max = 255,
            message = "O endereço deve possuir no máximo 255 caracteres."
    )
    private String endereco;

    @Size(
            max = 100,
            message = "A cidade deve possuir no máximo 100 caracteres."
    )
    private String cidade;

    @Size(
            max = 2,
            message = "O estado deve possuir 2 caracteres."
    )
    private String estado;

    @NotNull(message = "O status da planta é obrigatório.")
    private StatusPlanta status;
    public PlantaRequestDTO() {
    }
}