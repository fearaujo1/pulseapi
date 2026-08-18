package com.pulseapi.service;

import com.pulseapi.dto.configuracao.TurnoRequestDTO;
import com.pulseapi.dto.configuracao.TurnoResponseDTO;
import com.pulseapi.entity.Turno;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.TurnoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TurnoService {

    private final TurnoRepository turnoRepository;

    public TurnoService(
            TurnoRepository turnoRepository
    ) {
        this.turnoRepository = turnoRepository;
    }

    public TurnoResponseDTO criar(
            TurnoRequestDTO dto
    ) {

        if (
                turnoRepository.existsByNomeIgnoreCase(
                        dto.nome()
                )
        ) {
            throw new BusinessException(
                    "Já existe um turno com este nome."
            );
        }

        Turno turno =
                Turno.builder()
                        .nome(dto.nome().trim())
                        .horaInicio(dto.horaInicio())
                        .horaFim(dto.horaFim())
                        .ativo(dto.ativo())
                        .build();

        turno =
                turnoRepository.save(turno);

        return converter(turno);
    }

    public List<TurnoResponseDTO> listar() {

        return turnoRepository
                .findAll()
                .stream()
                .map(this::converter)
                .toList();
    }

    public TurnoResponseDTO buscarPorId(
            Long id
    ) {

        Turno turno =
                buscarEntity(id);

        return converter(turno);
    }

    public TurnoResponseDTO atualizar(
            Long id,
            TurnoRequestDTO dto
    ) {

        Turno turno =
                buscarEntity(id);

        if (
                !turno.getNome()
                        .equalsIgnoreCase(dto.nome())
                        &&
                        turnoRepository.existsByNomeIgnoreCase(
                                dto.nome()
                        )
        ) {
            throw new BusinessException(
                    "Já existe um turno com este nome."
            );
        }

        turno.setNome(
                dto.nome().trim()
        );

        turno.setHoraInicio(
                dto.horaInicio()
        );

        turno.setHoraFim(
                dto.horaFim()
        );

        turno.setAtivo(
                dto.ativo()
        );

        turno =
                turnoRepository.save(turno);

        return converter(turno);
    }

    public void excluir(
            Long id
    ) {

        Turno turno =
                buscarEntity(id);

        turnoRepository.delete(turno);
    }

    private Turno buscarEntity(
            Long id
    ) {

        return turnoRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Turno não encontrado com ID: " + id
                        )
                );
    }

    private TurnoResponseDTO converter(
            Turno turno
    ) {

        return new TurnoResponseDTO(
                turno.getId(),
                turno.getNome(),
                turno.getHoraInicio(),
                turno.getHoraFim(),
                turno.getAtivo()
        );
    }
}