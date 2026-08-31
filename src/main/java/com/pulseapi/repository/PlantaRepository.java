package com.pulseapi.repository;

import com.pulseapi.entity.Planta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlantaRepository
        extends JpaRepository<Planta, Long> {

    List<Planta> findAllByOrderByNomeAsc();

    boolean existsByEmpresaIdAndCodigoIgnoreCase(
            Long empresaId,
            String codigo
    );

    boolean existsByEmpresaIdAndCodigoIgnoreCaseAndIdNot(
            Long empresaId,
            String codigo,
            Long id
    );

    List<Planta> findAllByEmpresaIdOrderByNomeAsc(
            Long empresaId
    );
}