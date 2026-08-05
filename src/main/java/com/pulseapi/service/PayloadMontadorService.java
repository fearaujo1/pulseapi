package com.pulseapi.service;

import com.pulseapi.dto.layout.MontarPayloadResponseDTO;
import com.pulseapi.entity.CampoLayout;
import com.pulseapi.entity.EstrategiaMontagemPayload;
import com.pulseapi.entity.LayoutImpressao;
import com.pulseapi.entity.TipoCampoLayout;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.LayoutImpressaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class PayloadMontadorService {

    private final LayoutImpressaoRepository layoutRepository;

    public PayloadMontadorService(
            LayoutImpressaoRepository layoutRepository
    ) {
        this.layoutRepository = layoutRepository;
    }

    @Transactional(readOnly = true)
    public MontarPayloadResponseDTO montar(
            Long layoutId,
            Map<String, String> valoresRecebidos
    ) {
        LayoutImpressao layout = layoutRepository.findById(layoutId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Layout de impressão não encontrado com ID: " + layoutId
                ));

        if (!Boolean.TRUE.equals(layout.getAtivo())) {
            throw new BusinessException(
                    "O layout informado está inativo."
            );
        }

        Map<String, String> valoresNormalizados =
                normalizarChaves(valoresRecebidos);

        List<CampoLayout> camposOrdenados = layout.getCampos().stream()
                .sorted(Comparator.comparing(CampoLayout::getOrdem))
                .toList();

        Map<String, String> valoresFormatados = new LinkedHashMap<>();

        for (CampoLayout campo : camposOrdenados) {
            String valorRecebido = valoresNormalizados.get(campo.getChave());

            String valorFormatado = prepararValor(
                    campo,
                    valorRecebido
            );

            valoresFormatados.put(
                    campo.getChave(),
                    valorFormatado
            );
        }

        String payload = switch (layout.getEstrategiaMontagem()) {
            case DELIMITADO ->
                    montarDelimitado(layout, valoresFormatados);

            case OFFSET_FIXO ->
                    montarOffsetFixo(camposOrdenados, valoresFormatados);
        };

        int tamanhoBytes = payload.getBytes(
                StandardCharsets.US_ASCII
        ).length;

        return new MontarPayloadResponseDTO(
                layout.getId(),
                layout.getNome(),
                layout.getEstrategiaMontagem(),
                valoresFormatados,
                payload,
                tamanhoBytes
        );
    }

    private Map<String, String> normalizarChaves(
            Map<String, String> valores
    ) {
        Map<String, String> normalizados = new LinkedHashMap<>();

        valores.forEach((chave, valor) -> {
            if (chave != null) {
                normalizados.put(
                        chave.trim().toUpperCase(Locale.ROOT),
                        valor
                );
            }
        });

        return normalizados;
    }

    private String prepararValor(
            CampoLayout campo,
            String valorRecebido
    ) {
        String valor = valorRecebido;

        if (valor == null || valor.isBlank()) {
            valor = campo.getValorPadrao();
        }

        if ((valor == null || valor.isBlank())
                && Boolean.TRUE.equals(campo.getObrigatorio())) {
            throw new BusinessException(
                    "O campo " + campo.getChave() + " é obrigatório."
            );
        }

        if (valor == null) {
            valor = "";
        }

        String formatado = formatarPorTipo(campo, valor.trim());

        validarComprimento(campo, formatado);

        return formatado;
    }

    private String formatarPorTipo(
            CampoLayout campo,
            String valor
    ) {
        return switch (campo.getTipoDado()) {
            case TEXTO -> valor;

            case NUMERO -> formatarNumero(campo, valor);

            case DATA -> formatarData(campo, valor);

            case HORA -> formatarHora(campo, valor);

            case DATA_HORA -> formatarDataHora(campo, valor);

            case VALOR_FIXO -> {
                if (campo.getValorPadrao() == null) {
                    throw new BusinessException(
                            "O campo fixo " + campo.getChave()
                                    + " não possui valor padrão."
                    );
                }

                yield campo.getValorPadrao();
            }
        };
    }

    private String formatarNumero(
            CampoLayout campo,
            String valor
    ) {
        if (!valor.matches("-?\\d+(\\.\\d+)?")) {
            throw new BusinessException(
                    "O campo " + campo.getChave()
                            + " deve possuir um valor numérico."
            );
        }

        return valor;
    }

    private String formatarData(
            CampoLayout campo,
            String valor
    ) {
        String formatoSaida = obterFormato(
                campo,
                "ddMMyy"
        );

        try {
            LocalDate data = LocalDate.parse(
                    valor,
                    DateTimeFormatter.ISO_LOCAL_DATE
            );

            return data.format(
                    DateTimeFormatter.ofPattern(formatoSaida)
            );

        } catch (DateTimeParseException e) {
            throw new BusinessException(
                    "O campo " + campo.getChave()
                            + " deve usar o formato de entrada yyyy-MM-dd."
            );
        }
    }

    private String formatarHora(
            CampoLayout campo,
            String valor
    ) {
        String formatoSaida = obterFormato(
                campo,
                "HHmmss"
        );

        try {
            LocalTime hora = LocalTime.parse(
                    valor,
                    DateTimeFormatter.ISO_LOCAL_TIME
            );

            return hora.format(
                    DateTimeFormatter.ofPattern(formatoSaida)
            );

        } catch (DateTimeParseException e) {
            throw new BusinessException(
                    "O campo " + campo.getChave()
                            + " deve usar o formato de entrada HH:mm:ss."
            );
        }
    }

    private String formatarDataHora(
            CampoLayout campo,
            String valor
    ) {
        String formatoSaida = obterFormato(
                campo,
                "ddMMyyHHmmss"
        );

        try {
            LocalDateTime dataHora = LocalDateTime.parse(
                    valor,
                    DateTimeFormatter.ISO_LOCAL_DATE_TIME
            );

            return dataHora.format(
                    DateTimeFormatter.ofPattern(formatoSaida)
            );

        } catch (DateTimeParseException e) {
            throw new BusinessException(
                    "O campo " + campo.getChave()
                            + " deve usar o formato yyyy-MM-dd'T'HH:mm:ss."
            );
        }
    }

    private String obterFormato(
            CampoLayout campo,
            String formatoPadrao
    ) {
        if (campo.getFormato() == null
                || campo.getFormato().isBlank()) {
            return formatoPadrao;
        }

        return campo.getFormato();
    }

    private void validarComprimento(
            CampoLayout campo,
            String valor
    ) {
        if (campo.getComprimento() == null) {
            return;
        }

        if (valor.length() > campo.getComprimento()) {
            throw new BusinessException(
                    "O campo " + campo.getChave()
                            + " ultrapassa o limite de "
                            + campo.getComprimento()
                            + " caracteres."
            );
        }
    }

    private String montarDelimitado(
            LayoutImpressao layout,
            Map<String, String> valoresFormatados
    ) {
        if (layout.getDelimitador() == null
                || layout.getDelimitador().isBlank()) {
            throw new BusinessException(
                    "O layout não possui delimitador configurado."
            );
        }

        return String.join(
                layout.getDelimitador(),
                valoresFormatados.values()
        );
    }

    private String montarOffsetFixo(
            List<CampoLayout> campos,
            Map<String, String> valoresFormatados
    ) {
        int tamanhoTotal = campos.stream()
                .mapToInt(campo ->
                        campo.getOffset() + campo.getComprimento()
                )
                .max()
                .orElse(0);

        char[] buffer = new char[tamanhoTotal];

        for (int i = 0; i < buffer.length; i++) {
            buffer[i] = ' ';
        }

        for (CampoLayout campo : campos) {
            String valor = valoresFormatados.get(campo.getChave());

            String valorPreenchido = preencherAteComprimento(
                    valor,
                    campo.getComprimento()
            );

            for (int i = 0; i < valorPreenchido.length(); i++) {
                buffer[campo.getOffset() + i] =
                        valorPreenchido.charAt(i);
            }
        }

        return new String(buffer);
    }

    private String preencherAteComprimento(
            String valor,
            int comprimento
    ) {
        return String.format(
                "%-" + comprimento + "s",
                valor
        );
    }
}