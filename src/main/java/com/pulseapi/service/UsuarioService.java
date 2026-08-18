package com.pulseapi.service;

import com.pulseapi.dto.usuario.UsuarioRequestDTO;
import com.pulseapi.dto.usuario.UsuarioResponseDTO;
import com.pulseapi.dto.usuario.UsuarioStatusDTO;
import com.pulseapi.dto.usuario.UsuarioTurnoResponseDTO;
import com.pulseapi.dto.usuario.UsuarioUpdateDTO;

import com.pulseapi.entity.Perfil;
import com.pulseapi.entity.StatusUsuario;
import com.pulseapi.entity.Turno;
import com.pulseapi.entity.Usuario;

import com.pulseapi.exception.BusinessException;
import com.pulseapi.exception.ResourceNotFoundException;

import com.pulseapi.repository.PerfilRepository;
import com.pulseapi.repository.TurnoRepository;
import com.pulseapi.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final PerfilRepository perfilRepository;
    private final TurnoRepository turnoRepository;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            PerfilRepository perfilRepository,
            TurnoRepository turnoRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.perfilRepository = perfilRepository;
        this.turnoRepository = turnoRepository;
    }


    // =========================================================
    // CRIAR
    // =========================================================

    public UsuarioResponseDTO criar(
            UsuarioRequestDTO dto,
            Usuario adminLogado
    ) {

        if (
                usuarioRepository.existsByEmail(
                        dto.getEmail()
                )
        ) {
            throw new BusinessException(
                    "Já existe um usuário cadastrado com esse email."
            );
        }

        Perfil perfil =
                perfilRepository.findById(
                                dto.getPerfilId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Perfil não encontrado."
                                )
                        );

        Set<Turno> turnos =
                buscarTurnos(
                        dto.getTurnoIds()
                );

        Usuario usuario =
                Usuario.builder()
                        .nome(dto.getNome())
                        .email(dto.getEmail())
                        .senhaHash(
                                passwordEncoder.encode(
                                        dto.getSenhaTemporaria()
                                )
                        )
                        .perfil(perfil)
                        .status(StatusUsuario.ATIVO)
                        .telefone(dto.getTelefone())
                        .empresa(adminLogado.getEmpresa())
                        .primeiroAcesso(true)
                        .turnos(turnos)
                        .build();

        Usuario salvo =
                usuarioRepository.save(
                        usuario
                );

        return toResponseDTO(
                salvo
        );
    }


    // =========================================================
    // LISTAR
    // =========================================================

    public List<UsuarioResponseDTO> listarTodos() {

        return usuarioRepository
                .findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }


    // =========================================================
    // BUSCAR
    // =========================================================

    public UsuarioResponseDTO buscarPorId(
            Long id
    ) {

        Usuario usuario =
                usuarioRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Usuário não encontrado com ID: " + id
                                )
                        );

        return toResponseDTO(
                usuario
        );
    }


    // =========================================================
    // ATUALIZAR
    // =========================================================

    public UsuarioResponseDTO atualizar(
            Long id,
            UsuarioUpdateDTO dto
    ) {

        Usuario usuario =
                usuarioRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Usuário não encontrado com ID: " + id
                                )
                        );

        if (
                !usuario.getEmail()
                        .equals(dto.getEmail())
                        &&
                        usuarioRepository.existsByEmail(
                                dto.getEmail()
                        )
        ) {
            throw new BusinessException(
                    "Já existe um usuário cadastrado com este email."
            );
        }

        Perfil perfil =
                perfilRepository.findById(
                                dto.getPerfilId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Perfil não encontrado com ID: "
                                                + dto.getPerfilId()
                                )
                        );

        Set<Turno> turnos =
                buscarTurnos(
                        dto.getTurnoIds()
                );

        usuario.setNome(
                dto.getNome()
        );

        usuario.setEmail(
                dto.getEmail()
        );

        usuario.setTelefone(
                dto.getTelefone()
        );

        usuario.setPerfil(
                perfil
        );

        usuario.setTurnos(
                turnos
        );

        Usuario atualizado =
                usuarioRepository.save(
                        usuario
                );

        return toResponseDTO(
                atualizado
        );
    }


    // =========================================================
    // STATUS
    // =========================================================

    public UsuarioResponseDTO atualizarStatus(
            Long id,
            UsuarioStatusDTO dto
    ) {

        Usuario usuario =
                usuarioRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Usuário não encontrado com ID: " + id
                                )
                        );

        usuario.setStatus(
                dto.getStatus()
        );

        Usuario atualizado =
                usuarioRepository.save(
                        usuario
                );

        return toResponseDTO(
                atualizado
        );
    }


    // =========================================================
    // EXCLUSÃO LÓGICA
    // =========================================================

    public void deletar(
            Long id
    ) {

        Usuario usuario =
                usuarioRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Usuário não encontrado com ID: " + id
                                )
                        );

        usuario.setStatus(
                StatusUsuario.INATIVO
        );

        usuarioRepository.save(
                usuario
        );
    }


    // =========================================================
    // TURNOS
    // =========================================================

    private Set<Turno> buscarTurnos(
            Set<Long> turnoIds
    ) {

        if (
                turnoIds == null ||
                        turnoIds.isEmpty()
        ) {
            return new HashSet<>();
        }

        List<Turno> encontrados =
                turnoRepository.findAllById(
                        turnoIds
                );

        /*
         * Se foram enviados 3 IDs e apenas 2
         * foram encontrados, existe algum ID inválido.
         */
        if (
                encontrados.size() !=
                        turnoIds.size()
        ) {
            throw new ResourceNotFoundException(
                    "Um ou mais turnos informados não foram encontrados."
            );
        }

        return new HashSet<>(
                encontrados
        );
    }


    // =========================================================
    // DTO
    // =========================================================

    public UsuarioResponseDTO toResponseDTO(
            Usuario usuario
    ) {

        Set<UsuarioTurnoResponseDTO> turnos =
                usuario.getTurnos()
                        .stream()
                        .map(turno ->
                                new UsuarioTurnoResponseDTO(
                                        turno.getId(),
                                        turno.getNome(),
                                        turno.getHoraInicio(),
                                        turno.getHoraFim(),
                                        turno.getAtivo()
                                )
                        )
                        .collect(
                                java.util.stream.Collectors.toSet()
                        );

        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTelefone(),

                usuario.getPerfil().getNome(),
                usuario.getPerfil().getId(),

                usuario.getStatus(),
                usuario.getPrimeiroAcesso(),

                usuario.getEmpresa() != null
                        ? usuario.getEmpresa().getId()
                        : null,

                usuario.getEmpresa() != null
                        ? usuario.getEmpresa().getNomeFantasia()
                        : null,

                turnos,

                usuario.getDataCadastro(),
                usuario.getUltimaAtualizacao()
        );
    }
}