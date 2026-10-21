package com.pulseapi.controller;

import com.pulseapi.dto.relatorio.RelatorioEquipamentoResponseDTO;
import com.pulseapi.dto.relatorio.RelatorioGeralResponseDTO;
import com.pulseapi.dto.relatorio.RelatorioImpressaoResponseDTO;
import com.pulseapi.dto.relatorio.RelatorioOcorrenciaResponseDTO;
import com.pulseapi.entity.impressao.StatusFilaImpressao;
import com.pulseapi.entity.ocorrencia.StatusOcorrencia;
import com.pulseapi.entity.ocorrencia.TipoOcorrencia;
import com.pulseapi.service.RelatorioPdfService;
import com.pulseapi.service.RelatorioService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import java.time.LocalDate;

@RestController
@RequestMapping("/relatorios")
@PreAuthorize("hasAnyRole('ADMIN', 'GESTOR')")
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


    @GetMapping("/equipamentos")
    public ResponseEntity<RelatorioEquipamentoResponseDTO>
    gerarRelatorioEquipamentos() {

        return ResponseEntity.ok(
                relatorioService.gerarRelatorioEquipamentos()
        );
    }

    // =========================
    // RELATÓRIO GERAL
    // =========================

    @GetMapping("/geral")
    public ResponseEntity<RelatorioGeralResponseDTO>
    gerarRelatorioGeral(

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate dataInicial,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate dataFinal,

            Authentication authentication
    ) {
        String geradoPor =
                authentication != null
                        ? authentication.getName()
                        : "Não identificado";

        return ResponseEntity.ok(
                relatorioService.gerarRelatorioGeral(
                        dataInicial,
                        dataFinal,
                        geradoPor
                )
        );
    }

    // =====================
    // PDF de impressões
    // =====================


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

    @GetMapping(
            value = "/geral/pdf",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<byte[]> exportarRelatorioGeralPdf(

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate dataInicial,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate dataFinal,

            Authentication authentication
    ) {
        String geradoPor =
                authentication != null
                        ? authentication.getName()
                        : "Não identificado";

        byte[] pdf =
                relatorioPdfService.gerarPdfGeral(
                        dataInicial,
                        dataFinal,
                        geradoPor
                );

        String nomeArquivo =
                "relatorio-geral-"
                        + dataInicial
                        + "-a-"
                        + dataFinal
                        + ".pdf";

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename="
                                + nomeArquivo
                )
                .contentType(
                        MediaType.APPLICATION_PDF
                )
                .body(pdf);
    }
}