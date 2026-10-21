package com.pulseapi.controller;

import com.pulseapi.dto.fila.FilaImpressaoRequestDTO;
import com.pulseapi.dto.fila.FilaImpressaoResponseDTO;
import com.pulseapi.service.FilaImpressaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/fila-impressao")
public class FilaImpressaoController {

    private final FilaImpressaoService filaImpressaoService;

    public FilaImpressaoController(
            FilaImpressaoService filaImpressaoService
    ) {
        this.filaImpressaoService =
                filaImpressaoService;
    }

    @PostMapping
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    public ResponseEntity<FilaImpressaoResponseDTO>
    registrar(
            @RequestBody
            @Valid
            FilaImpressaoRequestDTO dto
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        filaImpressaoService.adicionar(dto)
                );
    }
}