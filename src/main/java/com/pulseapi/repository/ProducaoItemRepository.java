package com.pulseapi.repository;

import com.pulseapi.entity.producao.ProducaoItem;
import com.pulseapi.entity.producao.StatusProducaoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ProducaoItemRepository
        extends JpaRepository<ProducaoItem, Long> {

    boolean existsByProducaoIdAndSequencia(
            Long producaoId,
            Integer sequencia
    );

    long countByProducaoId(
            Long producaoId
    );

    long countByProducaoIdAndStatus(
            Long producaoId,
            StatusProducaoItem status
    );

    List<ProducaoItem>
    findAllByProducaoIdOrderBySequenciaAsc(
            Long producaoId
    );

    @Query("""
            select item.sequencia
            from ProducaoItem item
            where item.producao.id = :producaoId
              and item.sequencia in :sequencias
            """)
    List<Integer> buscarSequenciasExistentes(
            @Param("producaoId")
            Long producaoId,

            @Param("sequencias")
            Collection<Integer> sequencias
    );

    List<ProducaoItem>
    findTop2ByProducaoIdAndStatusOrderBySequenciaAsc(
            Long producaoId,
            StatusProducaoItem status
    );

    Optional<ProducaoItem>
    findFirstByProducaoIdAndStatusOrderBySequenciaAsc(
            Long producaoId,
            StatusProducaoItem status
    );

    long countByProducaoIdAndStatusIn(
            Long producaoId,
            Collection<StatusProducaoItem> status
    );

    @Modifying(
            flushAutomatically = true
    )
    @Query("""
        update ProducaoItem item
           set item.status = :novoStatus,
               item.atualizadoEm = CURRENT_TIMESTAMP
         where item.producao.id = :producaoId
           and item.status = :statusAtual
        """)
    int atualizarStatusEmLote(
            @Param("producaoId")
            Long producaoId,

            @Param("statusAtual")
            StatusProducaoItem statusAtual,

            @Param("novoStatus")
            StatusProducaoItem novoStatus
    );

    Optional<ProducaoItem> findByIdAndProducaoId(
            Long itemId,
            Long producaoId
    );
}