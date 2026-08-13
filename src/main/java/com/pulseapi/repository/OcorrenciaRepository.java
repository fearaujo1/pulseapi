package com.pulseapi.repository;

import com.pulseapi.entity.Ocorrencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import com.pulseapi.entity.StatusOcorrencia;
import com.pulseapi.entity.TipoOcorrencia;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

@Repository
public interface OcorrenciaRepository extends JpaRepository<Ocorrencia, Long> {

    List<Ocorrencia> findByEquipamentoId(Long equipamentoId);


    @Query("""
    SELECT o
    FROM Ocorrencia o
    WHERE o.criadoEm >= :dataInicial
      AND o.criadoEm <= :dataFinal
      AND (:equipamentoId IS NULL OR o.equipamento.id = :equipamentoId)
      AND (:tipo IS NULL OR o.tipo = :tipo)
      AND (:status IS NULL OR o.status = :status)
    ORDER BY o.criadoEm DESC
    """)
    List<Ocorrencia> buscarParaRelatorio(
            @Param("dataInicial") LocalDateTime dataInicial,
            @Param("dataFinal") LocalDateTime dataFinal,
            @Param("equipamentoId") Long equipamentoId,
            @Param("tipo") TipoOcorrencia tipo,
            @Param("status") StatusOcorrencia status
    );
}
