package com.pulseapi.service;

import com.pulseapi.dto.configuracao.ConfiguracaoNotificacaoResponseDTO;
import com.pulseapi.dto.configuracao.ConfiguracaoNotificacaoUpdateDTO;
import com.pulseapi.entity.ConfiguracaoNotificacao;
import com.pulseapi.entity.TipoNotificacao;
import com.pulseapi.repository.ConfiguracaoNotificacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class ConfiguracaoNotificacaoService {

    private final ConfiguracaoNotificacaoRepository configuracaoNotificacaoRepository;

    public ConfiguracaoNotificacaoService(ConfiguracaoNotificacaoRepository configuracaoNotificacaoRepository) {
        this.configuracaoNotificacaoRepository = configuracaoNotificacaoRepository;
    }

    // =========================================================
    // LISTAR
    // =========================================================

    @Transactional
    public List<ConfiguracaoNotificacaoResponseDTO> listar() {
        garantirConfiguracoesPadrao();

        return configuracaoNotificacaoRepository
                .findAll()
                .stream()
                .map(this::converter)
                .toList();

    }

    // =========================================================
    // ATUALIZAR
    // =========================================================

    @Transactional
    public ConfiguracaoNotificacaoResponseDTO atualizar(
            TipoNotificacao tipo,
            ConfiguracaoNotificacaoUpdateDTO dto
    ) {

        garantirConfiguracoesPadrao();

        ConfiguracaoNotificacao configuracao =
                configuracaoNotificacaoRepository.findByTipo(tipo)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Configuração de notificação não encontrada."
                                )
                        );

        configuracao.setNotificacaoSistemaAtiva(
                dto.notificacaoSistemaAtiva()
        );

        configuracao.setNotificacaoEmailAtiva(
                dto.notificacaoEmailAtiva()
        );

        ConfiguracaoNotificacao salva =
                configuracaoNotificacaoRepository.save(configuracao);

        return converter(salva);
    }

    // =========================================================
    // BUSCAR ENTITY
    // =========================================================

    @Transactional
    public ConfiguracaoNotificacao buscarPorTipo(TipoNotificacao tipo) {
        garantirConfiguracoesPadrao();

        return configuracaoNotificacaoRepository
                .findByTipo(tipo)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Configuração de notificação não encontrada."
                        )
                );
    }

    // =========================================================
    // CONFIGURAÇÕES PADRÃO
    // =========================================================

    private void garantirConfiguracoesPadrao() {

        Arrays.stream(
                TipoNotificacao.values()
        ).forEach(tipo -> {

            if (configuracaoNotificacaoRepository.findByTipo(tipo).isEmpty()) {
                ConfiguracaoNotificacao nova =
                        criarConfiguracaoPadrao(tipo);

                configuracaoNotificacaoRepository.save(nova);
            }
        });
    }

    private ConfiguracaoNotificacao criarConfiguracaoPadrao(TipoNotificacao tipo) {

        boolean sistemaAtivo = true;

        boolean emailAtivo =
                switch(tipo) {
                    case PRODUCAO_CONCLUIDA,
                         EQUIPAMENTO_SEM_CONEXAO,
                         NOVA_OCORRENCIA,
                         OCORRENCIA_CRITICA
                            -> true;

                    case PRODUCAO_INICIADA,
                         EQUIPAMENTO_RECONECTADO,
                         ERRO_IMPRESSAO,
                         IMPRESSAO_CONCLUIDA
                            -> false;
                };

        return ConfiguracaoNotificacao
                .builder()
                .tipo(tipo)
                .notificacaoSistemaAtiva(sistemaAtivo)
                .notificacaoEmailAtiva(emailAtivo)
                .build();
    }

    // =========================================================
    // DTO
    // =========================================================

    private ConfiguracaoNotificacaoResponseDTO converter(
            ConfiguracaoNotificacao configuracao
    ) {

        return new ConfiguracaoNotificacaoResponseDTO(
                configuracao.getId(),
                configuracao.getTipo(),
                configuracao.getNotificacaoSistemaAtiva(),
                configuracao.getNotificacaoEmailAtiva(),
                configuracao.getAtualizadoEm()
        );
    }
}
