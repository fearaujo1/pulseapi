package com.pulseapi.service;

import com.pulseapi.dto.plantas.PlantaRequestDTO;
import com.pulseapi.dto.plantas.PlantaResponseDTO;
import com.pulseapi.entity.Empresa;
import com.pulseapi.entity.Planta;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.EmpresaRepository;
import com.pulseapi.repository.LinhaRepository;
import com.pulseapi.repository.PlantaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlantaService {

    private final PlantaRepository plantaRepository;
    private final EmpresaRepository empresaRepository;
    private final LinhaRepository linhaRepository;

    public PlantaService(
            PlantaRepository plantaRepository,
            EmpresaRepository empresaRepository,
            LinhaRepository linhaRepository
    ) {
        this.plantaRepository = plantaRepository;
        this.empresaRepository = empresaRepository;
        this.linhaRepository = linhaRepository;
    }
    
    @Transactional(readOnly = true)
    public List<PlantaResponseDTO> listarTodas() {
        return plantaRepository
                .findAllByOrderByNomeAsc()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional
    public PlantaResponseDTO cadastrar(
            PlantaRequestDTO dto
    ) {
        Empresa empresa = buscarEmpresaUnica();

        String codigo = normalizarCodigo(
                dto.getCodigo()
        );

        validarCodigoDuplicado(
                empresa.getId(),
                codigo,
                null
        );

        Planta planta = new Planta();
        atualizarDados(planta, dto, empresa, codigo);

        Planta salva =
                plantaRepository.save(planta);

        return toResponseDTO(salva);
    }

    @Transactional(readOnly = true)
    public List<PlantaResponseDTO> listarPorEmpresa(
            Long empresaId
    ) {
        buscarEmpresaUnica();

        return plantaRepository
                .findAllByEmpresaIdOrderByNomeAsc(
                        empresaId
                )
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public PlantaResponseDTO buscarPorId(
            Long id
    ) {
        return toResponseDTO(
                buscarPlanta(id)
        );
    }

    @Transactional
    public PlantaResponseDTO atualizar(
            Long id,
            PlantaRequestDTO dto
    ) {
        Planta planta = buscarPlanta(id);
        Empresa empresa = buscarEmpresaUnica();

        String codigo = normalizarCodigo(
                dto.getCodigo()
        );

        validarCodigoDuplicado(
                empresa.getId(),
                codigo,
                planta.getId()
        );

        atualizarDados(
                planta,
                dto,
                empresa,
                codigo
        );

        Planta atualizada =
                plantaRepository.save(planta);

        return toResponseDTO(atualizada);
    }

@Transactional
public void deletar(Long id) {
    Planta planta = buscarPlanta(id);

    if (linhaRepository.existsByPlantaId(id)) {
        throw new BusinessException(
                "Não é possível excluir a planta porque ela possui linhas vinculadas."
        );
    }

    plantaRepository.delete(planta);
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
            Long empresaId,
            String codigo,
            Long plantaId
    ) {
        boolean codigoExiste;

        if (plantaId == null) {
            codigoExiste =
                    plantaRepository
                            .existsByEmpresaIdAndCodigoIgnoreCase(
                                    empresaId,
                                    codigo
                            );
        } else {
            codigoExiste =
                    plantaRepository
                            .existsByEmpresaIdAndCodigoIgnoreCaseAndIdNot(
                                    empresaId,
                                    codigo,
                                    plantaId
                            );
        }

        if (codigoExiste) {
            throw new BusinessException(
                    "Já existe uma planta com esse código para a empresa."
            );
        }
    }

    private String normalizarCodigo(String codigo) {
        return codigo.trim().toUpperCase();
    }

    private void atualizarDados(
            Planta planta,
            PlantaRequestDTO dto,
            Empresa empresa,
            String codigo
    ) {
        planta.setNome(dto.getNome().trim());
        planta.setCodigo(codigo);
        planta.setEndereco(limparTexto(dto.getEndereco()));
        planta.setCidade(limparTexto(dto.getCidade()));
        planta.setEstado(normalizarEstado(dto.getEstado()));
        planta.setStatus(dto.getStatus());
        planta.setEmpresa(empresa);
    }

    private String limparTexto(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }

        return valor.trim();
    }

    private String normalizarEstado(String estado) {
        String valor = limparTexto(estado);

        if (valor == null) {
            return null;
        }

        return valor.toUpperCase();
    }

    private Empresa buscarEmpresaUnica() {
        List<Empresa> empresas =
                empresaRepository.findAll();

        if (empresas.isEmpty()) {
            throw new BusinessException(
                    "Nenhuma empresa está configurada no sistema."
            );
        }

        if (empresas.size() > 1) {
            throw new BusinessException(
                    "Existe mais de uma empresa configurada. "
                            + "Esta instalação permite apenas uma empresa."
            );
        }

        return empresas.getFirst();
    }

    private PlantaResponseDTO toResponseDTO(
            Planta planta
    ) {
        return new PlantaResponseDTO(
                planta.getId(),
                planta.getNome(),
                planta.getCodigo(),
                planta.getEndereco(),
                planta.getCidade(),
                planta.getEstado(),
                planta.getStatus(),
                planta.getEmpresa().getId(),
                planta.getEmpresa().getNomeFantasia(),
                planta.getDataCadastro(),
                planta.getUltimaAtualizacao()
        );
    }
}