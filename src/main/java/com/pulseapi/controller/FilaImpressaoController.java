package com.pulseapi.controller;

import com.pulseapi.dto.fila.FilaImpressaoRequestDTO;
import com.pulseapi.dto.fila.FilaImpressaoResponseDTO;
import com.pulseapi.service.FilaImpressaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fila-impressao")
public class FilaImpressaoController {

    private final FilaImpressaoService filaImpressaoService;

    public FilaImpressaoController(
            FilaImpressaoService filaImpressaoService
    ) {
        this.filaImpressaoService = filaImpressaoService;
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    @PostMapping
    public ResponseEntity<FilaImpressaoResponseDTO> adicionar(
            @RequestBody @Valid FilaImpressaoRequestDTO dto
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(filaImpressaoService.adicionar(dto));
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')"
    )
    @GetMapping
    public ResponseEntity<List<FilaImpressaoResponseDTO>> listar() {
        return ResponseEntity.ok(
                filaImpressaoService.listar()
        );
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    @GetMapping("/{id}")
    public ResponseEntity<FilaImpressaoResponseDTO> buscarPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                filaImpressaoService.buscarPorId(id)
        );
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    @GetMapping("/equipamento/{equipamentoId}")
    public ResponseEntity<List<FilaImpressaoResponseDTO>>
    listarPorEquipamento(
            @PathVariable Long equipamentoId
    ) {
        return ResponseEntity.ok(
                filaImpressaoService.listarPorEquipamento(equipamentoId)
        );
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    @GetMapping("/equipamento/{equipamentoId}/pendentes")
    public ResponseEntity<List<FilaImpressaoResponseDTO>>
    listarPendentes(
            @PathVariable Long equipamentoId
    ) {
        return ResponseEntity.ok(
                filaImpressaoService.listarPendentes(equipamentoId)
        );
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')"
    )
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<FilaImpressaoResponseDTO> cancelar(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                filaImpressaoService.cancelar(id)
        );
    }
}