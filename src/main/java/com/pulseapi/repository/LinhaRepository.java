package com.pulseapi.repository;

import com.pulseapi.entity.Linha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LinhaRepository
        extends JpaRepository<Linha, Long> {

    boolean existsByPlantaId(Long plantaId);

    boolean existsByPlantaIdAndCodigoIgnoreCase(
            Long plantaId,
            String codigo
    );

    boolean existsByPlantaIdAndCodigoIgnoreCaseAndIdNot(
            Long plantaId,
            String codigo,
            Long id
    );

    List<Linha> findAllByPlantaIdOrderByNomeAsc(
            Long plantaId
    );
}