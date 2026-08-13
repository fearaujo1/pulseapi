package com.pulseapi.repository;

import com.pulseapi.entity.CampoLayout;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CampoLayoutRepository extends JpaRepository<CampoLayout, Long> {

    List<CampoLayout> findByLayoutIdOrderByOrdemAsc(Long layoutId);

    void deleteByLayoutId(Long layoutId);

    
}
