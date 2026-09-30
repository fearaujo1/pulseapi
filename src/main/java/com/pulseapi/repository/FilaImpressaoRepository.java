package com.pulseapi.repository;

import com.pulseapi.entity.impressao.EtapaFilaProducao;
import com.pulseapi.entity.impressao.FilaImpressao;
import com.pulseapi.entity.impressao.StatusFilaImpressao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface FilaImpressaoRepository
        extends JpaRepository<FilaImpressao, Long> {

    List<FilaImpressao>
    findByEquipamentoIdOrderByOrdemFilaAsc(
            Long equipamentoId
    );

    List<FilaImpressao>
    findByEquipamentoIdAndStatusOrderByOrdemFilaAsc(
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

    boolean existsByEquipamentoIdAndStatusIn(
            Long equipamentoId,
            Collection<StatusFilaImpressao> status
    );

    Optional<FilaImpressao>
    findFirstByEquipamentoIdOrderByOrdemFilaDesc(
            Long equipamentoId
    );

    @Query("""
            SELECT DISTINCT f.equipamento.id
            FROM FilaImpressao f
            WHERE f.status IN :status
            """)
    Set<Long> findEquipamentosIdsPorStatus(
            @Param("status")
            Set<StatusFilaImpressao> status
    );

    long countByProducaoItemProducaoIdAndEtapaProducaoAndStatusIn(
            Long producaoId,
            EtapaFilaProducao etapaProducao,
            Collection<StatusFilaImpressao> status
    );

    boolean existsByProducaoItemIdAndEtapaProducaoAndStatusIn(
            Long producaoItemId,
            EtapaFilaProducao etapaProducao,
            Collection<StatusFilaImpressao> status
    );

    List<FilaImpressao>
    findAllByProducaoItemProducaoIdAndStatusOrderByOrdemFilaAsc(
            Long producaoId,
            StatusFilaImpressao status
    );

    @Query("""
            SELECT f
            FROM FilaImpressao f
            WHERE f.criadoEm >= :dataInicial
              AND f.criadoEm <= :dataFinal
              AND (
                    :equipamentoId IS NULL
                    OR f.equipamento.id = :equipamentoId
              )
              AND (
                    :status IS NULL
                    OR f.status = :status
              )
              AND (
                    :layoutId IS NULL
                    OR f.layout.id = :layoutId
              )
            ORDER BY f.criadoEm DESC
            """)
    List<FilaImpressao> buscarParaRelatorio(
            @Param("dataInicial")
            LocalDateTime dataInicial,

            @Param("dataFinal")
            LocalDateTime dataFinal,

            @Param("equipamentoId")
            Long equipamentoId,

            @Param("status")
            StatusFilaImpressao status,

            @Param("layoutId")
            Long layoutId
    );

    boolean existsByProducaoItemProducaoIdAndStatusIn(
            Long producaoId,
            Collection<StatusFilaImpressao> status
    );

    List<FilaImpressao>
    findAllByProducaoItemProducaoIdAndStatusInOrderByOrdemFilaAsc(
            Long producaoId,
            Collection<StatusFilaImpressao> status
    );
}