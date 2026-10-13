package com.pulseapi.service;

import com.pulseapi.dto.usuario.UsuarioRequestDTO;
import com.pulseapi.dto.usuario.UsuarioResponseDTO;
import com.pulseapi.dto.usuario.UsuarioSenhaRequestDTO;
import com.pulseapi.dto.usuario.UsuarioStatusDTO;
import com.pulseapi.dto.usuario.UsuarioTurnoResponseDTO;
import com.pulseapi.dto.usuario.UsuarioUpdateDTO;
import com.pulseapi.entity.usuario.Perfil;
import com.pulseapi.entity.usuario.StatusUsuario;
import com.pulseapi.entity.usuario.Turno;
import com.pulseapi.entity.usuario.Usuario;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.PerfilRepository;
import com.pulseapi.repository.TurnoRepository;
import com.pulseapi.repository.UsuarioRepository;
import com.pulseapi.util.SenhaValidator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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

    @Transactional
    public UsuarioResponseDTO criar(
            UsuarioRequestDTO dto,
            Usuario adminLogado
    ) {
        String email = normalizarEmail(
                dto.getEmail()
        );

        if (usuarioRepository.existsByEmail(email)) {
            throw new BusinessException(
                    "Já existe um usuário cadastrado com esse e-mail."
            );
        }

        SenhaValidator.validarSenhaForte(
                dto.getSenha()
        );

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
                        .nome(dto.getNome().trim())
                        .email(email)
                        .senhaHash(
                                passwordEncoder.encode(
                                        dto.getSenha()
                                )
                        )
                        .perfil(perfil)
                        .status(StatusUsuario.ATIVO)
                        .telefone(
                                normalizarTexto(
                                        dto.getTelefone()
                                )
                        )
                        .empresa(adminLogado.getEmpresa())

                        /*
                         * Mantido temporariamente enquanto
                         * a coluna ainda existe no banco.
                         */
                        .primeiroAcesso(false)

                        .turnos(turnos)
                        .build();

        return toResponseDTO(
                usuarioRepository.save(usuario)
        );
    }

    // =========================================================
    // LISTAR
    // =========================================================

    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(
            Long id
    ) {
        return toResponseDTO(
                buscarEntidade(id)
        );
    }

    // =========================================================
    // ATUALIZAR
    // =========================================================

    @Transactional
    public UsuarioResponseDTO atualizar(
            Long id,
            UsuarioUpdateDTO dto
    ) {
        Usuario usuario =
                buscarEntidade(id);

        String email =
                normalizarEmail(
                        dto.getEmail()
                );

        if (!usuario.getEmail()
                .equalsIgnoreCase(email)
                && usuarioRepository
                .existsByEmail(email)) {
            throw new BusinessException(
                    "Já existe um usuário cadastrado com este e-mail."
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
                dto.getNome().trim()
        );

        usuario.setEmail(email);

        usuario.setTelefone(
                normalizarTexto(
                        dto.getTelefone()
                )
        );

        usuario.setPerfil(perfil);
        usuario.setTurnos(turnos);

        return toResponseDTO(
                usuarioRepository.save(usuario)
        );
    }

    // =========================================================
    // REDEFINIR SENHA
    // =========================================================

    @Transactional
    public void redefinirSenha(
            Long id,
            UsuarioSenhaRequestDTO dto
    ) {
        Usuario usuario =
                buscarEntidade(id);

        if (!dto.novaSenha().equals(
                dto.confirmarSenha()
        )) {
            throw new BusinessException(
                    "A senha e a confirmação não conferem."
            );
        }

        SenhaValidator.validarSenhaForte(
                dto.novaSenha()
        );

        if (passwordEncoder.matches(
                dto.novaSenha(),
                usuario.getSenhaHash()
        )) {
            throw new BusinessException(
                    "A nova senha deve ser diferente da senha atual."
            );
        }

        usuario.setSenhaHash(
                passwordEncoder.encode(
                        dto.novaSenha()
                )
        );

        /*
         * Mantido durante a migração.
         * O usuário não será direcionado para primeiro acesso.
         */
        usuario.setPrimeiroAcesso(false);

        usuarioRepository.save(usuario);
    }

    // =========================================================
    // STATUS
    // =========================================================

    @Transactional
    public UsuarioResponseDTO atualizarStatus(
            Long id,
            UsuarioStatusDTO dto
    ) {
        Usuario usuario =
                buscarEntidade(id);

        usuario.setStatus(
                dto.getStatus()
        );

        return toResponseDTO(
                usuarioRepository.save(usuario)
        );
    }

    // =========================================================
    // EXCLUSÃO LÓGICA
    // =========================================================

    @Transactional
    public void deletar(
            Long id
    ) {
        Usuario usuario =
                buscarEntidade(id);

        usuario.setStatus(
                StatusUsuario.INATIVO
        );

        usuarioRepository.save(usuario);
    }

    // =========================================================
    // TURNOS
    // =========================================================

    private Set<Turno> buscarTurnos(
            Set<Long> turnoIds
    ) {
        if (turnoIds == null
                || turnoIds.isEmpty()) {
            return new HashSet<>();
        }

        List<Turno> encontrados =
                turnoRepository.findAllById(
                        turnoIds
                );

        if (encontrados.size()
                != turnoIds.size()) {
            throw new ResourceNotFoundException(
                    "Um ou mais turnos informados não foram encontrados."
            );
        }

        return new HashSet<>(
                encontrados
        );
    }

    // =========================================================
    // BUSCA INTERNA
    // =========================================================

    private Usuario buscarEntidade(
            Long id
    ) {
        return usuarioRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Usuário não encontrado com ID: "
                                        + id
                        )
                );
    }

    // =========================================================
    // NORMALIZAÇÃO
    // =========================================================

    private String normalizarEmail(
            String email
    ) {
        return email
                .trim()
                .toLowerCase();
    }

    private String normalizarTexto(
            String texto
    ) {
        if (texto == null
                || texto.isBlank()) {
            return null;
        }

        return texto.trim();
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
                                Collectors.toSet()
                        );

        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTelefone(),

                usuario.getPerfil().getNome(),
                usuario.getPerfil().getId(),

                usuario.getStatus(),

                usuario.getEmpresa() != null
                        ? usuario.getEmpresa().getId()
                        : null,

                usuario.getEmpresa() != null
                        ? usuario.getEmpresa()
                        .getNomeFantasia()
                        : null,

                turnos,

                usuario.getDataCadastro(),
                usuario.getUltimaAtualizacao()
        );
    }
}