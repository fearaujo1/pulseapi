package com.pulseapi.dto.setup;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SetupInicialRequestDTO {

    @Valid
    @NotNull
    private EmpresaSetupDTO empresa;

    @Valid
    @NotNull
    private AdminSetupDTO admin;
}
