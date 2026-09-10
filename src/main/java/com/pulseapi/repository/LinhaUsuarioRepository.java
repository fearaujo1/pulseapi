package com.pulseapi.repository;

import com.pulseapi.entity.linha.LinhaUsuario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LinhaUsuarioRepository
        extends JpaRepository<LinhaUsuario, Long> {

    boolean existsByLinhaIdAndUsuarioId(
            Long linhaId,
            Long usuarioId
    );

    Optional<LinhaUsuario>
    findByLinhaIdAndUsuarioId(
            Long linhaId,
            Long usuarioId
    );

    @EntityGraph(
            attributePaths = {
                    "linha",
                    "usuario",
                    "usuario.perfil"
            }
    )
    List<LinhaUsuario>
    findAllByLinhaIdOrderByUsuarioNomeAsc(
            Long linhaId
    );

    @EntityGraph(
            attributePaths = {
                    "linha",
                    "linha.planta",
                    "usuario"
            }
    )
    List<LinhaUsuario>
    findAllByUsuarioIdOrderByLinhaNomeAsc(
            Long usuarioId
    );

    @EntityGraph(
            attributePaths = {
                    "linha",
                    "usuario",
                    "usuario.perfil"
            }
    )
    Optional<LinhaUsuario> findByIdAndLinhaId(
            Long id,
            Long linhaId
    );
}