package com.pulseapi.service;

import com.pulseapi.dto.layout.CampoLayoutRequestDTO;
import com.pulseapi.dto.layout.CampoLayoutResponseDTO;
import com.pulseapi.dto.layout.LayoutImpressaoRequestDTO;
import com.pulseapi.dto.layout.LayoutImpressaoResponseDTO;
import com.pulseapi.entity.*;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.EquipamentoRepository;
import com.pulseapi.repository.LayoutImpressaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class LayoutImpressaoService {

    private final LayoutImpressaoRepository layoutRepository;
    private final EquipamentoRepository equipamentoRepository;

    public LayoutImpressaoService(
            LayoutImpressaoRepository layoutRepository,
            EquipamentoRepository equipamentoRepository
    ) {
        this.layoutRepository = layoutRepository;
        this.equipamentoRepository = equipamentoRepository;
    }

    @Transactional
    public LayoutImpressaoResponseDTO criar(LayoutImpressaoRequestDTO dto) {
        Equipamento equipamento = buscarEquipamento(dto.getEquipamentoId());

        validarNomeDuplicado(
                dto.getEquipamentoId(),
                dto.getNomeNaImpressora(),
                null
        );

        validarConfiguracao(dto);

        LayoutImpressao layout = LayoutImpressao.builder()
                .nome(dto.getNome().trim())
                .nomeNaImpressora(dto.getNomeNaImpressora().trim())
                .estrategiaMontagem(dto.getEstrategiaMontagem())
                .delimitador(normalizarDelimitador(dto))
                .ativo(dto.getAtivo() == null || dto.getAtivo())
                .equipamento(equipamento)
                .build();

        List<CampoLayout> campos = dto.getCampos().stream()
                .map(campoDto -> criarCampo(layout, campoDto))
                .toList();

        layout.getCampos().addAll(campos);

        LayoutImpressao salvo = layoutRepository.save(layout);

        return toResponseDTO(salvo);
    }

    @Transactional(readOnly = true)
    public List<LayoutImpressaoResponseDTO> listar() {
        return layoutRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LayoutImpressaoResponseDTO> listarPorEquipamento(
            Long equipamentoId
    ) {
        buscarEquipamento(equipamentoId);

        return layoutRepository.findByEquipamentoId(equipamentoId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public LayoutImpressaoResponseDTO buscarPorId(Long id) {
        return toResponseDTO(buscarLayout(id));
    }

    @Transactional
    public LayoutImpressaoResponseDTO atualizar(
            Long id,
            LayoutImpressaoRequestDTO dto
    ) {
        LayoutImpressao layout = buscarLayout(id);
        Equipamento equipamento = buscarEquipamento(dto.getEquipamentoId());

        validarNomeDuplicado(
                dto.getEquipamentoId(),
                dto.getNomeNaImpressora(),
                id
        );

        validarConfiguracao(dto);

        layout.setNome(dto.getNome().trim());
        layout.setNomeNaImpressora(dto.getNomeNaImpressora().trim());
        layout.setEstrategiaMontagem(dto.getEstrategiaMontagem());
        layout.setDelimitador(normalizarDelimitador(dto));
        layout.setAtivo(dto.getAtivo() == null || dto.getAtivo());
        layout.setEquipamento(equipamento);

        layout.getCampos().clear();

        for (CampoLayoutRequestDTO campoDto : dto.getCampos()) {
            layout.getCampos().add(
                    criarCampo(layout, campoDto)
            );
        }

        return toResponseDTO(layoutRepository.save(layout));
    }

    @Transactional
    public void excluir(Long id) {
        LayoutImpressao layout = buscarLayout(id);
        layoutRepository.delete(layout);
    }

    private Equipamento buscarEquipamento(Long id) {
        return equipamentoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Equipamento não encontrado com ID: " + id
                ));
    }

    private LayoutImpressao buscarLayout(Long id) {
        return layoutRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Layout de impressão não encontrado com ID: " + id
                ));
    }

    private void validarNomeDuplicado(
            Long equipamentoId,
            String nomeNaImpressora,
            Long layoutIdAtual
    ) {
        layoutRepository
                .findByEquipamentoIdAndNomeNaImpressora(
                        equipamentoId,
                        nomeNaImpressora.trim()
                )
                .ifPresent(layoutExistente -> {
                    if (!layoutExistente.getId().equals(layoutIdAtual)) {
                        throw new BusinessException(
                                "Já existe um layout com esse nome na impressora para o equipamento informado."
                        );
                    }
                });
    }

    private void validarConfiguracao(LayoutImpressaoRequestDTO dto) {
        validarChavesEOrdens(dto.getCampos());

        if (dto.getEstrategiaMontagem()
                == EstrategiaMontagemPayload.DELIMITADO) {
            validarLayoutDelimitado(dto);
        }

        if (dto.getEstrategiaMontagem()
                == EstrategiaMontagemPayload.OFFSET_FIXO) {
            validarLayoutOffsetFixo(dto);
        }
    }

    private void validarChavesEOrdens(List<CampoLayoutRequestDTO> campos) {
        Set<String> chaves = new HashSet<>();
        Set<Integer> ordens = new HashSet<>();

        for (CampoLayoutRequestDTO campo : campos) {
            String chaveNormalizada = campo.getChave()
                    .trim()
                    .toUpperCase();

            if (!chaves.add(chaveNormalizada)) {
                throw new BusinessException(
                        "Existem campos com a mesma chave: "
                                + chaveNormalizada
                );
            }

            if (!ordens.add(campo.getOrdem())) {
                throw new BusinessException(
                        "Existem campos com a mesma ordem: "
                                + campo.getOrdem()
                );
            }
        }
    }

    private void validarLayoutDelimitado(LayoutImpressaoRequestDTO dto) {
        if (dto.getDelimitador() == null
                || dto.getDelimitador().isBlank()) {
            throw new BusinessException(
                    "Layouts delimitados precisam informar um delimitador."
            );
        }

        if (dto.getDelimitador().length() != 1) {
            throw new BusinessException(
                    "O delimitador deve possuir exatamente um caractere."
            );
        }

        for (CampoLayoutRequestDTO campo : dto.getCampos()) {
            if (campo.getOffset() != null) {
                throw new BusinessException(
                        "Campos de layouts delimitados não devem possuir offset."
                );
            }
        }
    }

    private void validarLayoutOffsetFixo(LayoutImpressaoRequestDTO dto) {
        if (dto.getDelimitador() != null
                && !dto.getDelimitador().isBlank()) {
            throw new BusinessException(
                    "Layouts com offset fixo não devem possuir delimitador."
            );
        }

        for (CampoLayoutRequestDTO campo : dto.getCampos()) {
            if (campo.getOffset() == null) {
                throw new BusinessException(
                        "Todos os campos de um layout com offset fixo devem possuir offset."
                );
            }

            if (campo.getComprimento() == null) {
                throw new BusinessException(
                        "Todos os campos de um layout com offset fixo devem possuir comprimento."
                );
            }
        }

        validarSobreposicaoOffsets(dto.getCampos());
    }

    private void validarSobreposicaoOffsets(
            List<CampoLayoutRequestDTO> campos
    ) {
        List<CampoLayoutRequestDTO> ordenados = campos.stream()
                .sorted(Comparator.comparing(
                        CampoLayoutRequestDTO::getOffset
                ))
                .toList();

        for (int i = 0; i < ordenados.size() - 1; i++) {
            CampoLayoutRequestDTO atual = ordenados.get(i);
            CampoLayoutRequestDTO proximo = ordenados.get(i + 1);

            int fimAtual =
                    atual.getOffset() + atual.getComprimento();

            if (fimAtual > proximo.getOffset()) {
                throw new BusinessException(
                        "Os campos "
                                + atual.getChave()
                                + " e "
                                + proximo.getChave()
                                + " possuem offsets sobrepostos."
                );
            }
        }
    }

    private String normalizarDelimitador(
            LayoutImpressaoRequestDTO dto
    ) {
        if (dto.getEstrategiaMontagem()
                == EstrategiaMontagemPayload.DELIMITADO) {
            return dto.getDelimitador();
        }

        return null;
    }

    private CampoLayout criarCampo(
            LayoutImpressao layout,
            CampoLayoutRequestDTO dto
    ) {
        return CampoLayout.builder()
                .layout(layout)
                .chave(dto.getChave().trim().toUpperCase())
                .rotulo(dto.getRotulo().trim())
                .ordem(dto.getOrdem())
                .tipoDado(dto.getTipoDado())
                .comprimento(dto.getComprimento())
                .obrigatorio(dto.getObrigatorio())
                .formato(dto.getFormato())
                .offset(dto.getOffset())
                .valorPadrao(dto.getValorPadrao())
                .build();
    }

    private LayoutImpressaoResponseDTO toResponseDTO(
            LayoutImpressao layout
    ) {
        List<CampoLayoutResponseDTO> campos = layout.getCampos().stream()
                .sorted(Comparator.comparing(CampoLayout::getOrdem))
                .map(campo -> new CampoLayoutResponseDTO(
                        campo.getId(),
                        campo.getChave(),
                        campo.getRotulo(),
                        campo.getOrdem(),
                        campo.getTipoDado(),
                        campo.getComprimento(),
                        campo.getObrigatorio(),
                        campo.getFormato(),
                        campo.getOffset(),
                        campo.getValorPadrao()
                ))
                .toList();

        return new LayoutImpressaoResponseDTO(
                layout.getId(),
                layout.getNome(),
                layout.getNomeNaImpressora(),
                layout.getEstrategiaMontagem(),
                layout.getDelimitador(),
                layout.getAtivo(),
                layout.getEquipamento().getId(),
                layout.getEquipamento().getNome(),
                campos,
                layout.getCriadoEm(),
                layout.getAtualizadoEm()
        );
    }
}