package com.pulseapi.service;

import com.pulseapi.dto.parada.ParadaRequestDTO;
import com.pulseapi.dto.parada.ParadaResponseDTO;
import com.pulseapi.entity.Equipamento;
import com.pulseapi.entity.Parada;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.EquipamentoRepository;
import com.pulseapi.repository.ParadaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParadaService {

    private final ParadaRepository paradaRepository;
    private final EquipamentoRepository equipamentoRepository;

    public ParadaService(ParadaRepository paradaRepository,
                         EquipamentoRepository equipamentoRepository) {
        this.paradaRepository = paradaRepository;
        this.equipamentoRepository = equipamentoRepository;
    }

    public ParadaResponseDTO criar(ParadaRequestDTO dto) {
        Equipamento equipamento = equipamentoRepository.findById(dto.getEquipamentoId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento não encontrado com ID: " + dto.getEquipamentoId()));

        Parada parada = Parada.builder()
                .titulo(dto.getTitulo())
                .descricao(dto.getDescricao())
                .tipo(dto.getTipo())
                .equipamento(equipamento)
                .build();

        Parada salva = paradaRepository.save(parada);

        return toResponseDTO(salva);
    }

    public List<ParadaResponseDTO> listarTodos() {
        return paradaRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public ParadaResponseDTO buscarPorId(Long id) {
        Parada parada = paradaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ocorrência não encontrada com ID: " + id));

        return toResponseDTO(parada);
    }

    public List<ParadaResponseDTO> listarPorEquipamento(Long equipamentoId) {
        if (!equipamentoRepository.existsById(equipamentoId)) {
            throw new ResourceNotFoundException("Equipamento não encontrado com ID: " + equipamentoId);
        }

        return paradaRepository.findByEquipamentoId(equipamentoId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public ParadaResponseDTO atualizar(Long id, ParadaRequestDTO dto) {
        Parada parada = paradaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ocorrência não encontrada com ID: " + id));

        Equipamento equipamento = equipamentoRepository.findById(dto.getEquipamentoId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento não encontrado com ID: " + dto.getEquipamentoId()));

        parada.setTitulo(dto.getTitulo());
        parada.setDescricao(dto.getDescricao());
        parada.setTipo(dto.getTipo());
        parada.setEquipamento(equipamento);

        Parada atualizada = paradaRepository.save(parada);

        return toResponseDTO(atualizada);
    }

    public void deletar(Long id) {
        Parada parada = paradaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ocorrência não encontrada com ID: " + id));

        paradaRepository.delete(parada);
    }

    private ParadaResponseDTO toResponseDTO(Parada parada) {
        return new ParadaResponseDTO(
                parada.getId(),
                parada.getTitulo(),
                parada.getDescricao(),
                parada.getTipo(),
                parada.getEquipamento() != null ? parada.getEquipamento().getId() : null,
                parada.getEquipamento() != null ? parada.getEquipamento().getNome() : null,
                parada.getEquipamento() != null ? parada.getEquipamento().getCodigo() : null
        );
    }
}