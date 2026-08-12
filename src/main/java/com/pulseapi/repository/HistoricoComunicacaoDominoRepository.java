package com.pulseapi.repository;

import com.pulseapi.entity.HistoricoComunicacaoDomino;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoricoComunicacaoDominoRepository
        extends JpaRepository<HistoricoComunicacaoDomino, Long> {

    List<HistoricoComunicacaoDomino> findByEquipamentoIdOrderByCriadoEmDesc(Long equipamentoId);
}
