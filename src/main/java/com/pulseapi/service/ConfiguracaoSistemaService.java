package com.pulseapi.service;

import com.pulseapi.dto.configuracao.ConfiguracaoGeralRequestDTO;
import com.pulseapi.dto.configuracao.ConfiguracaoGeralResponseDTO;
import com.pulseapi.entity.ConfiguracaoSistema;
import com.pulseapi.repository.ConfiguracaoSistemaRepository;
import org.springframework.stereotype.Service;

@Service
public class ConfiguracaoSistemaService {

    private final ConfiguracaoSistemaRepository repository;

    public ConfiguracaoSistemaService(
            ConfiguracaoSistemaRepository repository
    ) {
        this.repository = repository;
    }

    public ConfiguracaoGeralResponseDTO buscar() {
        return converter(buscarOuCriar());
    }

    public ConfiguracaoGeralResponseDTO atualizar(
            ConfiguracaoGeralRequestDTO dto
    ) {
        ConfiguracaoSistema config = buscarOuCriar();

        config.setControleAcessoTurnoAtivo(
                dto.controleAcessoTurnoAtivo()
        );

        config.setToleranciaTurnoMinutos(
                dto.toleranciaTurnoMinutos()
        );

        return converter(
                repository.save(config)
        );
    }

    public ConfiguracaoSistema buscarEntity() {
        return buscarOuCriar();
    }

    private ConfiguracaoSistema buscarOuCriar() {
        return repository.findAll()
                .stream()
                .findFirst()
                .orElseGet(() ->
                        repository.save(
                                ConfiguracaoSistema.builder()
                                        .controleAcessoTurnoAtivo(false)
                                        .toleranciaTurnoMinutos(60)
                                        .build()
                        )
                );
    }

    private ConfiguracaoGeralResponseDTO converter(
            ConfiguracaoSistema config
    ) {
        return new ConfiguracaoGeralResponseDTO(
                config.getId(),
                config.getControleAcessoTurnoAtivo(),
                config.getToleranciaTurnoMinutos(),
                config.getAtualizadoEm()
        );
    }
}