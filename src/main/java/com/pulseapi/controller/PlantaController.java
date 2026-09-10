package com.pulseapi.controller;

import com.pulseapi.dto.plantas.PlantaRequestDTO;
import com.pulseapi.dto.plantas.PlantaResponseDTO;
import com.pulseapi.service.PlantaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController 
@RequestMapping("/plantas")
public class PlantaController {

    private final PlantaService plantaService;

    public PlantaController(
            PlantaService plantaService
    ) {
        this.plantaService = plantaService;
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR')"
    )
    @PostMapping
    public ResponseEntity<PlantaResponseDTO> cadastrar(
            @RequestBody @Valid PlantaRequestDTO dto
    ) {
        PlantaResponseDTO response =
                plantaService.cadastrar(dto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    @GetMapping
    public ResponseEntity<List<PlantaResponseDTO>>
    listarTodas() {
        return ResponseEntity.ok(
                plantaService.listarTodas()
        );
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    @GetMapping("/{id}")
    public ResponseEntity<PlantaResponseDTO> buscarPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                plantaService.buscarPorId(id)
        );
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR')"
    )
    @PutMapping("/{id}")
    public ResponseEntity<PlantaResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid PlantaRequestDTO dto
    ) {
        return ResponseEntity.ok(
                plantaService.atualizar(id, dto)
        );
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR')"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Long id
    ) {
        plantaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}