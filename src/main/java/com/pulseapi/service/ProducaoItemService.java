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
import org.springframework.web.multipart.MultipartFile;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProducaoItemService {

    private final ProducaoRepository producaoRepository;
    private final ProducaoItemRepository itemRepository;
    private final PayloadMontadorService payloadMontadorService;
    private final ObjectMapper objectMapper;

    private static final long TAMANHO_MAXIMO_CSV =
            5L * 1024L * 1024L;

    private static final int QUANTIDADE_MAXIMA_ITENS_CSV =
            500;

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

    @Transactional
    public ProducaoItensLoteResponseDTO importarCsv(
            Long producaoId,
            MultipartFile arquivo
    ) {
        Producao producao =
                producaoRepository
                        .buscarPorIdParaAtualizacao(producaoId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Produção não encontrada."
                                )
                        );

        validarProducaoAceitaDados(producao);
        validarArquivoCsv(arquivo);

        var layout = producao.getLayoutPrincipal();

        if (
                layout == null ||
                        layout.getCampos() == null ||
                        layout.getCampos().isEmpty()
        ) {
            throw new BusinessException(
                    "O layout selecionado não possui campos configurados."
            );
        }

        Map<String, String> camposEsperados =
                new LinkedHashMap<>();

        layout.getCampos().forEach(campo -> {
            String chaveOriginal =
                    campo.getChave().trim();

            String chaveNormalizada =
                    normalizarCabecalho(chaveOriginal);

            if (
                    camposEsperados.put(
                            chaveNormalizada,
                            chaveOriginal
                    ) != null
            ) {
                throw new BusinessException(
                        "O layout possui campos duplicados: "
                                + chaveOriginal
                );
            }
        });

        CsvConteudo csv = lerCsv(arquivo);

        validarCabecalhoCsv(
                csv.cabecalhos(),
                camposEsperados
        );

        if (csv.linhas().isEmpty()) {
            throw new BusinessException(
                    "O arquivo CSV não possui itens para importação."
            );
        }

        if (
                csv.linhas().size()
                        > QUANTIDADE_MAXIMA_ITENS_CSV
        ) {
            throw new BusinessException(
                    "Cada arquivo CSV pode possuir no máximo "
                            + QUANTIDADE_MAXIMA_ITENS_CSV
                            + " itens."
            );
        }

        int maiorSequencia =
                itemRepository.buscarMaiorSequencia(
                        producaoId
                );

        List<ProducaoItem> novosItens =
                new ArrayList<>();

        for (
                int indiceLinha = 0;
                indiceLinha < csv.linhas().size();
                indiceLinha++
        ) {
            List<String> colunas =
                    csv.linhas().get(indiceLinha);

            int numeroLinhaCsv =
                    indiceLinha + 2;

            if (
                    colunas.size()
                            != csv.cabecalhos().size()
            ) {
                throw new BusinessException(
                        "A linha "
                                + numeroLinhaCsv
                                + " possui "
                                + colunas.size()
                                + " colunas, mas o cabeçalho possui "
                                + csv.cabecalhos().size()
                                + "."
                );
            }

            Map<String, String> valores =
                    new LinkedHashMap<>();

            for (
                    int indiceColuna = 0;
                    indiceColuna < csv.cabecalhos().size();
                    indiceColuna++
            ) {
                String cabecalho =
                        csv.cabecalhos()
                                .get(indiceColuna);

                String cabecalhoNormalizado =
                        normalizarCabecalho(cabecalho);

                String chaveLayout =
                        camposEsperados.get(
                                cabecalhoNormalizado
                        );

                valores.put(
                        chaveLayout,
                        colunas.get(indiceColuna).trim()
                );
            }

            int sequencia =
                    maiorSequencia
                            + indiceLinha
                            + 1;

            try {
                payloadMontadorService.montar(
                        layout.getId(),
                        valores
                );
            } catch (BusinessException exception) {
                throw new BusinessException(
                        "Erro na linha "
                                + numeroLinhaCsv
                                + ": "
                                + exception.getMessage()
                );
            }

            ProducaoItem item =
                    ProducaoItem.builder()
                            .producao(producao)
                            .sequencia(sequencia)
                            .referenciaExterna(null)
                            .valoresJson(
                                    converterParaJson(
                                            valores
                                    )
                            )
                            .status(
                                    StatusProducaoItem.AGUARDANDO
                            )
                            .build();

            novosItens.add(item);
        }

        itemRepository.saveAll(novosItens);

        long quantidadeTotalAtual =
                itemRepository.countByProducaoId(
                        producaoId
                );

        return new ProducaoItensLoteResponseDTO(
                producaoId,
                csv.linhas().size(),
                novosItens.size(),
                quantidadeTotalAtual
        );
    }

    private void validarArquivoCsv(
            MultipartFile arquivo
    ) {
        if (
                arquivo == null ||
                        arquivo.isEmpty()
        ) {
            throw new BusinessException(
                    "Selecione um arquivo CSV para importar."
            );
        }

        if (
                arquivo.getSize()
                        > TAMANHO_MAXIMO_CSV
        ) {
            throw new BusinessException(
                    "O arquivo CSV não pode ultrapassar 5 MB."
            );
        }

        String nomeArquivo =
                arquivo.getOriginalFilename();

        if (
                nomeArquivo == null ||
                        !nomeArquivo
                                .toLowerCase(Locale.ROOT)
                                .endsWith(".csv")
        ) {
            throw new BusinessException(
                    "O arquivo selecionado deve possuir a extensão .csv."
            );
        }
    }

    private void validarCabecalhoCsv(
            List<String> cabecalhos,
            Map<String, String> camposEsperados
    ) {
        if (cabecalhos.isEmpty()) {
            throw new BusinessException(
                    "O arquivo CSV não possui cabeçalho."
            );
        }

        Set<String> cabecalhosNormalizados =
                new LinkedHashSet<>();

        for (String cabecalho : cabecalhos) {
            if (
                    cabecalho == null ||
                            cabecalho.isBlank()
            ) {
                throw new BusinessException(
                        "O cabeçalho do CSV possui uma coluna sem nome."
                );
            }

            String normalizado =
                    normalizarCabecalho(cabecalho);

            if (
                    !cabecalhosNormalizados.add(
                            normalizado
                    )
            ) {
                throw new BusinessException(
                        "O cabeçalho do CSV possui uma coluna duplicada: "
                                + cabecalho.trim()
                );
            }
        }

        Set<String> camposFaltantes =
                new LinkedHashSet<>(
                        camposEsperados.keySet()
                );

        camposFaltantes.removeAll(
                cabecalhosNormalizados
        );

        Set<String> camposAdicionais =
                new LinkedHashSet<>(
                        cabecalhosNormalizados
                );

        camposAdicionais.removeAll(
                camposEsperados.keySet()
        );

        if (
                camposFaltantes.isEmpty() &&
                        camposAdicionais.isEmpty()
        ) {
            return;
        }

        List<String> mensagens =
                new ArrayList<>();

        if (!camposFaltantes.isEmpty()) {
            List<String> nomesFaltantes =
                    camposFaltantes.stream()
                            .map(camposEsperados::get)
                            .toList();

            mensagens.add(
                    "campos ausentes: "
                            + String.join(
                            ", ",
                            nomesFaltantes
                    )
            );
        }

        if (!camposAdicionais.isEmpty()) {
            mensagens.add(
                    "campos não reconhecidos: "
                            + String.join(
                            ", ",
                            camposAdicionais
                    )
            );
        }

        throw new BusinessException(
                "O cabeçalho do CSV não corresponde ao layout. "
                        + String.join("; ", mensagens)
                        + ". Campos esperados: "
                        + String.join(
                        ", ",
                        camposEsperados.values()
                )
                        + "."
        );
    }

    private CsvConteudo lerCsv(
            MultipartFile arquivo
    ) {
        try {
            String conteudo =
                    new String(
                            arquivo.getBytes(),
                            StandardCharsets.UTF_8
                    );

            if (
                    !conteudo.isEmpty() &&
                            conteudo.charAt(0) == '\uFEFF'
            ) {
                conteudo =
                        conteudo.substring(1);
            }

            conteudo = conteudo
                    .replace("\r\n", "\n")
                    .replace('\r', '\n');

            String[] linhasArquivo =
                    conteudo.split("\n", -1);

            int indiceCabecalho = -1;

            for (
                    int indice = 0;
                    indice < linhasArquivo.length;
                    indice++
            ) {
                if (!linhasArquivo[indice].isBlank()) {
                    indiceCabecalho = indice;
                    break;
                }
            }

            if (indiceCabecalho < 0) {
                throw new BusinessException(
                        "O arquivo CSV está vazio."
                );
            }

            char delimitador =
                    detectarDelimitador(
                            linhasArquivo[indiceCabecalho]
                    );

            List<String> cabecalhos =
                    analisarLinhaCsv(
                            linhasArquivo[indiceCabecalho],
                            delimitador,
                            indiceCabecalho + 1
                    );

            List<List<String>> linhas =
                    new ArrayList<>();

            for (
                    int indice = indiceCabecalho + 1;
                    indice < linhasArquivo.length;
                    indice++
            ) {
                String linha =
                        linhasArquivo[indice];

                if (linha.isBlank()) {
                    continue;
                }

                linhas.add(
                        analisarLinhaCsv(
                                linha,
                                delimitador,
                                indice + 1
                        )
                );
            }

            return new CsvConteudo(
                    cabecalhos,
                    linhas
            );

        } catch (BusinessException exception) {
            throw exception;

        } catch (Exception exception) {
            throw new BusinessException(
                    "Não foi possível ler o arquivo CSV."
            );
        }
    }

    private char detectarDelimitador(
            String cabecalho
    ) {
        int quantidadePontoVirgula =
                contarDelimitadorForaDeAspas(
                        cabecalho,
                        ';'
                );

        int quantidadeVirgula =
                contarDelimitadorForaDeAspas(
                        cabecalho,
                        ','
                );

        if (
                quantidadePontoVirgula == 0 &&
                        quantidadeVirgula == 0
        ) {
            return ';';
        }

        return quantidadePontoVirgula
                >= quantidadeVirgula
                ? ';'
                : ',';
    }

    private int contarDelimitadorForaDeAspas(
            String linha,
            char delimitador
    ) {
        boolean dentroDeAspas = false;
        int quantidade = 0;

        for (
                int indice = 0;
                indice < linha.length();
                indice++
        ) {
            char caractere =
                    linha.charAt(indice);

            if (caractere == '"') {
                if (
                        dentroDeAspas &&
                                indice + 1 < linha.length() &&
                                linha.charAt(indice + 1) == '"'
                ) {
                    indice++;
                    continue;
                }

                dentroDeAspas =
                        !dentroDeAspas;

            } else if (
                    caractere == delimitador &&
                            !dentroDeAspas
            ) {
                quantidade++;
            }
        }

        return quantidade;
    }

    private List<String> analisarLinhaCsv(
            String linha,
            char delimitador,
            int numeroLinha
    ) {
        List<String> colunas =
                new ArrayList<>();

        StringBuilder valorAtual =
                new StringBuilder();

        boolean dentroDeAspas = false;

        for (
                int indice = 0;
                indice < linha.length();
                indice++
        ) {
            char caractere =
                    linha.charAt(indice);

            if (caractere == '"') {
                if (
                        dentroDeAspas &&
                                indice + 1 < linha.length() &&
                                linha.charAt(indice + 1) == '"'
                ) {
                    valorAtual.append('"');
                    indice++;
                } else {
                    dentroDeAspas =
                            !dentroDeAspas;
                }

            } else if (
                    caractere == delimitador &&
                            !dentroDeAspas
            ) {
                colunas.add(
                        valorAtual.toString().trim()
                );

                valorAtual.setLength(0);

            } else {
                valorAtual.append(caractere);
            }
        }

        if (dentroDeAspas) {
            throw new BusinessException(
                    "A linha "
                            + numeroLinha
                            + " possui aspas não finalizadas."
            );
        }

        colunas.add(
                valorAtual.toString().trim()
        );

        return colunas;
    }

    private record CsvConteudo(
            List<String> cabecalhos,
            List<List<String>> linhas
    ) {
    }

    private String normalizarCabecalho(
            String valor
    ) {
        return valor == null
                ? ""
                : valor
                .trim()
                .toUpperCase(Locale.ROOT);
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