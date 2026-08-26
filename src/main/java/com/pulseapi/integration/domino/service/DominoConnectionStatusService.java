package com.pulseapi.integration.domino.service;

import com.pulseapi.entity.Equipamento;
import com.pulseapi.entity.StatusConexaoEquipamento;
import com.pulseapi.repository.EquipamentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class DominoConnectionStatusService {

    private final EquipamentoRepository equipamentoRepository;

    public DominoConnectionStatusService(
            EquipamentoRepository equipamentoRepository
    ) {
        this.equipamentoRepository = equipamentoRepository;
    }

    @Transactional
    public void registrarConexao(Long equipamentoId) {
        Equipamento equipamento =
                equipamentoRepository.findById(equipamentoId)
                        .orElse(null);

        if (equipamento == null) {
            return;
        }

        if (equipamento.getStatusConexao()
                == StatusConexaoEquipamento.CONECTADO) {
            return;
        }

        equipamento.setStatusConexao(
                StatusConexaoEquipamento.CONECTADO
        );

        equipamento.setUltimaConexaoEm(
                LocalDateTime.now()
        );

        equipamentoRepository.save(equipamento);
    }

    @Transactional
    public void registrarDesconexao(Long equipamentoId) {
        Equipamento equipamento =
                equipamentoRepository.findById(equipamentoId)
                        .orElse(null);

        if (equipamento == null) {
            return;
        }

        if (equipamento.getStatusConexao()
                == StatusConexaoEquipamento.SEM_CONEXAO) {
            return;
        }

        equipamento.setStatusConexao(
                StatusConexaoEquipamento.SEM_CONEXAO
        );

        equipamento.setUltimaFalhaConexaoEm(
                LocalDateTime.now()
        );

        equipamentoRepository.save(equipamento);
    }
}