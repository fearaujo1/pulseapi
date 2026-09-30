package com.pulseapi.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pulseapi.dto.producao.ProducaoItemImportacaoDTO;
import com.pulseapi.dto.producao.ProducaoItemResponseDTO;
import com.pulseapi.dto.producao.ProducaoItensLoteRequestDTO;
import com.pulseapi.dto.producao.ProducaoItensLoteResponseDTO;
import com.pulseapi.entity.impressao.LayoutImpressao;
import com.pulseapi.entity.producao.Producao;
import com.pulseapi.entity.producao.ProducaoItem;
import com.pulseapi.entity.producao.StatusProducao;
import com.pulseapi.entity.producao.StatusProducaoItem;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.ProducaoItemRepository;
import com.pulseapi.repository.ProducaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProducaoItemService {

    private final ProducaoRepository producaoRepository;
    private final ProducaoItemRepository itemRepository;
    private final PayloadMontadorService payloadMontadorService;
    private final ObjectMapper objectMapper;

    public ProducaoItemService(
            ProducaoRepository producaoRepository,
            ProducaoItemRepository itemRepository,
            PayloadMontadorService payloadMontadorService,
            ObjectMapper objectMapper
    ) {
        this.producaoRepository = producaoRepository;
        this.itemRepository = itemRepository;
        this.payloadMontadorService = payloadMontadorService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ProducaoItensLoteResponseDTO importarLote(
            Long producaoId,
            ProducaoItensLoteRequestDTO dto
    ) {
        Producao producao =
                buscarParaAtualizacao(producaoId);

        validarProducaoAceitaDados(producao);

        validarSequenciasDoLote(
                producaoId,
                dto.itens()
        );

        LayoutImpressao layout =
                producao.getLayoutPrincipal();

        List<ProducaoItem> novosItens =
                new ArrayList<>();

        for (ProducaoItemImportacaoDTO itemDTO
                : dto.itens()) {

            Map<String, String> valores =
                    normalizarEValidarValores(
                            layout,
                            itemDTO.valores()
                    );

            /*
             * Valida obrigatoriedade, tipo,
             * formato e comprimento.
             *
             * O payload retornado não é armazenado aqui.
             */
            payloadMontadorService.montar(
                    layout.getId(),
                    valores
            );

            ProducaoItem item =
                    ProducaoItem.builder()
                            .producao(producao)
                            .sequencia(
                                    itemDTO.sequencia()
                            )
                            .referenciaExterna(
                                    normalizarTexto(
                                            itemDTO.referenciaExterna()
                                    )
                            )
                            .valoresJson(
                                    converterParaJson(valores)
                            )
                            .status(
                                    StatusProducaoItem.AGUARDANDO
                            )
                            .build();

            novosItens.add(item);
        }

        itemRepository.saveAll(novosItens);
        itemRepository.flush();

        long quantidadeTotalAtual =
                itemRepository.countByProducaoId(
                        producaoId
                );

        return new ProducaoItensLoteResponseDTO(
                producaoId,
                dto.itens().size(),
                novosItens.size(),
                quantidadeTotalAtual
        );
    }

    @Transactional(readOnly = true)
    public List<ProducaoItemResponseDTO> listar(
            Long producaoId
    ) {
        if (!producaoRepository.existsById(producaoId)) {
            throw new ResourceNotFoundException(
                    "Produção não encontrada com ID: "
                            + producaoId
            );
        }

        return itemRepository
                .findAllByProducaoIdOrderBySequenciaAsc(
                        producaoId
                )
                .stream()
                .map(this::converter)
                .toList();
    }

    private void validarProducaoAceitaDados(
            Producao producao
    ) {
        if (producao.getStatus()
                != StatusProducao.AGUARDANDO_DADOS) {
            throw new BusinessException(
                    "A produção não aceita mais importação de dados."
            );
        }
    }

    private void validarSequenciasDoLote(
            Long producaoId,
            List<ProducaoItemImportacaoDTO> itens
    ) {
        Set<Integer> sequenciasRecebidas =
                new HashSet<>();

        for (ProducaoItemImportacaoDTO item : itens) {
            if (!sequenciasRecebidas.add(
                    item.sequencia()
            )) {
                throw new BusinessException(
                        "A sequência "
                                + item.sequencia()
                                + " está repetida no lote."
                );
            }
        }

        List<Integer> sequenciasExistentes =
                itemRepository.buscarSequenciasExistentes(
                        producaoId,
                        sequenciasRecebidas
                );

        if (!sequenciasExistentes.isEmpty()) {
            throw new BusinessException(
                    "As seguintes sequências já foram importadas: "
                            + sequenciasExistentes
            );
        }
    }

    private Map<String, String> normalizarEValidarValores(
            LayoutImpressao layout,
            Map<String, String> valoresRecebidos
    ) {
        Map<String, String> chavesDoLayout =
                layout.getCampos()
                        .stream()
                        .collect(
                                Collectors.toMap(
                                        campo -> normalizarChave(
                                                campo.getChave()
                                        ),
                                        campo -> campo.getChave(),
                                        (primeira, segunda) ->
                                                primeira,
                                        LinkedHashMap::new
                                )
                        );

        Map<String, String> valoresNormalizados =
                new LinkedHashMap<>();

        Set<String> chavesRecebidas =
                new HashSet<>();

        for (Map.Entry<String, String> entrada
                : valoresRecebidos.entrySet()) {

            String chaveNormalizada =
                    normalizarChave(
                            entrada.getKey()
                    );

            if (!chavesRecebidas.add(
                    chaveNormalizada
            )) {
                throw new BusinessException(
                        "O campo "
                                + entrada.getKey()
                                + " foi informado mais de uma vez."
                );
            }

            String chaveOriginal =
                    chavesDoLayout.get(
                            chaveNormalizada
                    );

            if (chaveOriginal == null) {
                throw new BusinessException(
                        "O campo "
                                + entrada.getKey()
                                + " não existe no layout "
                                + layout.getNome()
                                + "."
                );
            }

            valoresNormalizados.put(
                    chaveOriginal,
                    entrada.getValue()
            );
        }

        return valoresNormalizados;
    }

    private String normalizarChave(String chave) {
        return chave
                .trim()
                .toUpperCase(Locale.ROOT);
    }

    private String converterParaJson(
            Map<String, String> valores
    ) {
        try {
            return objectMapper.writeValueAsString(
                    valores
            );

        } catch (JsonProcessingException exception) {
            throw new BusinessException(
                    "Não foi possível armazenar os valores do item."
            );
        }
    }

    private Map<String, String> converterDoJson(
            String json
    ) {
        try {
            return objectMapper.readValue(
                    json,
                    new TypeReference<
                            Map<String, String>
                            >() {
                    }
            );

        } catch (JsonProcessingException exception) {
            throw new BusinessException(
                    "Não foi possível interpretar os valores do item."
            );
        }
    }

    private String normalizarTexto(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }

        return texto.trim();
    }

    private Producao buscarParaAtualizacao(
            Long producaoId
    ) {
        return producaoRepository
                .buscarPorIdParaAtualizacao(
                        producaoId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Produção não encontrada com ID: "
                                        + producaoId
                        )
                );
    }

    private ProducaoItemResponseDTO converter(
            ProducaoItem item
    ) {
        return new ProducaoItemResponseDTO(
                item.getId(),
                item.getVersao(),
                item.getProducao().getId(),
                item.getSequencia(),
                item.getReferenciaExterna(),
                converterDoJson(
                        item.getValoresJson()
                ),
                item.getStatus(),
                item.getMensagemErro(),
                item.getCriadoEm(),
                item.getAtualizadoEm(),
                item.getImpressoEm()
        );
    }
}