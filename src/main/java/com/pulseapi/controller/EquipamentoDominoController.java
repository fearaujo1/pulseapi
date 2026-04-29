package com.pulseapi.controller;

import com.pulseapi.entity.Equipamento;
import com.pulseapi.integration.domino.service.DominoReadService;
import com.pulseapi.integration.domino.dto.*;
import com.pulseapi.repository.EquipamentoRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/equipamentos/{id}/domino")
public class EquipamentoDominoController {

    private final EquipamentoRepository equipamentoRepository;
    private final DominoReadService dominoReadService;

    public EquipamentoDominoController(
            EquipamentoRepository equipamentoRepository,
            DominoReadService dominoReadService
    ) {
        this.equipamentoRepository = equipamentoRepository;
        this.dominoReadService = dominoReadService;
    }

    private Equipamento getEquipamento(Long id) {
        return equipamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipamento não encontrado"));
    }

    @GetMapping("/status")
    public DominoStatusResponseDTO status(@PathVariable Long id) {
        Equipamento eq = getEquipamento(id);
        return dominoReadService.buscarStatus(eq.getIp(), eq.getPorta(), 3000);
    }

    @GetMapping("/status-atual")
    public DominoCurrentStatusResponseDTO statusAtual(@PathVariable Long id) {
        Equipamento eq = getEquipamento(id);
        return dominoReadService.buscarStatusAtual(eq.getIp(), eq.getPorta(), 3000);
    }

    @GetMapping("/identidade")
    public DominoIdentityResponseDTO identidade(@PathVariable Long id) {
        Equipamento eq = getEquipamento(id);
        return dominoReadService.buscarIdentidade(eq.getIp(), eq.getPorta(), 3000);
    }

    @GetMapping("/alertas")
    public DominoAlertResponseDTO alertas(@PathVariable Long id) {
        Equipamento eq = getEquipamento(id);
        return dominoReadService.buscarAlertas(eq.getIp(), eq.getPorta(), 3000);
    }

    @PostMapping("/imprimir")
    public DominoRawResponseDTO imprimir (
            @PathVariable Long id,
            @RequestBody DominoPrintRequestDTO request
    ) {
        Equipamento eq = getEquipamento(id);

        return dominoReadService.imprimirTexto(
                eq.getIp(),
                eq.getPorta() != null ? eq.getPorta() : 7000,
                3000,
                request.getMensagem()
        );
    }
}
