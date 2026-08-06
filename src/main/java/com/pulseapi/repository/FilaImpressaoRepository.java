package com.pulseapi.repository;

import com.pulseapi.entity.FilaImpressao;
import com.pulseapi.entity.StatusFilaImpressao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

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

    Optional<FilaImpressao> findFirstByEquipamentoIdOrderByOrdemFilaDesc(
            Long equipamentoId
    );

    @Query("""
       select distinct f.equipamento.id
       from FilaImpressao f
       where f.status in :status
       """)
    Set<Long> findEquipamentosIdsPorStatus(
            @Param("status") Set<StatusFilaImpressao> status
    );
}