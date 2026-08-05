package com.pulseapi.repository;

import com.pulseapi.entity.Equipamento;
import com.pulseapi.entity.LayoutImpressao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LayoutImpressaoRepository extends JpaRepository<LayoutImpressao, Long> {

    List<LayoutImpressao> findByEquipamento(Long equipamentoId);

    List<LayoutImpressao> findByEquipamentoIdAndAtivoTrue(Long equipamentoId);

    Optional<LayoutImpressao> findByEquipamentoIdAndNomeNaImpressora(
            Long equipamentoId,
            String nomeImpressora
    );

    boolean existsByEquipamentoIdAndNomeNaImpressora(
            Long equipamentoId,
            String nomeImpressora
    );
}
