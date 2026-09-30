package com.pulseapi.service;

import com.pulseapi.dto.producao.ProducaoRequestDTO;
import com.pulseapi.dto.producao.ProducaoResponseDTO;
import com.pulseapi.entity.equipamento.Equipamento;
import com.pulseapi.entity.impressao.LayoutImpressao;
import com.pulseapi.entity.linha.Linha;
import com.pulseapi.entity.producao.Producao;
import com.pulseapi.entity.producao.StatusProducao;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.EquipamentoRepository;
import com.pulseapi.repository.LayoutImpressaoRepository;
import com.pulseapi.repository.LinhaRepository;
import com.pulseapi.repository.ProducaoItemRepository;
import com.pulseapi.repository.ProducaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.time.Year;
import java.util.UUID;

@Service
public class ProducaoService {

    private final ProducaoRepository producaoRepository;
    private final ProducaoItemRepository itemRepository;
    private final LinhaRepository linhaRepository;
    private final EquipamentoRepository equipamentoRepository;
    private final LayoutImpressaoRepository layoutRepository;

    public ProducaoService(
            ProducaoRepository producaoRepository,
            ProducaoItemRepository itemRepository,
            LinhaRepository linhaRepository,
            EquipamentoRepository equipamentoRepository,
            LayoutImpressaoRepository layoutRepository
    ) {
        this.producaoRepository = producaoRepository;
        this.itemRepository = itemRepository;
        this.linhaRepository = linhaRepository;
        this.equipamentoRepository = equipamentoRepository;
        this.layoutRepository = layoutRepository;
    }

    @Transactional
    public ProducaoResponseDTO cadastrar(
            ProducaoRequestDTO dto
    ) {
        Relacionamentos relacionamentos =
                buscarEValidarRelacionamentos(dto);

        /*
         * Código temporário único para permitir que
         * o banco gere o ID da produção.
         */
        String codigoTemporario =
                "TEMP-" + UUID.randomUUID();

        Producao producao = Producao.builder()
                .codigoOrdem(codigoTemporario)
                .linha(relacionamentos.linha())
                .equipamentoPrincipal(
                        relacionamentos.equipamentoPrincipal()
                )
                .layoutPrincipal(
                        relacionamentos.layoutPrincipal()
                )
                .equipamentoRetrabalho(
                        relacionamentos.equipamentoRetrabalho()
                )
                .layoutRetrabalho(
                        relacionamentos.layoutRetrabalho()
                )
                .validadeDias(dto.validadeDias())
                .observacoes(
                        normalizarTexto(dto.observacoes())
                )
                .status(
                        StatusProducao.AGUARDANDO_DADOS
                )
                .build();

        /*
         * saveAndFlush executa o INSERT imediatamente,
         * disponibilizando o ID gerado pelo SQL Server.
         */
        Producao salva =
                producaoRepository.saveAndFlush(
                        producao
                );

        String codigoOrdem =
                gerarCodigoOrdem(salva.getId());

        salva.setCodigoOrdem(codigoOrdem);

        return converter(
                producaoRepository.save(salva)
        );
    }

    private String gerarCodigoOrdem(
            Long producaoId
    ) {
        return String.format(
                "OP-%d-%06d",
                Year.now().getValue(),
                producaoId
        );
    }

    @Transactional(readOnly = true)
    public List<ProducaoResponseDTO> listar() {
        return producaoRepository
                .findAllByOrderByCriadoEmDesc()
                .stream()
                .map(this::converter)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProducaoResponseDTO buscarPorId(Long id) {
        return converter(buscarEntidade(id));
    }

    @Transactional
    public ProducaoResponseDTO atualizar(
            Long id,
            ProducaoRequestDTO dto
    ) {
        Producao producao =
                buscarEntidade(id);

        if (producao.getStatus()
                != StatusProducao.AGUARDANDO_DADOS) {
            throw new BusinessException(
                    "Somente produções que aguardam dados podem ser editadas."
            );
        }

        if (itemRepository.countByProducaoId(id) > 0) {
            throw new BusinessException(
                    "A produção possui itens importados e não pode mais ser editada."
            );
        }

        Relacionamentos relacionamentos =
                buscarEValidarRelacionamentos(dto);

        producao.setLinha(relacionamentos.linha());
        producao.setEquipamentoPrincipal(
                relacionamentos.equipamentoPrincipal()
        );
        producao.setLayoutPrincipal(
                relacionamentos.layoutPrincipal()
        );
        producao.setEquipamentoRetrabalho(
                relacionamentos.equipamentoRetrabalho()
        );
        producao.setLayoutRetrabalho(
                relacionamentos.layoutRetrabalho()
        );
        producao.setValidadeDias(dto.validadeDias());
        producao.setObservacoes(
                normalizarTexto(dto.observacoes())
        );

        return converter(
                producaoRepository.save(producao)
        );
    }

    @Transactional
    public void deletar(Long id) {
        Producao producao =
                buscarEntidade(id);

        if (producao.getStatus()
                != StatusProducao.AGUARDANDO_DADOS) {
            throw new BusinessException(
                    "Somente produções que aguardam dados podem ser excluídas."
            );
        }

        long quantidadeItens =
                itemRepository.countByProducaoId(id);

        if (quantidadeItens > 0) {
            throw new BusinessException(
                    "A produção possui dados importados e não pode ser excluída."
            );
        }

        producaoRepository.delete(producao);
    }

    private Relacionamentos buscarEValidarRelacionamentos(
            ProducaoRequestDTO dto
    ) {
        Linha linha = linhaRepository
                .findById(dto.linhaId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Linha não encontrada com ID: "
                                        + dto.linhaId()
                        )
                );

        Equipamento equipamentoPrincipal =
                equipamentoRepository
                        .findById(
                                dto.equipamentoPrincipalId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Equipamento principal não encontrado."
                                )
                        );

        LayoutImpressao layoutPrincipal =
                layoutRepository
                        .findById(dto.layoutPrincipalId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Layout principal não encontrado."
                                )
                        );

        validarEquipamentoNaLinha(
                equipamentoPrincipal,
                linha,
                "principal"
        );

        validarLayoutDoEquipamento(
                layoutPrincipal,
                equipamentoPrincipal,
                "principal"
        );

        boolean informouEquipamentoRetrabalho =
                dto.equipamentoRetrabalhoId() != null;

        boolean informouLayoutRetrabalho =
                dto.layoutRetrabalhoId() != null;

        if (informouEquipamentoRetrabalho
                != informouLayoutRetrabalho) {
            throw new BusinessException(
                    "Informe o equipamento e o layout de retrabalho juntos."
            );
        }

        Equipamento equipamentoRetrabalho = null;
        LayoutImpressao layoutRetrabalho = null;

        if (informouEquipamentoRetrabalho) {
            equipamentoRetrabalho =
                    equipamentoRepository
                            .findById(
                                    dto.equipamentoRetrabalhoId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Equipamento de retrabalho não encontrado."
                                    )
                            );

            layoutRetrabalho =
                    layoutRepository
                            .findById(
                                    dto.layoutRetrabalhoId()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Layout de retrabalho não encontrado."
                                    )
                            );

            if (equipamentoPrincipal.getId()
                    .equals(equipamentoRetrabalho.getId())) {
                throw new BusinessException(
                        "O equipamento principal e o equipamento de retrabalho devem ser diferentes."
                );
            }

            validarEquipamentoNaLinha(
                    equipamentoRetrabalho,
                    linha,
                    "de retrabalho"
            );

            validarLayoutDoEquipamento(
                    layoutRetrabalho,
                    equipamentoRetrabalho,
                    "de retrabalho"
            );

            validarCompatibilidadeLayouts(
                    layoutPrincipal,
                    layoutRetrabalho
            );
        }

        return new Relacionamentos(
                linha,
                equipamentoPrincipal,
                layoutPrincipal,
                equipamentoRetrabalho,
                layoutRetrabalho
        );
    }

    private void validarEquipamentoNaLinha(
            Equipamento equipamento,
            Linha linha,
            String tipo
    ) {
        if (equipamento.getLinha() == null
                || !equipamento.getLinha().getId()
                .equals(linha.getId())) {
            throw new BusinessException(
                    "O equipamento "
                            + tipo
                            + " não pertence à linha selecionada."
            );
        }
    }

    private void validarLayoutDoEquipamento(
            LayoutImpressao layout,
            Equipamento equipamento,
            String tipo
    ) {
        if (!layout.getEquipamento().getId()
                .equals(equipamento.getId())) {
            throw new BusinessException(
                    "O layout "
                            + tipo
                            + " não pertence ao equipamento informado."
            );
        }

        if (!Boolean.TRUE.equals(layout.getAtivo())) {
            throw new BusinessException(
                    "O layout "
                            + tipo
                            + " está inativo."
            );
        }
    }

    private void validarCompatibilidadeLayouts(
            LayoutImpressao principal,
            LayoutImpressao retrabalho
    ) {
        var chavesPrincipal =
                principal.getCampos()
                        .stream()
                        .map(campo -> campo.getChave())
                        .collect(
                                java.util.stream.Collectors.toSet()
                        );

        var chavesRetrabalho =
                retrabalho.getCampos()
                        .stream()
                        .map(campo -> campo.getChave())
                        .collect(
                                java.util.stream.Collectors.toSet()
                        );

        if (!chavesPrincipal.equals(chavesRetrabalho)) {
            throw new BusinessException(
                    "Os layouts principal e de retrabalho devem possuir os mesmos campos."
            );
        }
    }

    private Producao buscarEntidade(Long id) {
        return producaoRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Produção não encontrada com ID: "
                                        + id
                        )
                );
    }

    @Transactional
    public ProducaoResponseDTO finalizarCarga(Long id) {
        Producao producao =
                producaoRepository
                        .buscarPorIdParaAtualizacao(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Produção não encontrada com ID: "
                                                + id
                                )
                        );

        if (producao.getStatus()
                != StatusProducao.AGUARDANDO_DADOS) {
            throw new BusinessException(
                    "A carga desta produção já foi finalizada."
            );
        }

        long quantidade =
                itemRepository.countByProducaoId(id);

        if (quantidade == 0) {
            throw new BusinessException(
                    "Não é possível finalizar uma produção sem itens."
            );
        }

        producao.setQuantidadeTotal(quantidade);
        producao.setCargaFinalizadaEm(
                LocalDateTime.now()
        );
        producao.setStatus(
                StatusProducao.PRONTA
        );

        return converter(
                producaoRepository.save(producao)
        );
    }

    private String normalizarTexto(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }

        return texto.trim();
    }

    private ProducaoResponseDTO converter(
            Producao producao
    ) {
        Equipamento equipamentoRetrabalho =
                producao.getEquipamentoRetrabalho();

        LayoutImpressao layoutRetrabalho =
                producao.getLayoutRetrabalho();

        return new ProducaoResponseDTO(
                producao.getId(),
                producao.getVersao(),
                producao.getCodigoOrdem(),
                producao.getStatus(),
                producao.getQuantidadeTotal(),
                producao.getValidadeDias(),
                producao.getObservacoes(),

                producao.getLinha().getId(),
                producao.getLinha().getNome(),

                producao.getEquipamentoPrincipal().getId(),
                producao.getEquipamentoPrincipal().getNome(),

                producao.getLayoutPrincipal().getId(),
                producao.getLayoutPrincipal().getNome(),

                equipamentoRetrabalho != null
                        ? equipamentoRetrabalho.getId()
                        : null,

                equipamentoRetrabalho != null
                        ? equipamentoRetrabalho.getNome()
                        : null,

                layoutRetrabalho != null
                        ? layoutRetrabalho.getId()
                        : null,

                layoutRetrabalho != null
                        ? layoutRetrabalho.getNome()
                        : null,

                producao.getMotivoCancelamento(),
                producao.getCargaFinalizadaEm(),
                producao.getIniciadaEm(),
                producao.getConcluidaEm(),
                producao.getCanceladaEm(),
                producao.getCriadoEm(),
                producao.getAtualizadoEm()
        );
    }

    private record Relacionamentos(
            Linha linha,
            Equipamento equipamentoPrincipal,
            LayoutImpressao layoutPrincipal,
            Equipamento equipamentoRetrabalho,
            LayoutImpressao layoutRetrabalho
    ) {
    }
}