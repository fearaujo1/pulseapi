package com.pulseapi.controller;

import com.pulseapi.dto.producao.*;
import com.pulseapi.service.ProducaoItemService;
import com.pulseapi.service.ProducaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.pulseapi.service.ProducaoExecucaoService;

@RestController
@RequestMapping("/producoes")
public class ProducaoController {

    private final ProducaoService producaoService;
    private final ProducaoItemService producaoItemService;
    private final ProducaoExecucaoService producaoExecucaoService;

    public ProducaoController(
            ProducaoService producaoService,
            ProducaoItemService producaoItemService,
            ProducaoExecucaoService producaoExecucaoService
    ) {
        this.producaoService = producaoService;
        this.producaoItemService = producaoItemService;
        this.producaoExecucaoService = producaoExecucaoService;
    }

    @PostMapping
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')"
    )
    public ResponseEntity<ProducaoResponseDTO> cadastrar(
            @RequestBody @Valid
            ProducaoRequestDTO dto
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        producaoService.cadastrar(dto)
                );
    }

    @GetMapping
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    public ResponseEntity<List<ProducaoResponseDTO>> listar() {
        return ResponseEntity.ok(
                producaoService.listar()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    public ResponseEntity<ProducaoResponseDTO> buscarPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                producaoService.buscarPorId(id)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')"
    )
    public ResponseEntity<ProducaoResponseDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid
            ProducaoRequestDTO dto
    ) {
        return ResponseEntity.ok(
                producaoService.atualizar(
                        id,
                        dto
                )
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR')"
    )
    public ResponseEntity<Void> deletar(
            @PathVariable Long id
    ) {
        producaoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/itens/lote")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')"
    )
    public ResponseEntity<ProducaoItensLoteResponseDTO>
    importarItens(
            @PathVariable Long id,
            @RequestBody @Valid
            ProducaoItensLoteRequestDTO dto
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        producaoItemService.importarLote(
                                id,
                                dto
                        )
                );
    }

    @GetMapping("/{id}/itens")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    public ResponseEntity<List<ProducaoItemResponseDTO>>
    listarItens(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                producaoItemService.listar(id)
        );
    }

    @PatchMapping("/{id}/finalizar-carga")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')"
    )
    public ResponseEntity<ProducaoResponseDTO>
    finalizarCarga(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                producaoService.finalizarCarga(id)
        );
    }

    @PatchMapping("/{id}/iniciar")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    public ResponseEntity<InicioProducaoResponseDTO>
    iniciar(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                producaoExecucaoService.iniciar(id)
        );
    }

    @PatchMapping("/{id}/finalizar-avaliacao")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    public ResponseEntity<FinalizacaoAvaliacaoResponseDTO>
    finalizarAvaliacao(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                producaoExecucaoService
                        .finalizarAvaliacao(id)
        );
    }

    @PatchMapping(
            "/{producaoId}/itens/{itemId}/marcar-retrabalho"
    )
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    public ResponseEntity<ItemRetrabalhoResponseDTO>
    marcarRetrabalho(
            @PathVariable Long producaoId,
            @PathVariable Long itemId
    ) {
        return ResponseEntity.ok(
                producaoExecucaoService
                        .marcarParaRetrabalho(
                                producaoId,
                                itemId
                        )
        );
    }

    @PatchMapping(
            "/{producaoId}/itens/{itemId}/desmarcar-retrabalho"
    )
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    public ResponseEntity<ItemRetrabalhoResponseDTO>
    desmarcarRetrabalho(
            @PathVariable Long producaoId,
            @PathVariable Long itemId
    ) {
        return ResponseEntity.ok(
                producaoExecucaoService
                        .desmarcarRetrabalho(
                                producaoId,
                                itemId
                        )
        );
    }

    @PatchMapping("/{id}/pausar")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    public ResponseEntity<ControleProducaoResponseDTO>
    pausar(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                producaoExecucaoService.pausar(id)
        );
    }

    @PatchMapping("/{id}/retomar")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    public ResponseEntity<ControleProducaoResponseDTO>
    retomar(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                producaoExecucaoService.retomar(id)
        );
    }

    @PatchMapping("/{id}/cancelar")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')"
    )
    public ResponseEntity<CancelamentoProducaoResponseDTO>
    cancelar(
            @PathVariable Long id,
            @RequestBody @Valid
            CancelarProducaoRequestDTO dto
    ) {
        return ResponseEntity.ok(
                producaoExecucaoService.cancelar(
                        id,
                        dto
                )
        );
    }
}