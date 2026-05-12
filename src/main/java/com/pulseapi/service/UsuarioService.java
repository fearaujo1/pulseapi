package com.pulseapi.service;

import com.pulseapi.dto.usuario.UsuarioRequestDTO;
import com.pulseapi.dto.usuario.UsuarioResponseDTO;
import com.pulseapi.dto.usuario.UsuarioStatusDTO;
import com.pulseapi.dto.usuario.UsuarioUpdateDTO;
import com.pulseapi.entity.StatusUsuario;
import com.pulseapi.entity.Usuario;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }


    public UsuarioResponseDTO criar(UsuarioRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Já existe um usuário cadastrado com esse email.");
        }

        Usuario usuario = Usuario.builder()
                .nome(dto.getNome())
                .email(dto.getEmail())
                .senhaHash(passwordEncoder.encode(dto.getSenha()))
                .perfil(dto.getPerfil())
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
                usuario.getPerfil(),
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

        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setPerfil(dto.getPerfil());

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
