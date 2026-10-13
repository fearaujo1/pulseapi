package com.pulseapi.controller;

import com.pulseapi.dto.dashboard.DashboardResumoResponseDTO;
import com.pulseapi.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(
            DashboardService dashboardService
    ) {
        this.dashboardService =
                dashboardService;
    }

    @GetMapping("/resumo")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR', 'OPERADOR')"
    )
    public ResponseEntity<DashboardResumoResponseDTO>
    buscarResumo() {
        return ResponseEntity.ok(
                dashboardService.buscarResumo()
        );
    }
}