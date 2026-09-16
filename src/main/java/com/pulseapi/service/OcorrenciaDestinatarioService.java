package com.pulseapi.service;

import com.pulseapi.entity.equipamento.Equipamento;
import com.pulseapi.entity.linha.LinhaUsuario;
import com.pulseapi.entity.usuario.StatusUsuario;
import com.pulseapi.entity.usuario.Usuario;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.EquipamentoRepository;
import com.pulseapi.repository.LinhaUsuarioRepository;
import com.pulseapi.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class OcorrenciaDestinatarioService {

    private final EquipamentoRepository equipamentoRepository;
    private final LinhaUsuarioRepository linhaUsuarioRepository;
    private final UsuarioRepository usuarioRepository;

    public OcorrenciaDestinatarioService(
            EquipamentoRepository equipamentoRepository,
            LinhaUsuarioRepository linhaUsuarioRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.equipamentoRepository =
                equipamentoRepository;

        this.linhaUsuarioRepository =
                linhaUsuarioRepository;

        this.usuarioRepository =
                usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<Usuario> buscarPorEquipamento(
            Long equipamentoId
    ) {
        Equipamento equipamento =
                equipamentoRepository
                        .findById(equipamentoId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Equipamento não encontrado com ID: "
                                                + equipamentoId
                                )
                        );

        Map<Long, Usuario> destinatarios =
                new LinkedHashMap<>();

        /*
         * Operadores e supervisores vinculados
         * à linha do equipamento.
         */
        if (equipamento.getLinha() != null) {
            List<LinhaUsuario> vinculos =
                    linhaUsuarioRepository
                            .findAllByLinhaIdAndUsuarioStatus(
                                    equipamento
                                            .getLinha()
                                            .getId(),
                                    StatusUsuario.ATIVO
                            );

            for (LinhaUsuario vinculo : vinculos) {
                Usuario usuario = vinculo.getUsuario();

                String perfil = usuario
                        .getPerfil()
                        .getNome();

                if (!perfil.equals("OPERADOR")
                        && !perfil.equals("SUPERVISOR")) {
                    continue;
                }

                destinatarios.put(
                        usuario.getId(),
                        usuario
                );
            }
        }

        /*
         * Gestores são responsáveis globalmente.
         */
        List<Usuario> gestores =
                usuarioRepository
                        .findAllByStatusAndPerfilNome(
                                StatusUsuario.ATIVO,
                                "GESTOR"
                        );

        for (Usuario gestor : gestores) {
            destinatarios.put(
                    gestor.getId(),
                    gestor
            );
        }

        return List.copyOf(
                destinatarios.values()
        );
    }
}