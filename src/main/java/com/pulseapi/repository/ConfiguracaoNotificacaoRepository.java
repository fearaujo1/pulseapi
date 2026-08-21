package com.pulseapi.repository;

import com.pulseapi.entity.ConfiguracaoNotificacao;
import com.pulseapi.entity.TipoNotificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracaoNotificacaoRepository
        extends JpaRepository<ConfiguracaoNotificacao, Long> {

    Optional<ConfiguracaoNotificacao>
    findByTipo(TipoNotificacao tipo);
}