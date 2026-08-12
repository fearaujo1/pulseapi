package com.pulseapi.integration.domino.service;

import com.pulseapi.entity.Equipamento;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.integration.domino.dto.*;
import com.pulseapi.repository.EquipamentoRepository;
import org.springframework.stereotype.Service;

@Service
public class EquipamentoDominoService {

    private final EquipamentoRepository equipamentoRepository;
    private final DominoService dominoService;

    public EquipamentoDominoService(
            EquipamentoRepository equipamentoRepository,
            DominoService dominoService
    ) {
        this.equipamentoRepository = equipamentoRepository;
        this.dominoService = dominoService;
    }

    public DominoIdentityResponse consultarIdentidade(Long equipamentoId) {
        Equipamento equipamento = buscarEValidar(equipamentoId);

        return dominoService.consultarIdentidade(equipamento);
    }

    public DominoStatusResponse consultarStatus(Long equipamentoId) {
        Equipamento equipamento = buscarEValidar(equipamentoId);

        return dominoService.consultarStatus(equipamento);
    }

    public DominoConfigurationResponse consultarConfiguracao(Long equipamentoId) {
        Equipamento equipamento = buscarEValidar(equipamentoId);

        return dominoService.consultarConfiguracao(equipamento);
    }

    public DominoFifoCountResponse consultarQuantidadeFifo(Long equipamentoId) {
        Equipamento equipamento = buscarEValidar(equipamentoId);

        return dominoService.consultarQuantidadeFifo(equipamento);
    }

    public DominoFifoSendResponse enviarDadosFifo(
            Long equipamentoId,
            String dados
    ) {
        Equipamento equipamento = buscarEValidar(equipamentoId);

        return dominoService.enviarDadosFifo(
                equipamento,
                dados
        );
    }

    public DominoLayoutOnlineResponse consultarLayoutOnline(
            Long equipamentoId
    ) {
        Equipamento equipamento = buscarEValidar(equipamentoId);

        return dominoService.consultarLayoutOnline(equipamento);
    }

    public void selecionarLayout(
            Long equipamentoId,
            String nomeLayout
    ) {
        Equipamento equipamento = buscarEValidar(equipamentoId);

        dominoService.selecionarLayout(
                equipamento,
                nomeLayout
        );
    }

    public DominoProductCountResponse consultarContadorProduto(
            Long equipamentoId
    ) {
        Equipamento equipamento = buscarEValidar(equipamentoId);

        return dominoService.consultarContadorProduto(equipamento);
    }

    private Equipamento buscarEValidar(Long equipamentoId) {
        Equipamento equipamento = equipamentoRepository.findById(equipamentoId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Equipamento não encontrado com ID: " + equipamentoId
                ));

        if (equipamento.getIp() == null || equipamento.getIp().isBlank()) {
            throw new ResourceNotFoundException(
                    "O equipamento não possui um endereço IP configurado."
            );
        }

        if (equipamento.getPorta() == null) {
            throw new BusinessException(
                    "O equipamento não possui uma porta configurada."
            );
        }

        if (equipamento.getPorta() < 1 || equipamento.getPorta() > 65535) {
            throw new BusinessException(
                    "A porta configurada para o equipamento é inválida."
            );
        }

        return equipamento;
    }
}