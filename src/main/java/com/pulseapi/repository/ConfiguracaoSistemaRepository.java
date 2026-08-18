package com.pulseapi.repository;

import com.pulseapi.entity.ConfiguracaoSistema;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfiguracaoSistemaRepository
        extends JpaRepository<ConfiguracaoSistema, Long> {
}