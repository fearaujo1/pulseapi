package com.pulseapi.repository;

import com.pulseapi.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email); // Busca o user no login

    boolean existsByEmail(String email); // Verifica e o email já foi cadastrado

    @EntityGraph(attributePaths = "turnos")
    Optional<Usuario> findComTurnosByEmail(String email);
}
