package com.pulseapi.service;

import com.pulseapi.dto.parada.OcorrenciaRequestDTO;
import com.pulseapi.dto.parada.OcorrenciaResponseDTO;
import com.pulseapi.dto.parada.OcorrenciaStatusDTO;
import com.pulseapi.entity.Equipamento;
import com.pulseapi.entity.Ocorrencia;
import com.pulseapi.entity.StatusOcorrencia;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.EquipamentoRepository;
import com.pulseapi.repository.OcorrenciaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OcorrenciaService {

    private final OcorrenciaRepository ocorrenciaRepository;
    private final EquipamentoRepository equipamentoRepository;

    public OcorrenciaService(OcorrenciaRepository ocorrenciaRepository,
                             EquipamentoRepository equipamentoRepository) {
        this.ocorrenciaRepository = ocorrenciaRepository;
        this.equipamentoRepository = equipamentoRepository;
    }

    public OcorrenciaResponseDTO registrarOcorrencia(OcorrenciaRequestDTO dto) {
        Equipamento equipamento = equipamentoRepository.findById(dto.getEquipamentoId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento não encontrado com ID: " + dto.getEquipamentoId()));

        Ocorrencia ocorrencia = Ocorrencia.builder()
                .titulo(dto.getTitulo())
                .descricao(dto.getDescricao())
                .tipo(dto.getTipo())
                .status(StatusOcorrencia.ABERTA)
                .equipamento(equipamento)
                .build();

        Ocorrencia salva = ocorrenciaRepository.save(ocorrencia);

        return toResponseDTO(salva);
    }

    public List<OcorrenciaResponseDTO> listarTodos() {
        return ocorrenciaRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public OcorrenciaResponseDTO buscarPorId(Long id) {
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ocorrência não encontrada com ID: " + id));

        return toResponseDTO(ocorrencia);
    }

    public List<OcorrenciaResponseDTO> listarPorEquipamento(Long equipamentoId) {
        if (!equipamentoRepository.existsById(equipamentoId)) {
            throw new ResourceNotFoundException("Equipamento não encontrado com ID: " + equipamentoId);
        }

        return ocorrenciaRepository.findByEquipamentoId(equipamentoId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public OcorrenciaResponseDTO atualizar(Long id, OcorrenciaRequestDTO dto) {
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ocorrência não encontrada com ID: " + id));

        Equipamento equipamento = equipamentoRepository.findById(dto.getEquipamentoId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipamento não encontrado com ID: " + dto.getEquipamentoId()));

        ocorrencia.setTitulo(dto.getTitulo());
        ocorrencia.setDescricao(dto.getDescricao());
        ocorrencia.setTipo(dto.getTipo());
        ocorrencia.setEquipamento(equipamento);

        Ocorrencia atualizada = ocorrenciaRepository.save(ocorrencia);

        return toResponseDTO(atualizada);
    }

    public void deletar(Long id) {
        Ocorrencia ocorrencia = ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ocorrência não encontrada com ID: " + id));

        ocorrenciaRepository.delete(ocorrencia);
    }


    public OcorrenciaResponseDTO atualizarStatus(Long id, OcorrenciaStatusDTO dto) {
        Ocorrencia parada = ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ocorrência não encontrada com ID: " + id));

        parada.setStatus(dto.getStatus());

        Ocorrencia atualizada = ocorrenciaRepository.save(parada);

        return toResponseDTO(atualizada);
    }

    private OcorrenciaResponseDTO toResponseDTO(Ocorrencia ocorrencia) {
        return new OcorrenciaResponseDTO(
                ocorrencia.getId(),
                ocorrencia.getTitulo(),
                ocorrencia.getDescricao(),
                ocorrencia.getTipo(),
                ocorrencia.getStatus(),
                ocorrencia.getEquipamento() != null ? ocorrencia.getEquipamento().getId() : null,
                ocorrencia.getEquipamento() != null ? ocorrencia.getEquipamento().getNome() : null,
                ocorrencia.getEquipamento() != null ? ocorrencia.getEquipamento().getCodigo() : null
        );
    }
}