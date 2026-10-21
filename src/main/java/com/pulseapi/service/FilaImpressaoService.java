package com.pulseapi.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pulseapi.dto.fila.FilaImpressaoRequestDTO;
import com.pulseapi.dto.fila.FilaImpressaoResponseDTO;
import com.pulseapi.dto.layout.MontarPayloadResponseDTO;
import com.pulseapi.entity.impressao.FilaImpressao;
import com.pulseapi.entity.impressao.LayoutImpressao;
import com.pulseapi.entity.impressao.StatusFilaImpressao;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.FilaImpressaoRepository;
import com.pulseapi.repository.LayoutImpressaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class FilaImpressaoService {

    private final FilaImpressaoRepository filaRepository;
    private final LayoutImpressaoRepository layoutRepository;
    private final PayloadMontadorService payloadMontadorService;
    private final ObjectMapper objectMapper;

    public FilaImpressaoService(
            FilaImpressaoRepository filaRepository,
            LayoutImpressaoRepository layoutRepository,
            PayloadMontadorService payloadMontadorService,
            ObjectMapper objectMapper
    ) {
        this.filaRepository = filaRepository;
        this.layoutRepository = layoutRepository;
        this.payloadMontadorService = payloadMontadorService;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public FilaImpressaoResponseDTO adicionar(
            FilaImpressaoRequestDTO dto
    ) {
        LayoutImpressao layout = buscarLayout(dto.layoutId());

        if (!Boolean.TRUE.equals(layout.getAtivo())) {
            throw new BusinessException(
                    "Não é possível utilizar um layout inativo."
            );
        }

        MontarPayloadResponseDTO payload =
                payloadMontadorService.montar(
                        dto.layoutId(),
                        dto.valores()
                );

        String valoresJson = converterValoresParaJson(
                dto.valores()
        );

        Long equipamentoId = layout.getEquipamento().getId();

        Long proximaOrdem = calcularProximaOrdem(
                equipamentoId
        );

        FilaImpressao fila = FilaImpressao.builder()
                .equipamento(layout.getEquipamento())
                .layout(layout)
                .valoresJson(valoresJson)
                .payloadMontado(payload.payload())
                .status(StatusFilaImpressao.PENDENTE)
                .ordemFila(proximaOrdem)
                .tentativas(0)
                .build();

        FilaImpressao salva = filaRepository.save(fila);

        return toResponseDTO(salva);
    }

    private LayoutImpressao buscarLayout(Long id) {
        return layoutRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Layout de impressão não encontrado com ID: " + id
                ));
    }
    
    private Long calcularProximaOrdem(Long equipamentoId) {
        return filaRepository
                .findFirstByEquipamentoIdOrderByOrdemFilaDesc(
                        equipamentoId
                )
                .map(registro -> registro.getOrdemFila() + 1)
                .orElse(1L);
    }

    private String converterValoresParaJson(
            Map<String, String> valores
    ) {
        try {
            return objectMapper.writeValueAsString(valores);

        } catch (JsonProcessingException e) {
            throw new BusinessException(
                    "Não foi possível armazenar os valores da impressão."
            );
        }
    }

    private Map<String, String> converterJsonParaValores(
            String valoresJson
    ) {
        try {
            return objectMapper.readValue(
                    valoresJson,
                    new TypeReference<Map<String, String>>() {
                    }
            );

        } catch (JsonProcessingException e) {
            throw new BusinessException(
                    "Não foi possível interpretar os valores da impressão."
            );
        }
    }

    private FilaImpressaoResponseDTO toResponseDTO(
            FilaImpressao fila
    ) {
        return new FilaImpressaoResponseDTO(
                fila.getId(),
                fila.getEquipamento().getId(),
                fila.getEquipamento().getNome(),
                fila.getLayout().getId(),
                fila.getLayout().getNome(),
                converterJsonParaValores(fila.getValoresJson()),
                fila.getPayloadMontado(),
                fila.getStatus(),
                fila.getOrdemFila(),
                fila.getTentativas(),
                fila.getMensagemErro(),
                fila.getContadorAntesEnvio(),
                fila.getContadorCarregamento(),
                fila.getContadorAposImpressao(),
                fila.getCriadoEm(),
                fila.getEnviadoEm(),
                fila.getImpressoEm()
        );
    }
}