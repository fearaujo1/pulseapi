package com.pulseapi.dto.plantas;

import com.pulseapi.entity.StatusPlanta;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class PlantaResponseDTO {

    private Long id;
    private String nome;
    private String codigo;
    private String endereco;
    private String cidade;
    private String estado;
    private StatusPlanta status;

    private Long empresaId;
    private String empresaNome;

    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaAtualizacao;

    public PlantaResponseDTO() {
    }
}