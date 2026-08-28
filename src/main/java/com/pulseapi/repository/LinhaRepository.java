package com.pulseapi.repository;

import com.pulseapi.entity.Linha;
import com.pulseapi.entity.StatusLinha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LinhaRepository
        extends JpaRepository<Linha, Long> {

    Optional<Linha> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    boolean existsByCodigoAndIdNot(
            String codigo,
            Long id
    );

    List<Linha> findAllByStatusOrderByNomeAsc(
            StatusLinha status
    );
}