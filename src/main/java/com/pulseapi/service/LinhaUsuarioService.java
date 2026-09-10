package com.pulseapi.service;

import com.pulseapi.dto.linhas.LinhaUsuarioRequestDTO;
import com.pulseapi.dto.linhas.LinhaUsuarioResponseDTO;
import com.pulseapi.entity.linha.Linha;
import com.pulseapi.entity.linha.LinhaUsuario;
import com.pulseapi.entity.linha.PapelNaLinha;
import com.pulseapi.entity.usuario.StatusUsuario;
import com.pulseapi.entity.usuario.Usuario;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.LinhaRepository;
import com.pulseapi.repository.LinhaUsuarioRepository;
import com.pulseapi.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class LinhaUsuarioService {

    private final LinhaUsuarioRepository linhaUsuarioRepository;
    private final LinhaRepository linhaRepository;
    private final UsuarioRepository usuarioRepository;

    public LinhaUsuarioService(
            LinhaUsuarioRepository linhaUsuarioRepository,
            LinhaRepository linhaRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.linhaUsuarioRepository =
                linhaUsuarioRepository;

        this.linhaRepository =
                linhaRepository;

        this.usuarioRepository =
                usuarioRepository;
    }

    @Transactional
    public LinhaUsuarioResponseDTO vincular(
            Long linhaId,
            LinhaUsuarioRequestDTO dto
    ) {
        Linha linha = linhaRepository
                .findById(linhaId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Linha não encontrada com ID: "
                                        + linhaId
                        )
                );

        Usuario usuario = usuarioRepository
                .findById(dto.usuarioId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Usuário não encontrado com ID: "
                                        + dto.usuarioId()
                        )
                );

        validarUsuario(
                usuario,
                dto.papelNaLinha()
        );

        if (linhaUsuarioRepository
                .existsByLinhaIdAndUsuarioId(
                        linhaId,
                        usuario.getId()
                )) {
            throw new BusinessException(
                    "Este usuário já está vinculado à linha."
            );
        }

        LinhaUsuario vinculo =
                LinhaUsuario.builder()
                        .linha(linha)
                        .usuario(usuario)
                        .papelNaLinha(
                                dto.papelNaLinha()
                        )
                        .build();

        LinhaUsuario salvo =
                linhaUsuarioRepository.save(vinculo);

        return toResponseDTO(salvo);
    }

    @Transactional(readOnly = true)
    public List<LinhaUsuarioResponseDTO>
    listarPorLinha(
            Long linhaId
    ) {
        if (!linhaRepository.existsById(linhaId)) {
            throw new ResourceNotFoundException(
                    "Linha não encontrada com ID: "
                            + linhaId
            );
        }

        return linhaUsuarioRepository
                .findAllByLinhaIdOrderByUsuarioNomeAsc(
                        linhaId
                )
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LinhaUsuarioResponseDTO>
    listarPorUsuario(
            Long usuarioId
    ) {
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new ResourceNotFoundException(
                    "Usuário não encontrado com ID: "
                            + usuarioId
            );
        }

        return linhaUsuarioRepository
                .findAllByUsuarioIdOrderByLinhaNomeAsc(
                        usuarioId
                )
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional
    public void remover(
            Long linhaId,
            Long vinculoId
    ) {
        LinhaUsuario vinculo =
                linhaUsuarioRepository
                        .findByIdAndLinhaId(
                                vinculoId,
                                linhaId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Responsável não encontrado nesta linha."
                                )
                        );

        linhaUsuarioRepository.delete(vinculo);
    }

    private void validarUsuario(
            Usuario usuario,
            PapelNaLinha papelNaLinha
    ) {
        if (usuario.getStatus()
                != StatusUsuario.ATIVO) {
            throw new BusinessException(
                    "Somente usuários ativos podem ser vinculados a uma linha."
            );
        }

        if (usuario.getPerfil() == null
                || usuario.getPerfil().getNome() == null) {
            throw new BusinessException(
                    "O usuário não possui um perfil válido."
            );
        }

        String perfil = usuario
                .getPerfil()
                .getNome()
                .trim()
                .toUpperCase(Locale.ROOT);

        if (!perfil.equals("OPERADOR")
                && !perfil.equals("SUPERVISOR")) {
            throw new BusinessException(
                    "Somente operadores e supervisores podem ser vinculados a uma linha."
            );
        }

        if (!perfil.equals(
                papelNaLinha.name()
        )) {
            throw new BusinessException(
                    "O papel informado deve corresponder ao perfil do usuário."
            );
        }
    }

    private LinhaUsuarioResponseDTO toResponseDTO(
            LinhaUsuario vinculo
    ) {
        return new LinhaUsuarioResponseDTO(
                vinculo.getId(),

                vinculo.getLinha().getId(),
                vinculo.getLinha().getNome(),

                vinculo.getUsuario().getId(),
                vinculo.getUsuario().getNome(),
                vinculo.getUsuario().getEmail(),
                vinculo.getUsuario()
                        .getPerfil()
                        .getNome(),

                vinculo.getPapelNaLinha(),
                vinculo.getDataCadastro()
        );
    }
}