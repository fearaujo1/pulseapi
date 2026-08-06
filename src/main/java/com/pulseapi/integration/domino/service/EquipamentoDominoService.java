package com.pulseapi.integration.domino.service;

import com.pulseapi.entity.Equipamento;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.integration.domino.dto.*;
import com.pulseapi.repository.EquipamentoRepository;
import org.springframework.stereotype.Service;

// buscar o equipamento e validar os dados necessários antes de chamar a integração.
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

        return dominoService.consultarIdentidade(
                equipamento.getIp(),
                equipamento.getPorta()
        );
    }

    public DominoStatusResponse consultarStatus(Long equipamentoId) {
        Equipamento equipamento = buscarEValidar(equipamentoId);

        return dominoService.consultarStatus(
                equipamento.getIp(),
                equipamento.getPorta()
        );
    }

    public DominoConfigurationResponse consultarConfiguracao(Long equipamentoId) {
        Equipamento equipamento = buscarEValidar(equipamentoId);

        return dominoService.consultarConfiguracao(
                equipamento.getIp(),
                equipamento.getPorta()
        );
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

    public DominoFifoCountResponse consultarQuantidadeFifo(Long equipamentoId) {
        Equipamento equipamento = buscarEValidar(equipamentoId);

        return dominoService.consultarQuantidadeFifo(
                equipamento.getIp(),
                equipamento.getPorta()
        );
    }

    public DominoFifoSendResponse enviarDadosFifo(
            Long equipamentoId,
            String dados
    ) {
        Equipamento equipamento = buscarEValidar(equipamentoId);

        return dominoService.enviarDadosFifo(
                equipamento.getIp(),
                equipamento.getPorta(),
                dados
        );
    }

    public DominoLayoutOnlineResponse consultarLayoutOnline(Long equipamentoId) {
        Equipamento equipamento = buscarEValidar(equipamentoId);

        return dominoService.consultarLayoutOnline(
                equipamento.getIp(),
                equipamento.getPorta()
        );
    }

    public void selecionarLayout(
            Long equipamentoId,
            String nomeLayout
    ) {
        Equipamento equipamento = buscarEValidar(equipamentoId);

        dominoService.selecionarLayout(
                equipamento.getIp(),
                equipamento.getPorta(),
                nomeLayout
        );
    }

    public DominoProductCountResponse consultarContadorProduto(
            Long equipamentoId
    ) {
        Equipamento equipamento = buscarEValidar(equipamentoId);

        return dominoService.consultarContadorProduto(
                equipamento.getIp(),
                equipamento.getPorta()
        );
    }
}
