package com.pulseapi.controller;

import com.pulseapi.dto.parada.OcorrenciaRequestDTO;
import com.pulseapi.dto.parada.OcorrenciaResponseDTO;
import com.pulseapi.dto.parada.OcorrenciaStatusDTO;
import com.pulseapi.service.OcorrenciaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ocorrencias")
public class OcorrenciaController {

    private final OcorrenciaService ocorrenciaService;

    public OcorrenciaController(OcorrenciaService ocorrenciaService) {
        this.ocorrenciaService = ocorrenciaService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')")
    @GetMapping
    public ResponseEntity<List<OcorrenciaResponseDTO>> listarTodos() {
        return ResponseEntity.ok(ocorrenciaService.listarTodos());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')")
    @GetMapping("/{id}")
    public ResponseEntity<OcorrenciaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ocorrenciaService.buscarPorId(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')")
    @GetMapping("/equipamento/{equipamentoId}")
    public ResponseEntity<List<OcorrenciaResponseDTO>> listarPorEquipamento(@PathVariable Long equipamentoId) {
        return ResponseEntity.ok(ocorrenciaService.listarPorEquipamento(equipamentoId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')")
    @PostMapping
    public ResponseEntity<OcorrenciaResponseDTO> cadastrar(@RequestBody @Valid OcorrenciaRequestDTO dto) {
        OcorrenciaResponseDTO response = ocorrenciaService.registrarParada(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')")
    @PutMapping("/{id}")
    public ResponseEntity<OcorrenciaResponseDTO> atualizar(@PathVariable Long id,
                                                           @RequestBody @Valid OcorrenciaRequestDTO dto) {
        return ResponseEntity.ok(ocorrenciaService.atualizar(id, dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        ocorrenciaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<OcorrenciaResponseDTO> atualizarStatus(@PathVariable Long id,
                                                             @RequestBody @Valid OcorrenciaStatusDTO dto) {
        return ResponseEntity.ok(ocorrenciaService.atualizarStatus(id, dto));
    }
}