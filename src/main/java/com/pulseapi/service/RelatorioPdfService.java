package com.pulseapi.service;

import com.pulseapi.dto.relatorio.*;
import com.pulseapi.entity.Empresa;
import com.pulseapi.entity.StatusFilaImpressao;
import com.pulseapi.entity.StatusOcorrencia;
import com.pulseapi.entity.TipoOcorrencia;
import com.pulseapi.repository.EmpresaRepository;
import org.openpdf.text.*;
import org.openpdf.text.pdf.*;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class RelatorioPdfService {

    private final RelatorioService relatorioService;
    private final EmpresaRepository empresaRepository;

    private static final DateTimeFormatter DATA_HORA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private static final DateTimeFormatter DATA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");


    // =========================================================
    // CORES
    // =========================================================

    private static final Color AZUL =
            new Color(37, 99, 235);

    private static final Color AZUL_ESCURO =
            new Color(15, 23, 42);

    private static final Color AZUL_CLARO =
            new Color(239, 246, 255);

    private static final Color CINZA =
            new Color(100, 116, 139);

    private static final Color CINZA_CLARO =
            new Color(248, 250, 252);

    private static final Color BORDA =
            new Color(226, 232, 240);

    private static final Color BRANCO =
            Color.WHITE;


    public RelatorioPdfService(
            RelatorioService relatorioService,
            EmpresaRepository empresaRepository
    ) {
        this.relatorioService = relatorioService;
        this.empresaRepository = empresaRepository;
    }


    // =========================================================
    // EMPRESA
    // =========================================================

    private Empresa buscarEmpresa() {
        return empresaRepository
                .findAll()
                .stream()
                .findFirst()
                .orElse(null);
    }


    // =========================================================
    // IMPRESSÕES
    // =========================================================

    public byte[] gerarPdfImpressoes(
            LocalDate dataInicial,
            LocalDate dataFinal,
            Long equipamentoId,
            StatusFilaImpressao status,
            Long layoutId
    ) {

        RelatorioImpressaoResponseDTO relatorio =
                relatorioService.gerarRelatorioImpressoes(
                        dataInicial,
                        dataFinal,
                        equipamentoId,
                        status,
                        layoutId
                );

        try (
                ByteArrayOutputStream output =
                        new ByteArrayOutputStream()
        ) {

            Document document = criarDocumento();

            PdfWriter writer =
                    PdfWriter.getInstance(
                            document,
                            output
                    );

            writer.setPageEvent(
                    new RodapePdf()
            );

            document.open();

            adicionarCabecalho(
                    document,
                    "Relatório de Impressões",
                    "Acompanhamento das operações de impressão industrial",
                    dataInicial,
                    dataFinal
            );

            adicionarSecaoTitulo(
                    document,
                    "Resumo"
            );

            adicionarResumoImpressoes(
                    document,
                    relatorio
            );

            adicionarEspaco(
                    document,
                    10
            );

            adicionarSecaoTitulo(
                    document,
                    "Filtros utilizados"
            );

            adicionarFiltros(
                    document,
                    "Equipamento",
                    equipamentoId == null
                            ? "Todos"
                            : buscarNomeEquipamentoImpressao(
                            relatorio,
                            equipamentoId
                    ),

                    "Status",
                    status == null
                            ? "Todos"
                            : formatarEnum(status),

                    "Layout",
                    layoutId == null
                            ? "Todos"
                            : buscarNomeLayout(
                            relatorio,
                            layoutId
                    )
            );

            adicionarEspaco(
                    document,
                    10
            );

            adicionarSecaoTitulo(
                    document,
                    "Registros"
            );

            PdfPTable table =
                    new PdfPTable(
                            new float[]{
                                    1.4f,
                                    2.1f,
                                    1.7f,
                                    3.0f,
                                    1.5f,
                                    1.4f
                            }
                    );

            configurarTabela(table);

            adicionarCabecalhoTabela(
                    table,
                    "Data",
                    "Equipamento",
                    "Layout",
                    "Payload",
                    "Status",
                    "Tentativas"
            );

            boolean alternar = false;

            for (
                    RelatorioImpressaoItemDTO item :
                    relatorio.itens()
            ) {

                adicionarCelula(
                        table,
                        formatarDataHora(
                                item.criadoEm()
                        ),
                        alternar
                );

                adicionarCelula(
                        table,
                        item.equipamentoNome(),
                        alternar
                );

                adicionarCelula(
                        table,
                        item.layoutNome(),
                        alternar
                );

                adicionarCelula(
                        table,
                        item.payloadMontado(),
                        alternar
                );

                adicionarCelula(
                        table,
                        formatarEnum(
                                item.status()
                        ),
                        alternar
                );

                adicionarCelulaCentralizada(
                        table,
                        item.tentativas(),
                        alternar
                );

                alternar = !alternar;
            }

            document.add(table);

            adicionarRodapeInformativo(
                    document,
                    relatorio.total()
            );

            document.close();

            return output.toByteArray();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Não foi possível gerar o PDF do relatório de impressões.",
                    e
            );
        }
    }


    // =========================================================
    // OCORRÊNCIAS
    // =========================================================

    public byte[] gerarPdfOcorrencias(
            LocalDate dataInicial,
            LocalDate dataFinal,
            Long equipamentoId,
            TipoOcorrencia tipo,
            StatusOcorrencia status
    ) {

        RelatorioOcorrenciaResponseDTO relatorio =
                relatorioService.gerarRelatorioOcorrencias(
                        dataInicial,
                        dataFinal,
                        equipamentoId,
                        tipo,
                        status
                );

        try (
                ByteArrayOutputStream output =
                        new ByteArrayOutputStream()
        ) {

            Document document =
                    criarDocumento();

            PdfWriter writer =
                    PdfWriter.getInstance(
                            document,
                            output
                    );

            writer.setPageEvent(
                    new RodapePdf()
            );

            document.open();

            adicionarCabecalho(
                    document,
                    "Relatório de Ocorrências",
                    "Análise de falhas, paradas e eventos registrados",
                    dataInicial,
                    dataFinal
            );

            adicionarSecaoTitulo(
                    document,
                    "Resumo"
            );

            adicionarResumoOcorrencias(
                    document,
                    relatorio
            );

            adicionarEspaco(
                    document,
                    10
            );

            adicionarSecaoTitulo(
                    document,
                    "Filtros utilizados"
            );

            adicionarFiltros(
                    document,

                    "Equipamento",
                    equipamentoId == null
                            ? "Todos"
                            : buscarNomeEquipamentoOcorrencia(
                            relatorio,
                            equipamentoId
                    ),

                    "Tipo",
                    tipo == null
                            ? "Todos"
                            : formatarEnum(tipo),

                    "Status",
                    status == null
                            ? "Todos"
                            : formatarEnum(status)
            );

            adicionarEspaco(
                    document,
                    10
            );

            adicionarSecaoTitulo(
                    document,
                    "Registros"
            );

            PdfPTable table =
                    new PdfPTable(
                            new float[]{
                                    1.3f,
                                    2.0f,
                                    2.2f,
                                    1.8f,
                                    1.5f,
                                    3.2f
                            }
                    );

            configurarTabela(table);

            adicionarCabecalhoTabela(
                    table,
                    "Data",
                    "Equipamento",
                    "Título",
                    "Tipo",
                    "Status",
                    "Descrição"
            );

            boolean alternar = false;

            for (
                    RelatorioOcorrenciaItemDTO item :
                    relatorio.itens()
            ) {

                adicionarCelula(
                        table,
                        formatarDataHora(
                                item.criadoEm()
                        ),
                        alternar
                );

                adicionarCelula(
                        table,
                        item.equipamentoNome(),
                        alternar
                );

                adicionarCelula(
                        table,
                        item.titulo(),
                        alternar
                );

                adicionarCelula(
                        table,
                        formatarEnum(
                                item.tipo()
                        ),
                        alternar
                );

                adicionarCelula(
                        table,
                        formatarEnum(
                                item.status()
                        ),
                        alternar
                );

                adicionarCelula(
                        table,
                        item.descricao(),
                        alternar
                );

                alternar = !alternar;
            }

            document.add(table);

            adicionarRodapeInformativo(
                    document,
                    relatorio.total()
            );

            document.close();

            return output.toByteArray();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Não foi possível gerar o PDF do relatório de ocorrências.",
                    e
            );
        }
    }


    // =========================================================
    // EQUIPAMENTOS
    // =========================================================

    public byte[] gerarPdfEquipamentos() {

        RelatorioEquipamentoResponseDTO relatorio =
                relatorioService
                        .gerarRelatorioEquipamentos();

        try (
                ByteArrayOutputStream output =
                        new ByteArrayOutputStream()
        ) {

            Document document =
                    criarDocumento();

            PdfWriter writer =
                    PdfWriter.getInstance(
                            document,
                            output
                    );

            writer.setPageEvent(
                    new RodapePdf()
            );

            document.open();

            adicionarCabecalho(
                    document,
                    "Relatório de Equipamentos",
                    "Visão geral dos equipamentos cadastrados no ambiente industrial",
                    null,
                    null
            );

            adicionarSecaoTitulo(
                    document,
                    "Resumo"
            );

            adicionarResumoEquipamentos(
                    document,
                    relatorio
            );

            adicionarEspaco(
                    document,
                    12
            );

            adicionarSecaoTitulo(
                    document,
                    "Equipamentos cadastrados"
            );

            PdfPTable table =
                    new PdfPTable(
                            new float[]{
                                    1.2f,
                                    2.2f,
                                    1.8f,
                                    1.6f,
                                    1.7f,
                                    1.5f,
                                    1.6f
                            }
                    );

            configurarTabela(table);

            adicionarCabecalhoTabela(
                    table,
                    "Código",
                    "Nome",
                    "Tipo",
                    "Setor",
                    "Modelo",
                    "Status",
                    "IP"
            );

            boolean alternar = false;

            for (
                    RelatorioEquipamentoItemDTO item :
                    relatorio.itens()
            ) {

                adicionarCelula(
                        table,
                        item.codigo(),
                        alternar
                );

                adicionarCelula(
                        table,
                        item.nome(),
                        alternar
                );

                adicionarCelula(
                        table,
                        item.tipo(),
                        alternar
                );

                adicionarCelula(
                        table,
                        item.setor(),
                        alternar
                );

                adicionarCelula(
                        table,
                        item.modelo(),
                        alternar
                );

                adicionarCelula(
                        table,
                        formatarEnum(
                                item.status()
                        ),
                        alternar
                );

                adicionarCelula(
                        table,
                        item.ip(),
                        alternar
                );

                alternar = !alternar;
            }

            document.add(table);

            adicionarRodapeInformativo(
                    document,
                    relatorio.total()
            );

            document.close();

            return output.toByteArray();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Não foi possível gerar o PDF do relatório de equipamentos.",
                    e
            );
        }
    }


    // =========================================================
    // DOCUMENTO
    // =========================================================

    private Document criarDocumento() {

        return new Document(
                PageSize.A4,
                30,
                30,
                36,
                45
        );
    }


    // =========================================================
    // CABEÇALHO
    // =========================================================

    private void adicionarCabecalho(
            Document document,
            String titulo,
            String descricao,
            LocalDate dataInicial,
            LocalDate dataFinal
    ) throws DocumentException {

        Empresa empresa =
                buscarEmpresa();

        /*
         * Ajuste getNome() caso sua entidade Empresa
         * utilize outro campo para o nome da empresa.
         */
        String nomeEmpresa =
                empresa != null
                        ? empresa.getRazaoSocial()
                        : "Empresa não configurada";


        // -----------------------------------------------------
        // IDENTIDADE
        // -----------------------------------------------------

        PdfPTable identidade =
                new PdfPTable(
                        new float[]{
                                1.2f,
                                5.8f
                        }
                );

        identidade.setWidthPercentage(100);

        PdfPCell marca =
                new PdfPCell();

        marca.setBackgroundColor(
                AZUL
        );

        marca.setBorder(
                Rectangle.NO_BORDER
        );

        marca.setPadding(12);

        Paragraph pulse =
                new Paragraph(
                        "P",
                        new Font(
                                Font.HELVETICA,
                                25,
                                Font.BOLD,
                                BRANCO
                        )
                );

        pulse.setAlignment(
                Element.ALIGN_CENTER
        );

        marca.addElement(pulse);


        PdfPCell empresaCell =
                new PdfPCell();

        empresaCell.setBorder(
                Rectangle.NO_BORDER
        );

        empresaCell.setPaddingLeft(15);
        empresaCell.setVerticalAlignment(
                Element.ALIGN_MIDDLE
        );

        Paragraph empresaNome =
                new Paragraph(
                        nomeEmpresa,
                        new Font(
                                Font.HELVETICA,
                                14,
                                Font.BOLD,
                                AZUL_ESCURO
                        )
                );

        empresaCell.addElement(
                empresaNome
        );

        Paragraph sistema =
                new Paragraph(
                        "PulseAPI  •  Smart Production Manager",
                        new Font(
                                Font.HELVETICA,
                                9,
                                Font.NORMAL,
                                CINZA
                        )
                );

        sistema.setSpacingBefore(2);

        empresaCell.addElement(
                sistema
        );

        identidade.addCell(
                marca
        );

        identidade.addCell(
                empresaCell
        );

        document.add(
                identidade
        );


        // -----------------------------------------------------
        // LINHA AZUL
        // -----------------------------------------------------

        PdfPTable linha =
                new PdfPTable(1);

        linha.setWidthPercentage(100);
        linha.setSpacingBefore(8);
        linha.setSpacingAfter(16);

        PdfPCell linhaCell =
                new PdfPCell(
                        new Phrase("")
                );

        linhaCell.setFixedHeight(3);
        linhaCell.setBackgroundColor(
                AZUL
        );

        linhaCell.setBorder(
                Rectangle.NO_BORDER
        );

        linha.addCell(
                linhaCell
        );

        document.add(
                linha
        );


        // -----------------------------------------------------
        // TÍTULO
        // -----------------------------------------------------

        Paragraph tituloParagraph =
                new Paragraph(
                        titulo,
                        new Font(
                                Font.HELVETICA,
                                20,
                                Font.BOLD,
                                AZUL_ESCURO
                        )
                );

        tituloParagraph.setSpacingAfter(
                3
        );

        document.add(
                tituloParagraph
        );


        Paragraph descricaoParagraph =
                new Paragraph(
                        descricao,
                        new Font(
                                Font.HELVETICA,
                                9,
                                Font.NORMAL,
                                CINZA
                        )
                );

        descricaoParagraph.setSpacingAfter(
                10
        );

        document.add(
                descricaoParagraph
        );


        // -----------------------------------------------------
        // METADADOS
        // -----------------------------------------------------

        PdfPTable metadata =
                new PdfPTable(
                        dataInicial != null
                                ? 2
                                : 1
                );

        metadata.setWidthPercentage(100);

        if (
                dataInicial != null &&
                        dataFinal != null
        ) {

            adicionarMetadata(
                    metadata,
                    "Período",
                    DATA.format(dataInicial)
                            + " a "
                            + DATA.format(dataFinal)
            );
        }

        adicionarMetadata(
                metadata,
                "Gerado em",
                DATA_HORA.format(
                        LocalDateTime.now()
                )
        );

        document.add(
                metadata
        );

        adicionarEspaco(
                document,
                14
        );
    }


    // =========================================================
    // METADADOS
    // =========================================================

    private void adicionarMetadata(
            PdfPTable table,
            String label,
            String valor
    ) {

        PdfPCell cell =
                new PdfPCell();

        cell.setBackgroundColor(
                CINZA_CLARO
        );

        cell.setBorderColor(
                BORDA
        );

        cell.setPadding(8);

        Paragraph labelParagraph =
                new Paragraph(
                        label.toUpperCase(),
                        new Font(
                                Font.HELVETICA,
                                7,
                                Font.BOLD,
                                CINZA
                        )
                );

        Paragraph valorParagraph =
                new Paragraph(
                        valor,
                        new Font(
                                Font.HELVETICA,
                                9,
                                Font.BOLD,
                                AZUL_ESCURO
                        )
                );

        valorParagraph.setSpacingBefore(2);

        cell.addElement(
                labelParagraph
        );

        cell.addElement(
                valorParagraph
        );

        table.addCell(
                cell
        );
    }


    // =========================================================
    // TÍTULO DE SEÇÃO
    // =========================================================

    private void adicionarSecaoTitulo(
            Document document,
            String titulo
    ) throws DocumentException {

        Paragraph paragraph =
                new Paragraph(
                        titulo,
                        new Font(
                                Font.HELVETICA,
                                11,
                                Font.BOLD,
                                AZUL_ESCURO
                        )
                );

        paragraph.setSpacingAfter(
                6
        );

        document.add(
                paragraph
        );
    }


    // =========================================================
    // RESUMO - IMPRESSÕES
    // =========================================================

    private void adicionarResumoImpressoes(
            Document document,
            RelatorioImpressaoResponseDTO relatorio
    ) throws DocumentException {

        PdfPTable resumo =
                new PdfPTable(6);

        resumo.setWidthPercentage(100);

        adicionarResumoCelula(
                resumo,
                "Total",
                relatorio.total()
        );

        adicionarResumoCelula(
                resumo,
                "Pendentes",
                relatorio.pendentes()
        );

        adicionarResumoCelula(
                resumo,
                "Processando",
                relatorio.emProcessamento()
        );

        adicionarResumoCelula(
                resumo,
                "Impressos",
                relatorio.impressos()
        );

        adicionarResumoCelula(
                resumo,
                "Erros",
                relatorio.erros()
        );

        adicionarResumoCelula(
                resumo,
                "Cancelados",
                relatorio.cancelados()
        );

        document.add(
                resumo
        );
    }


    // =========================================================
    // RESUMO - OCORRÊNCIAS
    // =========================================================

    private void adicionarResumoOcorrencias(
            Document document,
            RelatorioOcorrenciaResponseDTO relatorio
    ) throws DocumentException {

        PdfPTable resumo =
                new PdfPTable(6);

        resumo.setWidthPercentage(100);

        adicionarResumoCelula(
                resumo,
                "Total",
                relatorio.total()
        );

        adicionarResumoCelula(
                resumo,
                "Abertas",
                relatorio.abertas()
        );

        adicionarResumoCelula(
                resumo,
                "Em análise",
                relatorio.emAnalise()
        );

        adicionarResumoCelula(
                resumo,
                "Em atendimento",
                relatorio.emAtendimento()
        );

        adicionarResumoCelula(
                resumo,
                "Resolvidas",
                relatorio.resolvidas()
        );

        adicionarResumoCelula(
                resumo,
                "Canceladas",
                relatorio.canceladas()
        );

        document.add(
                resumo
        );
    }


    // =========================================================
    // RESUMO - EQUIPAMENTOS
    // =========================================================

    private void adicionarResumoEquipamentos(
            Document document,
            RelatorioEquipamentoResponseDTO relatorio
    ) throws DocumentException {

        PdfPTable resumo =
                new PdfPTable(6);

        resumo.setWidthPercentage(100);

        adicionarResumoCelula(
                resumo,
                "Total",
                relatorio.total()
        );

        adicionarResumoCelula(
                resumo,
                "Ativos",
                relatorio.ativos()
        );

        adicionarResumoCelula(
                resumo,
                "Inativos",
                relatorio.inativos()
        );

        adicionarResumoCelula(
                resumo,
                "Em manutenção",
                relatorio.emManutencao()
        );

        adicionarResumoCelula(
                resumo,
                "Sem conexão",
                relatorio.semConexao()
        );

        adicionarResumoCelula(
                resumo,
                "Parados",
                relatorio.parados()
        );

        document.add(
                resumo
        );
    }


    private void adicionarResumoCelula(
            PdfPTable table,
            String label,
            Long valor
    ) {

        PdfPCell cell =
                new PdfPCell();

        cell.setBackgroundColor(
                AZUL_CLARO
        );

        cell.setBorderColor(
                new Color(
                        191,
                        219,
                        254
                )
        );

        cell.setPadding(10);
        cell.setHorizontalAlignment(
                Element.ALIGN_CENTER
        );

        Paragraph labelParagraph =
                new Paragraph(
                        label,
                        new Font(
                                Font.HELVETICA,
                                8,
                                Font.NORMAL,
                                CINZA
                        )
                );

        labelParagraph.setAlignment(
                Element.ALIGN_CENTER
        );

        Paragraph valorParagraph =
                new Paragraph(
                        String.valueOf(
                                valor == null
                                        ? 0
                                        : valor
                        ),
                        new Font(
                                Font.HELVETICA,
                                16,
                                Font.BOLD,
                                AZUL
                        )
                );

        valorParagraph.setAlignment(
                Element.ALIGN_CENTER
        );

        valorParagraph.setSpacingBefore(
                3
        );

        cell.addElement(
                labelParagraph
        );

        cell.addElement(
                valorParagraph
        );

        table.addCell(
                cell
        );
    }


    // =========================================================
    // FILTROS
    // =========================================================

    private void adicionarFiltros(
            Document document,
            String... valores
    ) throws DocumentException {

        int quantidade =
                valores.length / 2;

        PdfPTable table =
                new PdfPTable(
                        quantidade
                );

        table.setWidthPercentage(100);

        for (
                int i = 0;
                i < valores.length;
                i += 2
        ) {

            String label =
                    valores[i];

            String valor =
                    valores[i + 1];

            PdfPCell cell =
                    new PdfPCell();

            cell.setPadding(8);

            cell.setBackgroundColor(
                    CINZA_CLARO
            );

            cell.setBorderColor(
                    BORDA
            );

            Paragraph labelParagraph =
                    new Paragraph(
                            label.toUpperCase(),
                            new Font(
                                    Font.HELVETICA,
                                    7,
                                    Font.BOLD,
                                    CINZA
                            )
                    );

            Paragraph valorParagraph =
                    new Paragraph(
                            valor == null
                                    ? "-"
                                    : valor,
                            new Font(
                                    Font.HELVETICA,
                                    9,
                                    Font.BOLD,
                                    AZUL_ESCURO
                            )
                    );

            valorParagraph.setSpacingBefore(
                    2
            );

            cell.addElement(
                    labelParagraph
            );

            cell.addElement(
                    valorParagraph
            );

            table.addCell(
                    cell
            );
        }

        document.add(
                table
        );
    }


    // =========================================================
    // TABELAS
    // =========================================================

    private void configurarTabela(
            PdfPTable table
    ) {

        table.setWidthPercentage(100);
        table.setHeaderRows(1);
        table.setSplitLate(false);
        table.setSplitRows(true);
    }


    private void adicionarCabecalhoTabela(
            PdfPTable table,
            String... titulos
    ) {

        for (
                String titulo :
                titulos
        ) {

            PdfPCell cell =
                    new PdfPCell(
                            new Phrase(
                                    titulo,
                                    new Font(
                                            Font.HELVETICA,
                                            8,
                                            Font.BOLD,
                                            BRANCO
                                    )
                            )
                    );

            cell.setBackgroundColor(
                    AZUL_ESCURO
            );

            cell.setBorderColor(
                    AZUL_ESCURO
            );

            cell.setPadding(8);

            cell.setVerticalAlignment(
                    Element.ALIGN_MIDDLE
            );

            table.addCell(
                    cell
            );
        }
    }


    private void adicionarCelula(
            PdfPTable table,
            Object valor,
            boolean alternar
    ) {

        String texto =
                valor == null
                        ? "-"
                        : valor.toString();

        PdfPCell cell =
                new PdfPCell(
                        new Phrase(
                                texto,
                                new Font(
                                        Font.HELVETICA,
                                        8,
                                        Font.NORMAL,
                                        AZUL_ESCURO
                                )
                        )
                );

        cell.setPadding(7);

        cell.setVerticalAlignment(
                Element.ALIGN_MIDDLE
        );

        cell.setBorderColor(
                BORDA
        );

        if (alternar) {
            cell.setBackgroundColor(
                    CINZA_CLARO
            );
        }

        table.addCell(
                cell
        );
    }


    private void adicionarCelulaCentralizada(
            PdfPTable table,
            Object valor,
            boolean alternar
    ) {

        String texto =
                valor == null
                        ? "-"
                        : valor.toString();

        PdfPCell cell =
                new PdfPCell(
                        new Phrase(
                                texto,
                                new Font(
                                        Font.HELVETICA,
                                        8,
                                        Font.NORMAL,
                                        AZUL_ESCURO
                                )
                        )
                );

        cell.setPadding(7);

        cell.setHorizontalAlignment(
                Element.ALIGN_CENTER
        );

        cell.setVerticalAlignment(
                Element.ALIGN_MIDDLE
        );

        cell.setBorderColor(
                BORDA
        );

        if (alternar) {
            cell.setBackgroundColor(
                    CINZA_CLARO
            );
        }

        table.addCell(
                cell
        );
    }


    // =========================================================
    // INFORMAÇÃO FINAL
    // =========================================================

    private void adicionarRodapeInformativo(
            Document document,
            Long total
    ) throws DocumentException {

        Paragraph paragraph =
                new Paragraph(
                        "Total de registros apresentados: "
                                + (
                                total == null
                                        ? 0
                                        : total
                        ),
                        new Font(
                                Font.HELVETICA,
                                8,
                                Font.NORMAL,
                                CINZA
                        )
                );

        paragraph.setSpacingBefore(
                8
        );

        document.add(
                paragraph
        );
    }


    // =========================================================
    // BUSCA DE NOMES PARA FILTROS
    // =========================================================

    private String buscarNomeEquipamentoImpressao(
            RelatorioImpressaoResponseDTO relatorio,
            Long equipamentoId
    ) {

        return relatorio.itens()
                .stream()
                .filter(
                        item ->
                                equipamentoId.equals(
                                        item.equipamentoId()
                                )
                )
                .map(
                        RelatorioImpressaoItemDTO::equipamentoNome
                )
                .findFirst()
                .orElse(
                        "Equipamento #" + equipamentoId
                );
    }


    private String buscarNomeEquipamentoOcorrencia(
            RelatorioOcorrenciaResponseDTO relatorio,
            Long equipamentoId
    ) {

        return relatorio.itens()
                .stream()
                .filter(
                        item ->
                                equipamentoId.equals(
                                        item.equipamentoId()
                                )
                )
                .map(
                        RelatorioOcorrenciaItemDTO::equipamentoNome
                )
                .findFirst()
                .orElse(
                        "Equipamento #" + equipamentoId
                );
    }


    private String buscarNomeLayout(
            RelatorioImpressaoResponseDTO relatorio,
            Long layoutId
    ) {

        return relatorio.itens()
                .stream()
                .filter(
                        item ->
                                layoutId.equals(
                                        item.layoutId()
                                )
                )
                .map(
                        RelatorioImpressaoItemDTO::layoutNome
                )
                .findFirst()
                .orElse(
                        "Layout #" + layoutId
                );
    }


    // =========================================================
    // ESPAÇAMENTO
    // =========================================================

    private void adicionarEspaco(
            Document document,
            float tamanho
    ) throws DocumentException {

        Paragraph espaco =
                new Paragraph(" ");

        espaco.setLeading(
                tamanho
        );

        document.add(
                espaco
        );
    }


    // =========================================================
    // FORMATAÇÃO
    // =========================================================

    private String formatarDataHora(
            LocalDateTime data
    ) {

        if (data == null) {
            return "-";
        }

        return DATA_HORA.format(
                data
        );
    }


    private String formatarEnum(
            Enum<?> valor
    ) {

        if (valor == null) {
            return "-";
        }

        String texto =
                valor.name()
                        .toLowerCase()
                        .replace(
                                "_",
                                " "
                        );

        return Character
                .toUpperCase(
                        texto.charAt(0)
                )
                + texto.substring(1);
    }


    // =========================================================
    // RODAPÉ DE TODAS AS PÁGINAS
    // =========================================================

    private class RodapePdf
            extends PdfPageEventHelper {

        @Override
        public void onEndPage(
                PdfWriter writer,
                Document document
        ) {

            Empresa empresa =
                    buscarEmpresa();

            String nomeEmpresa =
                    empresa != null
                            ? empresa.getRazaoSocial()
                            : "Empresa";

            PdfPTable footer =
                    new PdfPTable(
                            new float[]{
                                    4f,
                                    1f
                            }
                    );

            try {

                footer.setTotalWidth(
                        document.right()
                                - document.left()
                );

                PdfPCell esquerda =
                        new PdfPCell(
                                new Phrase(
                                        nomeEmpresa
                                                + "  •  PulseAPI - Smart Production Manager",
                                        new Font(
                                                Font.HELVETICA,
                                                7,
                                                Font.NORMAL,
                                                CINZA
                                        )
                                )
                        );

                esquerda.setBorder(
                        Rectangle.TOP
                );

                esquerda.setBorderColor(
                        BORDA
                );

                esquerda.setPaddingTop(
                        6
                );

                PdfPCell direita =
                        new PdfPCell(
                                new Phrase(
                                        "Página "
                                                + writer.getPageNumber(),
                                        new Font(
                                                Font.HELVETICA,
                                                7,
                                                Font.NORMAL,
                                                CINZA
                                        )
                                )
                        );

                direita.setHorizontalAlignment(
                        Element.ALIGN_RIGHT
                );

                direita.setBorder(
                        Rectangle.TOP
                );

                direita.setBorderColor(
                        BORDA
                );

                direita.setPaddingTop(
                        6
                );

                footer.addCell(
                        esquerda
                );

                footer.addCell(
                        direita
                );

                footer.writeSelectedRows(
                        0,
                        -1,
                        document.left(),
                        28,
                        writer.getDirectContent()
                );

            } catch (Exception ignored) {
            }
        }
    }
}