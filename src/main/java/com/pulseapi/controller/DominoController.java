package com.pulseapi.controller;

import com.pulseapi.integration.domino.dto.*;
import com.pulseapi.integration.domino.service.DominoReadService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/domino")
public class DominoController {

    private final DominoReadService dominoReadService;

    public DominoController(DominoReadService dominoReadService) {
        this.dominoReadService = dominoReadService;
    }

    @GetMapping("/teste-conexao")
    public DominoConnectionTestResponseDTO testarConexao(
            @RequestParam String ip,
            @RequestParam(defaultValue = "7000") int porta,
            @RequestParam(defaultValue = "3000") int timeout
    ) {
        return dominoReadService.testarConexao(ip, porta, timeout);
    }

    @GetMapping("/status")
    public DominoStatusResponseDTO buscarStatus(
            @RequestParam String ip,
            @RequestParam(defaultValue = "7000") int porta,
            @RequestParam(defaultValue = "3000") int timeout
    ) {
        return dominoReadService.buscarStatus(ip, porta, timeout);
    }

    @GetMapping("/status-atual")
    public DominoCurrentStatusResponseDTO buscarStatusAtual(
            @RequestParam String ip,
            @RequestParam(defaultValue = "7000") int porta,
            @RequestParam(defaultValue = "3000") int timeout
    ) {
        return dominoReadService.buscarStatusAtual(ip, porta, timeout);
    }

    @GetMapping("/identidade")
    public DominoIdentityResponseDTO buscarIdentidade(
            @RequestParam String ip,
            @RequestParam(defaultValue = "7000") int porta,
            @RequestParam(defaultValue = "3000") int timeout
    ) {
        return dominoReadService.buscarIdentidade(ip, porta, timeout);
    }

    @GetMapping("/alertas")
    public DominoAlertResponseDTO buscarAlertas(
            @RequestParam String ip,
            @RequestParam(defaultValue = "7000") int porta,
            @RequestParam(defaultValue = "3000") int timeout
    ) {
        return dominoReadService.buscarAlertas(ip, porta, timeout);
    }
}
