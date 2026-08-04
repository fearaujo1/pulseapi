package com.pulseapi.controller;

import com.pulseapi.integration.domino.dto.DominoConfigurationResponse;
import com.pulseapi.integration.domino.dto.DominoIdentityResponse;
import com.pulseapi.integration.domino.dto.DominoStatusResponse;
import com.pulseapi.integration.domino.service.EquipamentoDominoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/equipamentos/{equipamentoId}/domino")
public class EquipamentoDominoController {

    private final EquipamentoDominoService equipamentoDominoService;

    public EquipamentoDominoController(
            EquipamentoDominoService equipamentoDominoService
    ) {
        this.equipamentoDominoService = equipamentoDominoService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')")
    @GetMapping("/identidade")
    public ResponseEntity<DominoIdentityResponse> consultarIdentidade(
            @PathVariable Long equipamentoId
    ) {
        return ResponseEntity.ok(
                equipamentoDominoService.consultarIdentidade(equipamentoId)
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')")
    @GetMapping("/status")
    public ResponseEntity<DominoStatusResponse> consultarStatus(
            @PathVariable Long equipamentoId
    ) {
        return ResponseEntity.ok(
                equipamentoDominoService.consultarStatus(equipamentoId)
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')")
    @GetMapping("/configuracao")
    public ResponseEntity<DominoConfigurationResponse> consultarConfiguracao(
            @PathVariable Long equipamentoId
    ) {
        return ResponseEntity.ok(
                equipamentoDominoService.consultarConfiguracao(equipamentoId)
        );
    }
}