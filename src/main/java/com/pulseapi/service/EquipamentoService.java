package com.pulseapi.service;

import com.pulseapi.dto.equipamentos.EquipamentoRequestDTO;
import com.pulseapi.dto.equipamentos.EquipamentoResponseDTO;
import com.pulseapi.dto.equipamentos.EquipamentoStatusDTO;
import com.pulseapi.entity.Equipamento;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.EquipamentoRepository;
import org.springframework.stereotype.Service;


import java.util.List;
import com.pulseapi.entity.Linha;
import com.pulseapi.repository.LinhaRepository;

@Service
public class EquipamentoService {

    private final EquipamentoRepository equipamentoRepository;
    private final LinhaRepository linhaRepository;

    public EquipamentoService(
            EquipamentoRepository equipamentoRepository,
            LinhaRepository linhaRepository
    ) {
        this.equipamentoRepository = equipamentoRepository;
        this.linhaRepository = linhaRepository;
    }

    public EquipamentoResponseDTO cadastrar(EquipamentoRequestDTO dto) {
        if (equipamentoRepository.existsByCodigo(dto.getCodigo())) {
            throw new BusinessException("Já existe um equipamento com esse código");
        }

        Linha linha = buscarLinha(dto.getLinhaId());

        Equipamento equipamento = new Equipamento();
        equipamento.setNome(dto.getNome());
        equipamento.setCodigo(dto.getCodigo());
        equipamento.setTipo(dto.getTipo());
        equipamento.setFabricante(dto.getFabricante());
        equipamento.setModelo(dto.getModelo());
        equipamento.setNumeroSerie(dto.getNumeroSerie());
        equipamento.setStatus(dto.getStatus());
        equipamento.setIp(dto.getIp());
        equipamento.setPorta(dto.getPorta());
        equipamento.setProtocolo(dto.getProtocolo());
        equipamento.setLinha(linha);

        Equipamento salvo = equipamentoRepository.save(equipamento);
        return toResponseDTO(salvo);
    }

    public List<EquipamentoResponseDTO> listarTodos() {
        return equipamentoRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public EquipamentoResponseDTO buscarPorId(Long id) {
        Equipamento equipamento = equipamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento não encontrado com ID: " + id));

        return toResponseDTO(equipamento);
    }

    public EquipamentoResponseDTO atualizar(Long id, EquipamentoRequestDTO dto) {
        Equipamento equipamento = equipamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento não encontrado com ID: " + id));

        if(!equipamento.getCodigo().equals(dto.getCodigo()) &&
                equipamentoRepository.existsByCodigo(dto.getCodigo())) {
            throw new BusinessException("Já existe um equipamento com esse código");
        }

        Linha linha = buscarLinha(dto.getLinhaId());

        equipamento.setNome(dto.getNome());
        equipamento.setCodigo(dto.getCodigo());
        equipamento.setTipo(dto.getTipo());
        equipamento.setFabricante(dto.getFabricante());
        equipamento.setModelo(dto.getModelo());
        equipamento.setNumeroSerie(dto.getNumeroSerie());
        equipamento.setStatus(dto.getStatus());
        equipamento.setIp(dto.getIp());
        equipamento.setPorta(dto.getPorta());
        equipamento.setProtocolo(dto.getProtocolo());
        equipamento.setLinha(linha);

        Equipamento atualizado = equipamentoRepository.save(equipamento);
        return toResponseDTO(atualizado);
    }

    public void deletar(Long id) {
        Equipamento equipamento = equipamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento não encontrado com ID: " + id));

        equipamentoRepository.delete(equipamento);
    }

    private Linha buscarLinha(Long linhaId) {
        return linhaRepository.findById(linhaId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Linha não encontrada com ID: "
                                        + linhaId
                        )
                );
    }

    // Converte a entidade em DTO, não expondo os dados internos
    private EquipamentoResponseDTO toResponseDTO(
            Equipamento equipamento
    ) {
        Linha linha = equipamento.getLinha();

        return new EquipamentoResponseDTO(
                equipamento.getId(),
                equipamento.getNome(),
                equipamento.getCodigo(),
                equipamento.getTipo(),
                equipamento.getFabricante(),
                equipamento.getModelo(),
                equipamento.getNumeroSerie(),
                equipamento.getStatus(),
                equipamento.getStatusConexao(),
                equipamento.getUltimaConexaoEm(),
                equipamento.getUltimaFalhaConexaoEm(),
                equipamento.getDataCadastro(),
                equipamento.getUltimaAtualizacao(),
                equipamento.getIp(),
                equipamento.getPorta(),
                equipamento.getProtocolo(),
                linha != null ? linha.getId() : null,
                linha != null ? linha.getNome() : null,
                linha != null ? linha.getPlanta().getId() : null,
                linha != null ? linha.getPlanta().getNome() : null
        );
    }

    public EquipamentoResponseDTO atualizarStatus(Long id, EquipamentoStatusDTO dto) {
        Equipamento equipamento = equipamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento não encontrado com ID: " + id));

        equipamento.setStatus(dto.getStatus());

        Equipamento atualizado = equipamentoRepository.save(equipamento);
        return toResponseDTO(atualizado);
    }

}
