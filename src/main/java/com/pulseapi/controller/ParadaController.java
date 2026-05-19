package com.pulseapi.controller;

import com.pulseapi.dto.parada.ParadaRequestDTO;
import com.pulseapi.dto.parada.ParadaResponseDTO;
import com.pulseapi.service.ParadaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/paradas")
public class ParadaController {

    private final ParadaService paradaService;

    public ParadaController(ParadaService paradaService) {
        this.paradaService = paradaService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')")
    @GetMapping
    public ResponseEntity<List<ParadaResponseDTO>> listarTodos() {
        return ResponseEntity.ok(paradaService.listarTodos());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')")
    @GetMapping("/{id}")
    public ResponseEntity<ParadaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(paradaService.buscarPorId(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')")
    @GetMapping("/equipamento/{equipamentoId}")
    public ResponseEntity<List<ParadaResponseDTO>> listarPorEquipamento(@PathVariable Long equipamentoId) {
        return ResponseEntity.ok(paradaService.listarPorEquipamento(equipamentoId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')")
    @PostMapping
    public ResponseEntity<ParadaResponseDTO> criar(@RequestBody @Valid ParadaRequestDTO dto) {
        ParadaResponseDTO response = paradaService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')")
    @PutMapping("/{id}")
    public ResponseEntity<ParadaResponseDTO> atualizar(@PathVariable Long id,
                                                       @RequestBody @Valid ParadaRequestDTO dto) {
        return ResponseEntity.ok(paradaService.atualizar(id, dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        paradaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}