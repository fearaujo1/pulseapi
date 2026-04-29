package com.pulseapi.controller;

import com.pulseapi.dto.EquipamentoRequestDTO;
import com.pulseapi.dto.EquipamentoResponseDTO;
import com.pulseapi.dto.EquipamentoStatusDTO;
import com.pulseapi.service.EquipamentoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/equipamentos")
public class EquipamentoController {
    private final EquipamentoService equipamentoService;

    public EquipamentoController(EquipamentoService equipamentoService) {
        this.equipamentoService = equipamentoService;
    }

    @PostMapping
    public ResponseEntity<EquipamentoResponseDTO> criar(@RequestBody @Valid EquipamentoRequestDTO dto) {
        EquipamentoResponseDTO response = equipamentoService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<EquipamentoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(equipamentoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipamentoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(equipamentoService.buscarPorId(id));
    }

    @PutMapping("{id}")
    public ResponseEntity<EquipamentoResponseDTO> atualizar(@PathVariable Long id,
                                                            @RequestBody @Valid EquipamentoRequestDTO dto) {
        return ResponseEntity.ok(equipamentoService.atualizar(id, dto));
    }

    @DeleteMapping("{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        equipamentoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<EquipamentoResponseDTO> atualizarStatus(@PathVariable Long id,
                                                                  @RequestBody @Valid EquipamentoStatusDTO dto) {
        return ResponseEntity.ok(equipamentoService.atualizarStatus(id, dto));
    }
}