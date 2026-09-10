package com.pulseapi.repository;

import com.pulseapi.entity.usuario.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TurnoRepository extends JpaRepository<Turno, Long> {

    boolean existsByNomeIgnoreCase(String nome);
}