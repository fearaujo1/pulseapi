package com.pulseapi.controller;

import com.pulseapi.dto.relatorio.RelatorioEquipamentoResponseDTO;
import com.pulseapi.dto.relatorio.RelatorioImpressaoResponseDTO;
import com.pulseapi.dto.relatorio.RelatorioOcorrenciaResponseDTO;
import com.pulseapi.entity.StatusFilaImpressao;
import com.pulseapi.entity.StatusOcorrencia;
import com.pulseapi.entity.TipoOcorrencia;
import com.pulseapi.service.RelatorioPdfService;
import com.pulseapi.service.RelatorioService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/relatorios")
public class RelatorioController {

    private final RelatorioService relatorioService;
    private final RelatorioPdfService relatorioPdfService;

    public RelatorioController(
            RelatorioService relatorioService,
            RelatorioPdfService relatorioPdfService
    ) {
        this.relatorioService = relatorioService;
        this.relatorioPdfService = relatorioPdfService;
    }


    // ==============
    // IMPRESSÕES
    // ==============

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')"
    )
    @GetMapping("/impressoes")
    public ResponseEntity<RelatorioImpressaoResponseDTO>
    gerarRelatorioImpressoes(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dataInicial,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dataFinal,

            @RequestParam(required = false)
            Long equipamentoId,

            @RequestParam(required = false)
            StatusFilaImpressao status,

            @RequestParam(required = false)
            Long layoutId
    ) {

        return ResponseEntity.ok(
                relatorioService.gerarRelatorioImpressoes(
                        dataInicial,
                        dataFinal,
                        equipamentoId,
                        status,
                        layoutId
                )
        );
    }


    // ================
    // OCORRÊNCIAS
    // ================

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')"
    )
    @GetMapping("/ocorrencias")
    public ResponseEntity<RelatorioOcorrenciaResponseDTO>
    gerarRelatorioOcorrencias(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dataInicial,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dataFinal,

            @RequestParam(required = false)
            Long equipamentoId,

            @RequestParam(required = false)
            TipoOcorrencia tipo,

            @RequestParam(required = false)
            StatusOcorrencia status
    ) {

        return ResponseEntity.ok(
                relatorioService.gerarRelatorioOcorrencias(
                        dataInicial,
                        dataFinal,
                        equipamentoId,
                        tipo,
                        status
                )
        );
    }


    // =================
    // EQUIPAMENTOS
    // =================

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')"
    )
    @GetMapping("/equipamentos")
    public ResponseEntity<RelatorioEquipamentoResponseDTO>
    gerarRelatorioEquipamentos() {

        return ResponseEntity.ok(
                relatorioService.gerarRelatorioEquipamentos()
        );
    }

    // =====================
    // PDF de impressões
    // =====================

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')"
    )
    @GetMapping(
            value = "/impressoes/pdf",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<byte[]> exportarRelatorioImpressoesPdf(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dataInicial,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dataFinal,

            @RequestParam(required = false)
            Long equipamentoId,

            @RequestParam(required = false)
            StatusFilaImpressao status,

            @RequestParam(required = false)
            Long layoutId
    ) {

        byte[] pdf =
                relatorioPdfService.gerarPdfImpressoes(
                        dataInicial,
                        dataFinal,
                        equipamentoId,
                        status,
                        layoutId
                );

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=relatorio-impressoes.pdf"
                )
                .contentType(
                        MediaType.APPLICATION_PDF
                )
                .body(pdf);
    }

    // =====================
    // PDF de ocorrências
    // =====================

    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')"
    )
    @GetMapping(
            value = "/ocorrencias/pdf",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<byte[]> exportarRelatorioOcorrenciasPdf(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dataInicial,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dataFinal,

            @RequestParam(required = false)
            Long equipamentoId,

            @RequestParam(required = false)
            TipoOcorrencia tipo,

            @RequestParam(required = false)
            StatusOcorrencia status
    ) {

        byte[] pdf =
                relatorioPdfService.gerarPdfOcorrencias(
                        dataInicial,
                        dataFinal,
                        equipamentoId,
                        tipo,
                        status
                );

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=relatorio-ocorrencias.pdf"
                )
                .contentType(
                        MediaType.APPLICATION_PDF
                )
                .body(pdf);
    }

    // =======================
    // PDF de equipamentos
    // =======================
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'GESTOR', 'SUPERVISOR')"
    )
    @GetMapping(
            value = "/equipamentos/pdf",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<byte[]> exportarRelatorioEquipamentosPdf() {

        byte[] pdf =
                relatorioPdfService
                        .gerarPdfEquipamentos();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=relatorio-equipamentos.pdf"
                )
                .contentType(
                        MediaType.APPLICATION_PDF
                )
                .body(pdf);
    }
}