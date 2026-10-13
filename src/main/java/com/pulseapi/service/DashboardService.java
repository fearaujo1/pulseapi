package com.pulseapi.service;

import com.pulseapi.dto.dashboard.DashboardEquipamentoResponseDTO;
import com.pulseapi.dto.dashboard.DashboardProducaoResponseDTO;
import com.pulseapi.dto.dashboard.DashboardResumoResponseDTO;
import com.pulseapi.entity.equipamento.Equipamento;
import com.pulseapi.entity.equipamento.StatusConexaoEquipamento;
import com.pulseapi.entity.producao.Producao;
import com.pulseapi.entity.producao.StatusProducao;
import com.pulseapi.entity.producao.StatusProducaoItem;
import com.pulseapi.integration.domino.dto.DominoLiquidLevelsResponse;
import com.pulseapi.integration.domino.exception.DominoCommunicationException;
import com.pulseapi.integration.domino.service.DominoService;
import com.pulseapi.repository.ProducaoItemRepository;
import com.pulseapi.repository.ProducaoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class DashboardService {

    private static final Set<StatusProducao>
            STATUS_PRODUCOES_ATIVAS =
            EnumSet.of(
                    StatusProducao.EM_ANDAMENTO,
                    StatusProducao.PAUSADA,
                    StatusProducao.AGUARDANDO_AVALIACAO,
                    StatusProducao.EM_RETRABALHO
            );

    private static final Set<StatusProducaoItem>
            STATUS_ITENS_PROCESSADOS =
            EnumSet.of(
                    StatusProducaoItem.AGUARDANDO_VALIDACAO,
                    StatusProducaoItem.AGUARDANDO_RETRABALHO,
                    StatusProducaoItem.EM_RETRABALHO,
                    StatusProducaoItem.CONCLUIDO
            );

    private final ProducaoRepository producaoRepository;
    private final ProducaoItemRepository itemRepository;
    private final DominoService dominoService;

    public DashboardService(
            ProducaoRepository producaoRepository,
            ProducaoItemRepository itemRepository,
            DominoService dominoService
    ) {
        this.producaoRepository =
                producaoRepository;

        this.itemRepository =
                itemRepository;

        this.dominoService =
                dominoService;
    }

    public DashboardResumoResponseDTO buscarResumo() {
        List<Producao> producoes =
                producaoRepository
                        .findAllByStatusInOrderByCriadoEmDesc(
                                STATUS_PRODUCOES_ATIVAS
                        );

        List<DashboardProducaoResponseDTO>
                producoesResponse =
                new ArrayList<>();

        Map<Long, Equipamento>
                equipamentosRelacionados =
                new LinkedHashMap<>();

        long quantidadeTotalGeral = 0;
        long quantidadeProcessadaGeral = 0;
        long quantidadeConcluidaGeral = 0;

        for (Producao producao : producoes) {
            long quantidadeTotal =
                    itemRepository
                            .countByProducaoId(
                                    producao.getId()
                            );

            long quantidadeProcessada =
                    itemRepository
                            .countByProducaoIdAndStatusIn(
                                    producao.getId(),
                                    STATUS_ITENS_PROCESSADOS
                            );

            long quantidadeConcluida =
                    itemRepository
                            .countByProducaoIdAndStatus(
                                    producao.getId(),
                                    StatusProducaoItem.CONCLUIDO
                            );

            long quantidadeRestante =
                    Math.max(
                            0,
                            quantidadeTotal
                                    - quantidadeProcessada
                    );

            double percentualProcessado =
                    calcularPercentual(
                            quantidadeProcessada,
                            quantidadeTotal
                    );

            double percentualConcluido =
                    calcularPercentual(
                            quantidadeConcluida,
                            quantidadeTotal
                    );

            Equipamento equipamentoPrincipal =
                    producao.getEquipamentoPrincipal();

            producoesResponse.add(
                    new DashboardProducaoResponseDTO(
                            producao.getId(),
                            producao.getCodigoOrdem(),

                            producao.getLinha().getId(),
                            producao.getLinha().getNome(),

                            equipamentoPrincipal.getId(),
                            equipamentoPrincipal.getNome(),

                            producao.getStatus(),

                            quantidadeTotal,
                            quantidadeProcessada,
                            quantidadeConcluida,
                            quantidadeRestante,

                            percentualProcessado,
                            percentualConcluido
                    )
            );

            equipamentosRelacionados.put(
                    equipamentoPrincipal.getId(),
                    equipamentoPrincipal
            );

            if (
                    producao.getStatus()
                            == StatusProducao.EM_RETRABALHO
                            &&
                            producao.getEquipamentoRetrabalho()
                                    != null
            ) {
                Equipamento equipamentoRetrabalho =
                        producao
                                .getEquipamentoRetrabalho();

                equipamentosRelacionados.put(
                        equipamentoRetrabalho.getId(),
                        equipamentoRetrabalho
                );
            }

            quantidadeTotalGeral +=
                    quantidadeTotal;

            quantidadeProcessadaGeral +=
                    quantidadeProcessada;

            quantidadeConcluidaGeral +=
                    quantidadeConcluida;
        }

        List<DashboardEquipamentoResponseDTO>
                equipamentosResponse =
                equipamentosRelacionados
                        .values()
                        .stream()
                        .map(
                                this::consultarEquipamento
                        )
                        .toList();


        int quantidadeEquipamentosConectados =
                (int) equipamentosResponse
                        .stream()
                        .filter(equipamento ->
                                equipamento.statusConexao()
                                        == StatusConexaoEquipamento.CONECTADO
                        )
                        .count();

        return new DashboardResumoResponseDTO(
                producoesResponse.size(),

                equipamentosResponse.size(),

                quantidadeEquipamentosConectados,

                quantidadeTotalGeral,
                quantidadeProcessadaGeral,
                quantidadeConcluidaGeral,

                calcularPercentual(
                        quantidadeProcessadaGeral,
                        quantidadeTotalGeral
                ),

                producoesResponse,
                equipamentosResponse,

                LocalDateTime.now()
        );
    }

    private DashboardEquipamentoResponseDTO
    consultarEquipamento(
            Equipamento equipamento
    ) {
        if (
                equipamento.getStatusConexao()
                        != StatusConexaoEquipamento.CONECTADO
        ) {
            return criarEquipamentoIndisponivel(
                    equipamento,
                    "Equipamento sem conexão."
            );
        }

        try {
            DominoLiquidLevelsResponse niveis =
                    dominoService
                            .consultarNiveisLiquidos(
                                    equipamento
                            );

            return new DashboardEquipamentoResponseDTO(
                    equipamento.getId(),
                    equipamento.getNome(),
                    equipamento.getCodigo(),
                    equipamento.getStatusConexao(),
                    true,
                    niveis.tinta(),
                    niveis.makeup(),
                    null
            );

        } catch (DominoCommunicationException exception) {
            return criarEquipamentoIndisponivel(
                    equipamento,
                    exception.getMessage()
            );
        }
    }

    private DashboardEquipamentoResponseDTO
    criarEquipamentoIndisponivel(
            Equipamento equipamento,
            String mensagem
    ) {
        return new DashboardEquipamentoResponseDTO(
                equipamento.getId(),
                equipamento.getNome(),
                equipamento.getCodigo(),
                equipamento.getStatusConexao(),
                false,
                null,
                null,
                mensagem
        );
    }

    private double calcularPercentual(
            long quantidade,
            long total
    ) {
        if (total <= 0) {
            return 0.0;
        }

        double percentual =
                quantidade * 100.0 / total;

        return Math.round(
                percentual * 10.0
        ) / 10.0;
    }
}