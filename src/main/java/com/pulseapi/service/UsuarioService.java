package com.pulseapi.service;

import com.pulseapi.dto.usuario.UsuarioRequestDTO;
import com.pulseapi.dto.usuario.UsuarioResponseDTO;
import com.pulseapi.dto.usuario.UsuarioStatusDTO;
import com.pulseapi.dto.usuario.UsuarioUpdateDTO;
import com.pulseapi.entity.Perfil;
import com.pulseapi.entity.StatusUsuario;
import com.pulseapi.entity.Usuario;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.PerfilRepository;
import com.pulseapi.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final PerfilRepository perfilRepository;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder,
                          PerfilRepository perfilRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.perfilRepository = perfilRepository;
    }

    public UsuarioResponseDTO criar(UsuarioRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Já existe um usuário cadastrado com esse email.");
        }

        Perfil perfil = perfilRepository.findById(dto.getPerfilId())
        .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado."));

        Usuario usuario = Usuario.builder()
                .nome(dto.getNome())
                .email(dto.getEmail())
                .senhaHash(passwordEncoder.encode(dto.getSenha()))
                .perfil(perfil)
                .status(StatusUsuario.ATIVO)
                .primeiroAcesso(true)
                .build();

        Usuario salvo = usuarioRepository.save(usuario);

        return toResponseDTO(salvo);
    }

    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public UsuarioResponseDTO buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: "+ id));
        return toResponseDTO(usuario);
    }

    public UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().getNome(),
                usuario.getStatus(),
                usuario.getPrimeiroAcesso(),
                usuario.getDataCadastro(),
                usuario.getUltimaAtualizacao()
        );
    }

    public UsuarioResponseDTO atualizar(Long id, UsuarioUpdateDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + id));

        if (!usuario.getEmail().equals(dto.getEmail()) &&
                usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Já existe um usuário cadastrado com este email.");
        }

        Perfil perfil = perfilRepository.findById(dto.getPerfilId())
                .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado."));

        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setPerfil(perfil);

        Usuario atualizado = usuarioRepository.save(usuario);

        return toResponseDTO(atualizado);
    }

    public UsuarioResponseDTO atualizarStatus(Long id, UsuarioStatusDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + id));

        usuario.setStatus(dto.getStatus());

        Usuario atualizado = usuarioRepository.save(usuario);

        return toResponseDTO(atualizado);
    }

    public void deletar(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + id));

        usuarioRepository.delete(usuario);
    }
}














