package com.pulseapi.repository;

import com.pulseapi.entity.producao.Producao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select producao
        from Producao producao
        where producao.id = :id
        """)
    Optional<Producao> buscarPorIdParaAtualizacao(
            @Param("id") Long id
    );
}