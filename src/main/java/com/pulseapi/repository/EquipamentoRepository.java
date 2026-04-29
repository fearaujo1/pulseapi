package com.pulseapi.repository;

import com.pulseapi.entity.Equipamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// Camada de acesso ao banco de dados (ponte entre a aplicação e o banco)
@Repository
public interface EquipamentoRepository extends JpaRepository<Equipamento, Long> {
    Optional<Equipamento> findByCodigo(String codigo);
    boolean existsByCodigo(String codigo);

}

// JpaRespository = permite o save, findAll, findById, deleteById
// existsByCodigo = permite validação de código duplicado
