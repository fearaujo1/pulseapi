package com.pulseapi.service;

import com.pulseapi.dto.linhas.LinhaRequestDTO;
import com.pulseapi.dto.linhas.LinhaResponseDTO;
import com.pulseapi.entity.Linha;
import com.pulseapi.entity.Planta;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.EquipamentoRepository;
import com.pulseapi.repository.LinhaRepository;
import com.pulseapi.repository.PlantaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LinhaService {

    private final LinhaRepository linhaRepository;
    private final PlantaRepository plantaRepository;
    private final EquipamentoRepository equipamentoRepository;

    public LinhaService(
            LinhaRepository linhaRepository,
            PlantaRepository plantaRepository,
            EquipamentoRepository equipamentoRepository
    ) {
        this.linhaRepository = linhaRepository;
        this.plantaRepository = plantaRepository;
        this.equipamentoRepository =
                equipamentoRepository;
    }

    @Transactional
    public LinhaResponseDTO cadastrar(
            LinhaRequestDTO dto
    ) {
        Planta planta = buscarPlanta(
                dto.getPlantaId()
        );

        String codigo = normalizarCodigo(
                dto.getCodigo()
        );

        validarCodigoDuplicado(
                planta.getId(),
                codigo,
                null
        );

        Linha linha = new Linha();

        atualizarDados(
                linha,
                dto,
                planta,
                codigo
        );

        Linha salva = linhaRepository.save(linha);

        return toResponseDTO(salva);
    }

    @Transactional(readOnly = true)
    public List<LinhaResponseDTO> listarPorPlanta(
            Long plantaId
    ) {
        buscarPlanta(plantaId);

        return linhaRepository
                .findAllByPlantaIdOrderByNomeAsc(
                        plantaId
                )
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public LinhaResponseDTO buscarPorId(Long id) {
        return toResponseDTO(
                buscarLinha(id)
        );
    }

    @Transactional
    public LinhaResponseDTO atualizar(
            Long id,
            LinhaRequestDTO dto
    ) {
        Linha linha = buscarLinha(id);

        Planta planta = buscarPlanta(
                dto.getPlantaId()
        );

        String codigo = normalizarCodigo(
                dto.getCodigo()
        );

        validarCodigoDuplicado(
                planta.getId(),
                codigo,
                linha.getId()
        );

        atualizarDados(
                linha,
                dto,
                planta,
                codigo
        );

        Linha atualizada =
                linhaRepository.save(linha);

        return toResponseDTO(atualizada);
    }

    @Transactional
    public void deletar(Long id) {
        Linha linha = buscarLinha(id);

        if (equipamentoRepository.existsByLinhaId(id)) {
            throw new BusinessException(
                    "Não é possível excluir a linha porque ela possui equipamentos vinculados."
            );
        }

        linhaRepository.delete(linha);
    }

    private Linha buscarLinha(Long id) {
        return linhaRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Linha não encontrada com ID: "
                                        + id
                        )
                );
    }

    private Planta buscarPlanta(Long id) {
        return plantaRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Planta não encontrada com ID: "
                                        + id
                        )
                );
    }

    private void validarCodigoDuplicado(
            Long plantaId,
            String codigo,
            Long linhaId
    ) {
        boolean codigoExiste;

        if (linhaId == null) {
            codigoExiste =
                    linhaRepository
                            .existsByPlantaIdAndCodigoIgnoreCase(
                                    plantaId,
                                    codigo
                            );
        } else {
            codigoExiste =
                    linhaRepository
                            .existsByPlantaIdAndCodigoIgnoreCaseAndIdNot(
                                    plantaId,
                                    codigo,
                                    linhaId
                            );
        }

        if (codigoExiste) {
            throw new BusinessException(
                    "Já existe uma linha com esse código para a planta."
            );
        }
    }

    private void atualizarDados(
            Linha linha,
            LinhaRequestDTO dto,
            Planta planta,
            String codigo
    ) {
        linha.setNome(dto.getNome().trim());
        linha.setCodigo(codigo);
        linha.setDescricao(
                limparTexto(dto.getDescricao())
        );
        linha.setStatus(dto.getStatus());
        linha.setPlanta(planta);
    }

    private String normalizarCodigo(String codigo) {
        return codigo.trim().toUpperCase();
    }

    private String limparTexto(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }

        return valor.trim();
    }

    private LinhaResponseDTO toResponseDTO(
            Linha linha
    ) {
        return new LinhaResponseDTO(
                linha.getId(),
                linha.getNome(),
                linha.getCodigo(),
                linha.getDescricao(),
                linha.getStatus(),
                linha.getPlanta().getId(),
                linha.getPlanta().getNome(),
                linha.getPlanta().getEmpresa().getId(),
                linha.getPlanta().getEmpresa().getNomeFantasia(),
                linha.getDataCadastro(),
                linha.getUltimaAtualizacao()
        );
    }
}