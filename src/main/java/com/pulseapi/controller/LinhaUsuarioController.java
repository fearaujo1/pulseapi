package com.pulseapi.controller;

import com.pulseapi.dto.linhas.LinhaUsuarioRequestDTO;
import com.pulseapi.dto.linhas.LinhaUsuarioResponseDTO;
import com.pulseapi.service.LinhaUsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/linhas")
@CrossOrigin(origins = "http://localhost:5173")
public class LinhaUsuarioController {

    private final LinhaUsuarioService linhaUsuarioService;

    public LinhaUsuarioController(
            LinhaUsuarioService linhaUsuarioService
    ) {
        this.linhaUsuarioService =
                linhaUsuarioService;
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR')"
    )
    @PostMapping("/{linhaId}/responsaveis")
    public ResponseEntity<LinhaUsuarioResponseDTO>
    vincular(
            @PathVariable Long linhaId,
            @RequestBody
            @Valid
            LinhaUsuarioRequestDTO dto
    ) {
        LinhaUsuarioResponseDTO response =
                linhaUsuarioService.vincular(
                        linhaId,
                        dto
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')"
    )
    @GetMapping("/{linhaId}/responsaveis")
    public ResponseEntity<
            List<LinhaUsuarioResponseDTO>
            >
    listarPorLinha(
            @PathVariable Long linhaId
    ) {
        return ResponseEntity.ok(
                linhaUsuarioService
                        .listarPorLinha(linhaId)
        );
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    @GetMapping("/usuarios/{usuarioId}")
    public ResponseEntity<
            List<LinhaUsuarioResponseDTO>
            >
    listarPorUsuario(
            @PathVariable Long usuarioId
    ) {
        return ResponseEntity.ok(
                linhaUsuarioService
                        .listarPorUsuario(usuarioId)
        );
    }

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR')"
    )
    @DeleteMapping(
            "/{linhaId}/responsaveis/{vinculoId}"
    )
    public ResponseEntity<Void> remover(
            @PathVariable Long linhaId,
            @PathVariable Long vinculoId
    ) {
        linhaUsuarioService.remover(
                linhaId,
                vinculoId
        );

        return ResponseEntity.noContent().build();
    }
}