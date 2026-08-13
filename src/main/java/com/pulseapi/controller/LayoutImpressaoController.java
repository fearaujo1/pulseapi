package com.pulseapi.controller;

import com.pulseapi.dto.layout.LayoutImpressaoRequestDTO;
import com.pulseapi.dto.layout.LayoutImpressaoResponseDTO;
import com.pulseapi.service.LayoutImpressaoService;
import com.pulseapi.service.PayloadMontadorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.pulseapi.dto.layout.MontarPayloadRequestDTO;
import com.pulseapi.dto.layout.MontarPayloadResponseDTO;
import com.pulseapi.service.PayloadMontadorService;

import java.util.List;

@RestController
@RequestMapping("/layouts-impressao")
public class LayoutImpressaoController {

    private final LayoutImpressaoService layoutService;
    private final PayloadMontadorService payloadMontadorService;

    public LayoutImpressaoController(
            LayoutImpressaoService layoutService,
            PayloadMontadorService payloadMontadorService
    ) {
        this.layoutService = layoutService;
        this.payloadMontadorService = payloadMontadorService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')")
    @PostMapping
    public ResponseEntity<LayoutImpressaoResponseDTO> criar(
            @RequestBody @Valid LayoutImpressaoRequestDTO dto
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(layoutService.criar(dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')")
    @GetMapping
    public ResponseEntity<List<LayoutImpressaoResponseDTO>> listar() {
        return ResponseEntity.ok(layoutService.listar());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')")
    @GetMapping("/{id}")
    public ResponseEntity<LayoutImpressaoResponseDTO> buscarPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(layoutService.buscarPorId(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')")
    @GetMapping("/equipamento/{equipamentoId}")
    public ResponseEntity<List<LayoutImpressaoResponseDTO>>
    listarPorEquipamento(
            @PathVariable Long equipamentoId
    ) {
        return ResponseEntity.ok(
                layoutService.listarPorEquipamento(equipamentoId)
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')")
    @PutMapping("/{id}")
    public ResponseEntity<LayoutImpressaoResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid LayoutImpressaoRequestDTO dto
    ) {
        return ResponseEntity.ok(
                layoutService.atualizar(id, dto)
        );
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id
    ) {
        layoutService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')")
    @PostMapping("/montar-payload")
    public ResponseEntity<MontarPayloadResponseDTO> montarPayload(
            @RequestBody @Valid MontarPayloadRequestDTO dto
    ) {
        return ResponseEntity.ok(
                payloadMontadorService.montar(
                        dto.layoutId(),
                        dto.valores()
                )
        );
    }
}