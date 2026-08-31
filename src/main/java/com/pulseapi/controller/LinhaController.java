package com.pulseapi.controller;

import com.pulseapi.dto.linhas.LinhaRequestDTO;
import com.pulseapi.dto.linhas.LinhaResponseDTO;
import com.pulseapi.service.LinhaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/linhas")
public class LinhaController {

    private final LinhaService linhaService;

    public LinhaController(
            LinhaService linhaService
    ) {
        this.linhaService = linhaService;
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR')"
    )
    @PostMapping
    public ResponseEntity<LinhaResponseDTO> cadastrar(
            @RequestBody @Valid LinhaRequestDTO dto
    ) {
        LinhaResponseDTO response =
                linhaService.cadastrar(dto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    @GetMapping
    public ResponseEntity<List<LinhaResponseDTO>>
    listarPorPlanta(
            @RequestParam Long plantaId
    ) {
        return ResponseEntity.ok(
                linhaService.listarPorPlanta(
                        plantaId
                )
        );
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    @GetMapping("/{id}")
    public ResponseEntity<LinhaResponseDTO> buscarPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                linhaService.buscarPorId(id)
        );
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR')"
    )
    @PutMapping("/{id}")
    public ResponseEntity<LinhaResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid LinhaRequestDTO dto
    ) {
        return ResponseEntity.ok(
                linhaService.atualizar(id, dto)
        );
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR')"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Long id
    ) {
        linhaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}