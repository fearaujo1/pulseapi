package com.pulseapi.service;

import com.pulseapi.entity.equipamento.Equipamento;
import com.pulseapi.entity.linha.Linha;
import com.pulseapi.entity.linha.LinhaUsuario;
import com.pulseapi.entity.linha.PapelNaLinha;
import com.pulseapi.entity.usuario.Perfil;
import com.pulseapi.entity.usuario.StatusUsuario;
import com.pulseapi.entity.usuario.Usuario;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.EquipamentoRepository;
import com.pulseapi.repository.LinhaUsuarioRepository;
import com.pulseapi.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OcorrenciaDestinatarioServiceTest {

    @Mock
    private EquipamentoRepository equipamentoRepository;

    @Mock
    private LinhaUsuarioRepository linhaUsuarioRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    private OcorrenciaDestinatarioService service;

    @BeforeEach
    void setUp() {
        service = new OcorrenciaDestinatarioService(
                equipamentoRepository,
                linhaUsuarioRepository,
                usuarioRepository
        );
    }

    @Test
    void deveBuscarResponsaveisDaLinhaEGestores() {
        Linha linha = Linha.builder()
                .id(1L)
                .nome("Linha 01")
                .build();

        Equipamento equipamento =
                Equipamento.builder()
                        .id(2L)
                        .nome("Domino Ax150i")
                        .linha(linha)
                        .build();

        Usuario operador = criarUsuario(
                7L,
                "Samuel",
                "OPERADOR"
        );

        Usuario supervisor = criarUsuario(
                9L,
                "Lucas",
                "SUPERVISOR"
        );

        Usuario gestor = criarUsuario(
                3L,
                "Gestor",
                "GESTOR"
        );

        LinhaUsuario vinculoOperador =
                LinhaUsuario.builder()
                        .id(1L)
                        .linha(linha)
                        .usuario(operador)
                        .papelNaLinha(
                                PapelNaLinha.OPERADOR
                        )
                        .build();

        LinhaUsuario vinculoSupervisor =
                LinhaUsuario.builder()
                        .id(2L)
                        .linha(linha)
                        .usuario(supervisor)
                        .papelNaLinha(
                                PapelNaLinha.SUPERVISOR
                        )
                        .build();

        when(equipamentoRepository.findById(2L))
                .thenReturn(
                        Optional.of(equipamento)
                );

        when(linhaUsuarioRepository
                .findAllByLinhaIdAndUsuarioStatus(
                        1L,
                        StatusUsuario.ATIVO
                ))
                .thenReturn(
                        List.of(
                                vinculoOperador,
                                vinculoSupervisor
                        )
                );

        when(usuarioRepository
                .findAllByStatusAndPerfilNome(
                        StatusUsuario.ATIVO,
                        "GESTOR"
                ))
                .thenReturn(List.of(gestor));

        List<Usuario> resultado =
                service.buscarPorEquipamento(2L);

        List<Long> ids = resultado.stream()
                .map(Usuario::getId)
                .toList();

        assertEquals(
                List.of(7L, 9L, 3L),
                ids
        );
    }

    @Test
    void deveNotificarSomenteGestoresQuandoEquipamentoNaoTemLinha() {
        Equipamento equipamento =
                Equipamento.builder()
                        .id(2L)
                        .nome("Equipamento sem linha")
                        .linha(null)
                        .build();

        Usuario gestor = criarUsuario(
                3L,
                "Gestor",
                "GESTOR"
        );

        when(equipamentoRepository.findById(2L))
                .thenReturn(
                        Optional.of(equipamento)
                );

        when(usuarioRepository
                .findAllByStatusAndPerfilNome(
                        StatusUsuario.ATIVO,
                        "GESTOR"
                ))
                .thenReturn(List.of(gestor));

        List<Usuario> resultado =
                service.buscarPorEquipamento(2L);

        assertEquals(1, resultado.size());
        assertEquals(
                3L,
                resultado.getFirst().getId()
        );

        verify(
                linhaUsuarioRepository,
                never()
        ).findAllByLinhaIdAndUsuarioStatus(
                anyLong(),
                any()
        );
    }

    @Test
    void naoDeveIncluirVinculoComPerfilAlteradoParaAdmin() {
        Linha linha = Linha.builder()
                .id(1L)
                .build();

        Equipamento equipamento =
                Equipamento.builder()
                        .id(2L)
                        .linha(linha)
                        .build();

        Usuario administrador = criarUsuario(
                1L,
                "Administrador",
                "ADMIN"
        );

        LinhaUsuario vinculoAntigo =
                LinhaUsuario.builder()
                        .id(5L)
                        .linha(linha)
                        .usuario(administrador)
                        .papelNaLinha(
                                PapelNaLinha.OPERADOR
                        )
                        .build();

        when(equipamentoRepository.findById(2L))
                .thenReturn(
                        Optional.of(equipamento)
                );

        when(linhaUsuarioRepository
                .findAllByLinhaIdAndUsuarioStatus(
                        1L,
                        StatusUsuario.ATIVO
                ))
                .thenReturn(
                        List.of(vinculoAntigo)
                );

        when(usuarioRepository
                .findAllByStatusAndPerfilNome(
                        StatusUsuario.ATIVO,
                        "GESTOR"
                ))
                .thenReturn(List.of());

        List<Usuario> resultado =
                service.buscarPorEquipamento(2L);

        assertTrue(resultado.isEmpty());
    }

    @Test
    void deveRemoverDestinatariosDuplicados() {
        Linha linha = Linha.builder()
                .id(1L)
                .build();

        Equipamento equipamento =
                Equipamento.builder()
                        .id(2L)
                        .linha(linha)
                        .build();

        Usuario gestor = criarUsuario(
                3L,
                "Gestor",
                "GESTOR"
        );

        when(equipamentoRepository.findById(2L))
                .thenReturn(
                        Optional.of(equipamento)
                );

        when(linhaUsuarioRepository
                .findAllByLinhaIdAndUsuarioStatus(
                        1L,
                        StatusUsuario.ATIVO
                ))
                .thenReturn(List.of());

        when(usuarioRepository
                .findAllByStatusAndPerfilNome(
                        StatusUsuario.ATIVO,
                        "GESTOR"
                ))
                .thenReturn(
                        List.of(gestor, gestor)
                );

        List<Usuario> resultado =
                service.buscarPorEquipamento(2L);

        assertEquals(1, resultado.size());
    }

    @Test
    void deveFalharQuandoEquipamentoNaoExiste() {
        when(equipamentoRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> service.buscarPorEquipamento(99L)
        );
    }

    private Usuario criarUsuario(
            Long id,
            String nome,
            String perfilNome
    ) {
        Perfil perfil = Perfil.builder()
                .nome(perfilNome)
                .build();

        return Usuario.builder()
                .id(id)
                .nome(nome)
                .status(StatusUsuario.ATIVO)
                .perfil(perfil)
                .build();
    }
}