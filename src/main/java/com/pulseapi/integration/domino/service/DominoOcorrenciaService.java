package com.pulseapi.integration.domino.service;

import com.pulseapi.entity.Equipamento;
import com.pulseapi.entity.Ocorrencia;
import com.pulseapi.entity.OrigemOcorrencia;
import com.pulseapi.entity.StatusOcorrencia;
import com.pulseapi.entity.TipoOcorrencia;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.integration.domino.dto.DominoStatusResponse;
import com.pulseapi.integration.domino.parser.DominoStatusMap;
import com.pulseapi.repository.EquipamentoRepository;
import com.pulseapi.repository.OcorrenciaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

// Responsável pela abertura, deduplicação,
// atualização e resolução automática.
@Service
public class DominoOcorrenciaService {

    private static final Set<StatusOcorrencia> STATUS_ATIVOS =
            EnumSet.of(
                    StatusOcorrencia.ABERTA,
                    StatusOcorrencia.EM_ANALISE,
                    StatusOcorrencia.EM_ATENDIMENTO
            );

    private final OcorrenciaRepository ocorrenciaRepository;
    private final EquipamentoRepository equipamentoRepository;

    public DominoOcorrenciaService(
            OcorrenciaRepository ocorrenciaRepository,
            EquipamentoRepository equipamentoRepository
    ) {
        this.ocorrenciaRepository = ocorrenciaRepository;
        this.equipamentoRepository = equipamentoRepository;
    }

    @Transactional
    public Optional<Long> registrarOuAtualizarFalha(
            Long equipamentoId,
            DominoStatusResponse status
    ) {
        if (!ehFalha(status)
                || !DominoStatusMap.conhecido(
                status.codigoStatus()
        )) {
            return Optional.empty();
        }

        String familia =
                status.codigoStatus().substring(1);

        Optional<Ocorrencia> existente =
                buscarOcorrenciaAtiva(
                        equipamentoId,
                        familia,
                        status.jato()
                );

        if (existente.isPresent()) {
            Ocorrencia ocorrencia =
                    existente.get();

            if (!status.codigoStatus()
                    .equals(ocorrencia.getCodigoFalha())) {
                ocorrencia.setCodigoFalha(
                        status.codigoStatus()
                );

                ocorrencia.setTitulo(
                        criarTitulo(status)
                );

                ocorrencia.setDescricao(
                        criarDescricao(status)
                );

                ocorrenciaRepository.save(ocorrencia);
            }

            return Optional.of(
                    ocorrencia.getId()
            );
        }

        Equipamento equipamento =
                equipamentoRepository.findById(equipamentoId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Equipamento não encontrado com ID: "
                                                + equipamentoId
                                )
                        );

        Ocorrencia ocorrencia = Ocorrencia.builder()
                .titulo(criarTitulo(status))
                .descricao(criarDescricao(status))
                .tipo(TipoOcorrencia.FALHA_EQUIPAMENTO)
                .status(StatusOcorrencia.ABERTA)
                .origem(OrigemOcorrencia.DOMINO)
                .codigoFalha(status.codigoStatus())
                .familiaStatus(familia)
                .jato(status.jato())
                .detectadoEm(LocalDateTime.now())
                .equipamento(equipamento)
                .build();

        Ocorrencia salva =
                ocorrenciaRepository.save(ocorrencia);

        return Optional.of(
                salva.getId()
        );
    }

    private Optional<Ocorrencia> buscarOcorrenciaAtiva(
            Long equipamentoId,
            String familia,
            Integer jato
    ) {
        return ocorrenciaRepository
                .findFirstByEquipamentoIdAndOrigemAndFamiliaStatusAndJatoAndStatusInOrderByCriadoEmDesc(
                        equipamentoId,
                        OrigemOcorrencia.DOMINO,
                        familia,
                        jato,
                        STATUS_ATIVOS
                );
    }

    private boolean ehFalha(
            DominoStatusResponse status
    ) {
        if (status == null
                || status.codigoStatus() == null
                || status.codigoStatus().length() != 3) {
            return false;
        }

        char categoria =
                status.codigoStatus().charAt(0);

        return categoria == '1'
                || categoria == '2';
    }

    private boolean ehNormalizacao(
            DominoStatusResponse status
    ) {
        return status != null
                && status.codigoStatus() != null
                && status.codigoStatus().length() == 3
                && status.codigoStatus().charAt(0) == '0';
    }

    private String criarTitulo(
            DominoStatusResponse status
    ) {
        return "Falha Domino - "
                + status.descricao();
    }

    private String criarDescricao(
            DominoStatusResponse status
    ) {
        return "Falha detectada automaticamente pela integração Domino. "
                + "Código: "
                + status.codigoStatus()
                + ". Jato: "
                + status.jato()
                + ". Severidade: "
                + status.severidade()
                + ". Horário informado pela impressora: "
                + status.horarioAlteracao()
                + ".";
    }
}