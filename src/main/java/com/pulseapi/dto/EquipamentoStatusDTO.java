package com.pulseapi.dto;

import com.pulseapi.entity.StatusEquipamento;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EquipamentoStatusDTO {

    @NotNull(message = "O status é obrigatório.")
    private StatusEquipamento status;

    public EquipamentoStatusDTO() {}

    public StatusEquipamento getStatus() {
        return status;
    }

    public void setStatus(StatusEquipamento status) {
        this.status = status;
    }
}
