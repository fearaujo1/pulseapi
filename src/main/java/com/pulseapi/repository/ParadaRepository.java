package com.pulseapi.repository;

import com.pulseapi.entity.Parada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParadaRepository extends JpaRepository<Parada, Long> {

    List<Parada> findByEquipamento(Long equipamentoId);
}
