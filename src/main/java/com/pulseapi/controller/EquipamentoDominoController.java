package com.pulseapi.controller;

import com.pulseapi.integration.domino.dto.*;
import com.pulseapi.integration.domino.service.EquipamentoDominoService;
import jakarta.validation.Valid;
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

    @GetMapping("/fifo/quantidade")
    public ResponseEntity<DominoFifoCountResponse> consultarQuantidadeFifo(
            @PathVariable Long equipamentoId
    ) {
        return ResponseEntity.ok(
                equipamentoDominoService.consultarQuantidadeFifo(equipamentoId)
        );
    }

    @PostMapping("/fifo")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')")
    public ResponseEntity<DominoFifoSendResponse> enviarDadosFifo(
            @PathVariable Long equipamentoId,
            @RequestBody @Valid DominoFifoRequest request
    ) {
        return ResponseEntity.ok(
                equipamentoDominoService.enviarDadosFifo(
                        equipamentoId,
                        request.dados()
                )
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')")
    @GetMapping("/layout-online")
    public ResponseEntity<DominoLayoutOnlineResponse> consultarLayoutOnline(
            @PathVariable Long equipamentoId
    ) {
        return ResponseEntity.ok(
                equipamentoDominoService.consultarLayoutOnline(equipamentoId)
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')")
    @PostMapping("/layout-online")
    public ResponseEntity<Void> selecionarLayout(
            @PathVariable Long equipamentoId,
            @RequestParam String nome
    ) {
        equipamentoDominoService.selecionarLayout(
                equipamentoId,
                nome
        );

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/contador-produtos")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    public ResponseEntity<DominoProductCountResponse> consultarContadorProduto(
            @PathVariable Long equipamentoId
    ) {
        return ResponseEntity.ok(
                equipamentoDominoService.consultarContadorProduto(equipamentoId)
        );
    }
}