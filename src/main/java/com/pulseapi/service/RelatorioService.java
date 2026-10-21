package com.pulseapi.service;

import com.pulseapi.dto.relatorio.*;
import com.pulseapi.entity.equipamento.Equipamento;
import com.pulseapi.entity.equipamento.StatusConexaoEquipamento;
import com.pulseapi.entity.equipamento.StatusEquipamento;
import com.pulseapi.entity.impressao.FilaImpressao;
import com.pulseapi.entity.impressao.StatusFilaImpressao;
import com.pulseapi.entity.ocorrencia.Ocorrencia;
import com.pulseapi.entity.ocorrencia.StatusOcorrencia;
import com.pulseapi.entity.ocorrencia.TipoOcorrencia;
import com.pulseapi.repository.EquipamentoRepository;
import com.pulseapi.repository.FilaImpressaoRepository;
import com.pulseapi.repository.OcorrenciaRepository;
import org.springframework.stereotype.Service;
import com.pulseapi.entity.producao.Producao;
import com.pulseapi.entity.producao.StatusProducao;
import com.pulseapi.repository.ProducaoRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class RelatorioService {

    private final FilaImpressaoRepository filaImpressaoRepository;
    private final OcorrenciaRepository ocorrenciaRepository;
    private final EquipamentoRepository equipamentoRepository;
    private final ProducaoRepository producaoRepository;

    public RelatorioService(
            FilaImpressaoRepository filaImpressaoRepository,
            OcorrenciaRepository ocorrenciaRepository,
            EquipamentoRepository equipamentoRepository,
            ProducaoRepository producaoRepository
    ) {
        this.filaImpressaoRepository = filaImpressaoRepository;
        this.ocorrenciaRepository = ocorrenciaRepository;
        this.equipamentoRepository = equipamentoRepository;
        this.producaoRepository = producaoRepository;
    }

    // ==============================
    // RELATÓRIO DE IMPRESSÕES
    // ==============================

    public RelatorioImpressaoResponseDTO gerarRelatorioImpressoes(
            LocalDate dataInicial,
            LocalDate dataFinal,
            Long equipamentoId,
            StatusFilaImpressao status,
            Long layoutId
    ) {

        validarPeriodo(dataInicial, dataFinal);

        LocalDateTime inicio = dataInicial.atStartOfDay();
        LocalDateTime fim = dataFinal.atTime(LocalTime.MAX);

        List<FilaImpressao> registros =
                filaImpressaoRepository.buscarParaRelatorio(
                        inicio,
                        fim,
                        equipamentoId,
                        status,
                        layoutId
                );

        List<RelatorioImpressaoItemDTO> itens =
                registros.stream()
                        .map(this::converterImpressao)
                        .toList();

        long pendentes = registros.stream()
                .filter(f ->
                        f.getStatus() == StatusFilaImpressao.PENDENTE)
                .count();

        long emProcessamento = registros.stream()
                .filter(f ->
                        f.getStatus() == StatusFilaImpressao.ENVIANDO
                            || f.getStatus() == StatusFilaImpressao.ENVIADO_FIFO
                            || f.getStatus() == StatusFilaImpressao.PRONTO_IMPRESSAO
                )
                .count();

        long impressos = registros.stream()
                .filter(f ->
                        f.getStatus() == StatusFilaImpressao.IMPRESSO)
                .count();

        long erros = registros.stream()
                .filter(f ->
                        f.getStatus() == StatusFilaImpressao.ERRO)
                .count();

        long cancelados = registros.stream()
                .filter(f ->
                        f.getStatus() == StatusFilaImpressao.CANCELADO)
                .count();

        return new RelatorioImpressaoResponseDTO(
                dataInicial,
                dataFinal,
                (long) registros.size(),
                pendentes,
                emProcessamento,
                impressos,
                erros,
                cancelados,
                itens
        );
    }


    private RelatorioImpressaoItemDTO converterImpressao(
            FilaImpressao fila
    ) {
        return new RelatorioImpressaoItemDTO(
                fila.getId(),
                fila.getEquipamento().getId(),
                fila.getEquipamento().getNome(),
                fila.getLayout().getId(),
                fila.getLayout().getNome(),
                fila.getPayloadMontado(),
                fila.getStatus(),
                fila.getOrdemFila(),
                fila.getTentativas(),
                fila.getContadorAntesEnvio(),
                fila.getContadorCarregamento(),
                fila.getContadorAposImpressao(),
                fila.getCriadoEm(),
                fila.getEnviadoEm(),
                fila.getImpressoEm(),
                fila.getMensagemErro()
        );
    }

    // =============================
    // RELATÓRIO DE OCORRÊNCIAS
    // =============================

    public RelatorioOcorrenciaResponseDTO gerarRelatorioOcorrencias(
            LocalDate dataInicial,
            LocalDate dataFinal,
            Long equipamentoId,
            TipoOcorrencia tipo,
            StatusOcorrencia status
    ) {

        validarPeriodo(dataInicial, dataFinal);

        LocalDateTime inicio =
                dataInicial.atStartOfDay();

        LocalDateTime fim =
                dataFinal.atTime(LocalTime.MAX);

        List<Ocorrencia> registros =
                ocorrenciaRepository.buscarParaRelatorio(
                        inicio,
                        fim,
                        equipamentoId,
                        tipo,
                        status
                );

        List<RelatorioOcorrenciaItemDTO> itens =
                registros.stream()
                        .map(this::converterOcorrencia)
                        .toList();

        long abertas = registros.stream()
                .filter(o ->
                        o.getStatus() == StatusOcorrencia.ABERTA)
                .count();

        long emAnalise = registros.stream()
                .filter(o ->
                        o.getStatus() == StatusOcorrencia.EM_ANALISE)
                .count();

        long emAtendimento = registros.stream()
                .filter(o ->
                        o.getStatus() == StatusOcorrencia.EM_ATENDIMENTO)
                .count();

        long resolvidas = registros.stream()
                .filter(o ->
                        o.getStatus() == StatusOcorrencia.RESOLVIDA)
                .count();

        long canceladas = registros.stream()
                .filter(o ->
                        o.getStatus() == StatusOcorrencia.CANCELADA)
                .count();

        return new RelatorioOcorrenciaResponseDTO(
                dataInicial,
                dataFinal,
                (long) registros.size(),
                abertas,
                emAnalise,
                emAtendimento,
                resolvidas,
                canceladas,
                itens
        );
    }

    private RelatorioOcorrenciaItemDTO converterOcorrencia(
            Ocorrencia ocorrencia
    ) {
        return new RelatorioOcorrenciaItemDTO(
                ocorrencia.getId(),
                ocorrencia.getTitulo(),
                ocorrencia.getDescricao(),
                ocorrencia.getTipo(),
                ocorrencia.getStatus(),
                ocorrencia.getEquipamento().getId(),
                ocorrencia.getEquipamento().getNome(),
                ocorrencia.getCriadoEm(),
                ocorrencia.getAtualizadoEm()
        );
    }


    // =============================
    // RELATÓRIO DE EQUIPAMENTOS
    // =============================

    public RelatorioEquipamentoResponseDTO gerarRelatorioEquipamentos() {

        List<Equipamento> equipamentos =
                equipamentoRepository.findAll();

        List<RelatorioEquipamentoItemDTO> itens =
                equipamentos.stream()
                        .map(this::converterEquipamento)
                        .toList();

        long ativos = equipamentos.stream()
                .filter(e ->
                        e.getStatus() == StatusEquipamento.ATIVO
                                && e.getStatusConexao()
                                != StatusConexaoEquipamento.SEM_CONEXAO
                )
                .count();

        long inativos = equipamentos.stream()
                .filter(e ->
                        e.getStatus() == StatusEquipamento.INATIVO
                )
                .count();

        long emManutencao = equipamentos.stream()
                .filter(e ->
                        e.getStatus() == StatusEquipamento.EM_MANUTENCAO
                                && e.getStatusConexao()
                                != StatusConexaoEquipamento.SEM_CONEXAO
                )
                .count();

        long semConexao = equipamentos.stream()
                .filter(e ->
                        e.getStatus() != StatusEquipamento.INATIVO
                                && e.getStatusConexao()
                                == StatusConexaoEquipamento.SEM_CONEXAO
                )
                .count();

        return new RelatorioEquipamentoResponseDTO(
                (long) equipamentos.size(),
                ativos,
                inativos,
                emManutencao,
                semConexao,
                itens
        );
    }

    private RelatorioEquipamentoItemDTO converterEquipamento(
            Equipamento equipamento
    ) {
        return new RelatorioEquipamentoItemDTO(
                equipamento.getId(),
                equipamento.getCodigo(),
                equipamento.getNome(),
                equipamento.getTipo(),
                equipamento.getFabricante(),
                equipamento.getModelo(),
                equipamento.getStatus(),
                equipamento.getStatusConexao(),
                equipamento.getIp(),
                equipamento.getPorta(),
                equipamento.getProtocolo()
        );
    }

    // =============================
    // RELATÓRIO DE PRODUÇÕES
    // =============================

    public RelatorioProducaoResponseDTO gerarRelatorioProducoes(
            LocalDate dataInicial,
            LocalDate dataFinal
    ) {
        validarPeriodo(
                dataInicial,
                dataFinal
        );

        LocalDateTime inicio =
                dataInicial.atStartOfDay();

        LocalDateTime fim =
                dataFinal.atTime(
                        LocalTime.MAX
                );

        List<Producao> registros =
                producaoRepository
                        .buscarParaRelatorio(
                                inicio,
                                fim
                        );

        List<RelatorioProducaoItemDTO> itens =
                registros.stream()
                        .map(this::converterProducao)
                        .toList();

        long aguardandoDados =
                contarProducoesPorStatus(
                        registros,
                        StatusProducao.AGUARDANDO_DADOS
                );

        long prontas =
                contarProducoesPorStatus(
                        registros,
                        StatusProducao.PRONTA
                );

        long emAndamento =
                contarProducoesPorStatus(
                        registros,
                        StatusProducao.EM_ANDAMENTO
                );

        long pausadas =
                contarProducoesPorStatus(
                        registros,
                        StatusProducao.PAUSADA
                );

        long aguardandoAvaliacao =
                contarProducoesPorStatus(
                        registros,
                        StatusProducao.AGUARDANDO_AVALIACAO
                );

        long emRetrabalho =
                contarProducoesPorStatus(
                        registros,
                        StatusProducao.EM_RETRABALHO
                );

        long concluidas =
                contarProducoesPorStatus(
                        registros,
                        StatusProducao.CONCLUIDA
                );

        long canceladas =
                contarProducoesPorStatus(
                        registros,
                        StatusProducao.CANCELADA
                );

        long quantidadeTotalPlanejada =
                registros.stream()
                        .map(Producao::getQuantidadeTotal)
                        .filter(
                                quantidade ->
                                        quantidade != null
                        )
                        .mapToLong(Long::longValue)
                        .sum();

        return new RelatorioProducaoResponseDTO(
                dataInicial,
                dataFinal,
                (long) registros.size(),
                aguardandoDados,
                prontas,
                emAndamento,
                pausadas,
                aguardandoAvaliacao,
                emRetrabalho,
                concluidas,
                canceladas,
                quantidadeTotalPlanejada,
                itens
        );
    }

    private long contarProducoesPorStatus(
            List<Producao> producoes,
            StatusProducao status
    ) {
        return producoes.stream()
                .filter(
                        producao ->
                                producao.getStatus() == status
                )
                .count();
    }

    private RelatorioProducaoItemDTO converterProducao(
            Producao producao
    ) {
        return new RelatorioProducaoItemDTO(
                producao.getId(),
                producao.getCodigoOrdem(),
                producao.getStatus(),
                producao.getQuantidadeTotal(),

                producao.getLinha().getId(),
                producao.getLinha().getNome(),

                producao
                        .getEquipamentoPrincipal()
                        .getId(),

                producao
                        .getEquipamentoPrincipal()
                        .getNome(),

                producao
                        .getLayoutPrincipal()
                        .getId(),

                producao
                        .getLayoutPrincipal()
                        .getNome(),

                producao.getCriadoEm(),
                producao.getIniciadaEm(),
                producao.getConcluidaEm(),
                producao.getCanceladaEm()
        );
    }


// =============================
// RELATÓRIO GERAL
// =============================

    public RelatorioGeralResponseDTO gerarRelatorioGeral(
            LocalDate dataInicial,
            LocalDate dataFinal,
            String geradoPor
    ) {
        validarPeriodo(
                dataInicial,
                dataFinal
        );

        RelatorioProducaoResponseDTO producoes =
                gerarRelatorioProducoes(
                        dataInicial,
                        dataFinal
                );

        RelatorioImpressaoResponseDTO impressoes =
                gerarRelatorioImpressoes(
                        dataInicial,
                        dataFinal,
                        null,
                        null,
                        null
                );

        RelatorioOcorrenciaResponseDTO ocorrencias =
                gerarRelatorioOcorrencias(
                        dataInicial,
                        dataFinal,
                        null,
                        null,
                        null
                );

        RelatorioEquipamentoResponseDTO equipamentos =
                gerarRelatorioEquipamentos();

        return new RelatorioGeralResponseDTO(
                dataInicial,
                dataFinal,
                geradoPor,
                LocalDateTime.now(),
                producoes,
                impressoes,
                ocorrencias,
                equipamentos
        );
    }


    // ================
    // VALIDAÇÕES
    // ================

    private void validarPeriodo(
            LocalDate dataInicial,
            LocalDate dataFinal
    ) {

        if (dataInicial == null || dataFinal == null) {
            throw new IllegalArgumentException(
                    "A data inicial e a data final são obrigatórias."
            );
        }

        if (dataInicial.isAfter(dataFinal)) {
            throw new IllegalArgumentException(
                    "A data inicial não pode ser posterior à data final."
            );
        }
    }
}

