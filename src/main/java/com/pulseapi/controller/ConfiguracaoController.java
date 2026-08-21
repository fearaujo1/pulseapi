package com.pulseapi.controller;

import com.pulseapi.dto.configuracao.*;
import com.pulseapi.entity.Empresa;
import com.pulseapi.entity.TipoNotificacao;
import com.pulseapi.service.ConfiguracaoNotificacaoService;
import com.pulseapi.service.ConfiguracaoSistemaService;
import com.pulseapi.service.EmpresaService;
import com.pulseapi.service.TurnoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/configuracoes")
public class ConfiguracaoController {

    private final EmpresaService empresaService;
    private final TurnoService turnoService;
    private final ConfiguracaoSistemaService configuracaoSistemaService;
    private final ConfiguracaoNotificacaoService configuracaoNotificacaoService;

    public ConfiguracaoController(
            EmpresaService empresaService,
            TurnoService turnoService,
            ConfiguracaoSistemaService configuracaoSistemaService,
            ConfiguracaoNotificacaoService configuracaoNotificacaoService
    ) {
        this.empresaService = empresaService;
        this.turnoService = turnoService;
        this.configuracaoSistemaService = configuracaoSistemaService;
        this.configuracaoNotificacaoService = configuracaoNotificacaoService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/empresa")
    public ResponseEntity<Empresa>
    buscarEmpresa() {

        return ResponseEntity.ok(
                empresaService.buscarEmpresaAtual()
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/empresa/{id}")
    public ResponseEntity<Empresa>
    atualizarEmpresa(
            @PathVariable Long id,
            @RequestBody Empresa empresa
    ) {

        return ResponseEntity.ok(
                empresaService.atualizarEmpresa(
                        id,
                        empresa
                )
        );
    }


    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/turnos")
    public ResponseEntity<TurnoResponseDTO> criarTurno(
            @RequestBody @Valid TurnoRequestDTO dto
    ) {
        return ResponseEntity.ok(
                turnoService.criar(dto)
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/turnos")
    public ResponseEntity<List<TurnoResponseDTO>> listarTurnos() {
        return ResponseEntity.ok(
                turnoService.listar()
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/turnos/{id}")
    public ResponseEntity<TurnoResponseDTO> buscarTurno(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                turnoService.buscarPorId(id)
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/turnos/{id}")
    public ResponseEntity<TurnoResponseDTO> atualizarTurno(
            @PathVariable Long id,
            @RequestBody @Valid TurnoRequestDTO dto
    ) {
        return ResponseEntity.ok(
                turnoService.atualizar(id, dto)
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/turnos/{id}")
    public ResponseEntity<Void> excluirTurno(
            @PathVariable Long id
    ) {
        turnoService.excluir(id);

        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/geral")
    public ResponseEntity<ConfiguracaoGeralResponseDTO>
    buscarConfiguracaoGeral() {

        return ResponseEntity.ok(
                configuracaoSistemaService.buscar()
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/geral")
    public ResponseEntity<ConfiguracaoGeralResponseDTO>
    atualizarConfiguracaoGeral(
            @RequestBody @Valid ConfiguracaoGeralRequestDTO dto
    ) {

        return ResponseEntity.ok(
                configuracaoSistemaService.atualizar(dto)
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/notificacoes")
    public ResponseEntity<List<ConfiguracaoNotificacaoResponseDTO>>
    listarConfiguracoesNotificacao() {

        return ResponseEntity.ok(
                configuracaoNotificacaoService.listar()
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/notificacoes/{tipo}")
    public ResponseEntity<ConfiguracaoNotificacaoResponseDTO>
    atualizarConfiguracaoNotificacao(

            @PathVariable TipoNotificacao tipo,

            @RequestBody
            @Valid
            ConfiguracaoNotificacaoUpdateDTO dto
    ) {

        return ResponseEntity.ok(
                configuracaoNotificacaoService.atualizar(tipo, dto)
        );
    }
}