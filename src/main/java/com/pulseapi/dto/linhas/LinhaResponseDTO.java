package com.pulseapi.dto.linhas;

import com.pulseapi.entity.StatusLinha;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class LinhaResponseDTO {

    private Long id;
    private String nome;
    private String codigo;
    private String descricao;
    private StatusLinha status;

    private Long plantaId;
    private String plantaNome;

    private Long empresaId;
    private String empresaNome;

    private LocalDateTime dataCadastro;
    private LocalDateTime ultimaAtualizacao;

    public LinhaResponseDTO() {
    }
}