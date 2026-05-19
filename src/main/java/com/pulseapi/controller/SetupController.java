package com.pulseapi.controller;

import com.pulseapi.dto.setup.SetupInicialRequestDTO;
import com.pulseapi.dto.setup.SetupStatusResponseDTO;
import com.pulseapi.service.SetupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/setup")
public class SetupController {

    private final SetupService setupService;

    public SetupController(SetupService setupService) {
        this.setupService = setupService;
    }

    @GetMapping("/status")
    public ResponseEntity<SetupStatusResponseDTO> verificarStatus() {
        return ResponseEntity.ok(setupService.verificarStatus());
    }

    @PostMapping("/inicial")
    public ResponseEntity<Void> configurarInicialmente(@RequestBody @Valid SetupInicialRequestDTO dto) {
        setupService.configurarInicialmente(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    
}
