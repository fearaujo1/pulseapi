package com.pulseapi.repository;

import com.pulseapi.entity.FilaImpressao;
import com.pulseapi.entity.StatusFilaImpressao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FilaImpressaoRepository
        extends JpaRepository<FilaImpressao, Long> {

    List<FilaImpressao> findByEquipamentoIdOrderByOrdemFilaAsc(
            Long equipamentoId
    );

    List<FilaImpressao> findByEquipamentoIdAndStatusOrderByOrdemFilaAsc(
            Long equipamentoId,
            StatusFilaImpressao status
    );

    Optional<FilaImpressao>
    findFirstByEquipamentoIdAndStatusOrderByOrdemFilaAsc(
            Long equipamentoId,
            StatusFilaImpressao status
    );

    boolean existsByEquipamentoIdAndStatus(
            Long equipamentoId,
            StatusFilaImpressao status
    );
}