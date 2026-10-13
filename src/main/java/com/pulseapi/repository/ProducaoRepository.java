package com.pulseapi.repository;

import com.pulseapi.entity.producao.Producao;
import com.pulseapi.entity.producao.StatusProducao;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProducaoRepository
        extends JpaRepository<Producao, Long> {

    boolean existsByCodigoOrdemIgnoreCase(
            String codigoOrdem
    );

    boolean existsByCodigoOrdemIgnoreCaseAndIdNot(
            String codigoOrdem,
            Long id
    );

    List<Producao> findAllByOrderByCriadoEmDesc();

    @EntityGraph(
            attributePaths = {
                    "linha",
                    "equipamentoPrincipal",
                    "equipamentoRetrabalho"
            }
    )
    List<Producao>
    findAllByStatusInOrderByCriadoEmDesc(
            Collection<StatusProducao> status
    );

    @EntityGraph(
            attributePaths = {
                    "linha",
                    "equipamentoPrincipal",
                    "layoutPrincipal",
                    "equipamentoRetrabalho",
                    "layoutRetrabalho"
            }
    )
    @Query("""
        select producao
        from Producao producao
        where producao.criadoEm between :inicio and :fim
        order by producao.criadoEm desc
        """)
    List<Producao> buscarParaRelatorio(
            @Param("inicio")
            java.time.LocalDateTime inicio,

            @Param("fim")
            java.time.LocalDateTime fim
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select producao
            from Producao producao
            where producao.id = :id
            """)
    Optional<Producao> buscarPorIdParaAtualizacao(
            @Param("id") Long id
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
       select producao
       from Producao producao
       where (
           producao.status = com.pulseapi.entity.producao.StatusProducao.EM_ANDAMENTO
           and producao.equipamentoPrincipal.id = :equipamentoId
       )
       or (
           producao.status = com.pulseapi.entity.producao.StatusProducao.EM_RETRABALHO
           and producao.equipamentoRetrabalho.id = :equipamentoId
       )
       """)
    List<Producao> buscarAtivasPorEquipamentoParaAtualizacao(
            @Param("equipamentoId")
            Long equipamentoId
    );
}