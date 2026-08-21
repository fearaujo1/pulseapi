package com.pulseapi.controller;

import com.pulseapi.dto.notificacao.NotificacaoResponseDTO;
import com.pulseapi.entity.Usuario;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.UsuarioRepository;
import com.pulseapi.service.NotificacaoService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notificacoes")
public class NotificacaoController {

    private final NotificacaoService notificacaoService;
    private final UsuarioRepository usuarioRepository;

    public NotificacaoController(
            NotificacaoService notificacaoService,
            UsuarioRepository usuarioRepository
    ) {
        this.notificacaoService =
                notificacaoService;

        this.usuarioRepository =
                usuarioRepository;
    }


    // =========================================================
    // LISTAR TODAS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<NotificacaoResponseDTO>> listar(
            Authentication authentication
    ) {

        Usuario usuario =
                buscarUsuarioAutenticado(
                        authentication
                );

        return ResponseEntity.ok(
                notificacaoService.listarPorUsuario(
                        usuario.getId()
                )
        );
    }


    // =========================================================
    // LISTAR NÃO LIDAS
    // =========================================================

    @GetMapping("/nao-lidas")
    public ResponseEntity<List<NotificacaoResponseDTO>> listarNaoLidas(
            Authentication authentication
    ) {

        Usuario usuario =
                buscarUsuarioAutenticado(
                        authentication
                );

        return ResponseEntity.ok(
                notificacaoService.listarNaoLidas(
                        usuario.getId()
                )
        );
    }


    // =========================================================
    // CONTAR NÃO LIDAS
    // =========================================================

    @GetMapping("/nao-lidas/quantidade")
    public ResponseEntity<Map<String, Long>> contarNaoLidas(
            Authentication authentication
    ) {

        Usuario usuario =
                buscarUsuarioAutenticado(
                        authentication
                );

        long quantidade =
                notificacaoService.contarNaoLidas(
                        usuario.getId()
                );

        return ResponseEntity.ok(
                Map.of(
                        "quantidade",
                        quantidade
                )
        );
    }


    // =========================================================
    // MARCAR COMO LIDA
    // =========================================================

    @PatchMapping("/{id}/lida")
    public ResponseEntity<NotificacaoResponseDTO> marcarComoLida(
            @PathVariable Long id,
            Authentication authentication
    ) {

        Usuario usuario =
                buscarUsuarioAutenticado(
                        authentication
                );

        return ResponseEntity.ok(
                notificacaoService.marcarComoLida(
                        id,
                        usuario.getId()
                )
        );
    }


    // =========================================================
    // USUÁRIO AUTENTICADO
    // =========================================================

    private Usuario buscarUsuarioAutenticado(
            Authentication authentication
    ) {

        if (
                authentication == null ||
                        authentication.getName() == null
        ) {
            throw new ResourceNotFoundException(
                    "Usuário autenticado não encontrado."
            );
        }

        return usuarioRepository
                .findByEmail(
                        authentication.getName()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Usuário autenticado não encontrado."
                        )
                );
    }
}