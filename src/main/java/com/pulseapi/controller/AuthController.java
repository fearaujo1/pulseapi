package com.pulseapi.controller;

import com.pulseapi.dto.auth.LoginRequestDTO;
import com.pulseapi.dto.auth.LoginResponseDTO;
import com.pulseapi.dto.auth.PrimeiroAcessoRequestDTO;
import com.pulseapi.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @PatchMapping("/primeiro-acesso")
    public ResponseEntity<Void> trocarSenhaPrimeiroAcesso(
            @RequestBody @Valid PrimeiroAcessoRequestDTO dto,
            Authentication authentication
    ) {
        String email = authentication.getName();

        authService.trocarSenhaPrimeiroAcesso(email, dto);

        return ResponseEntity.noContent().build();
    }
}
