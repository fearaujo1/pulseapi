package com.pulseapi.service;

import com.pulseapi.dto.notificacao.NotificacaoContextoDTO;
import com.pulseapi.entity.configuracao.ConfiguracaoNotificacao;
import com.pulseapi.entity.notificacao.NivelNotificacao;
import com.pulseapi.entity.notificacao.Notificacao;
import com.pulseapi.entity.notificacao.TipoNotificacao;
import com.pulseapi.entity.usuario.Usuario;
import com.pulseapi.repository.NotificacaoRepository;
import com.pulseapi.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificacaoServiceTest {

    @Mock
    private NotificacaoRepository notificacaoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private ConfiguracaoNotificacaoService
            configuracaoNotificacaoService;

    @Mock
    private OcorrenciaDestinatarioService
            ocorrenciaDestinatarioService;

    private NotificacaoService service;

    @BeforeEach
    void setUp() {
        service = new NotificacaoService(
                notificacaoRepository,
                usuarioRepository,
                configuracaoNotificacaoService,
                ocorrenciaDestinatarioService
        );
    }

    @Test
    void deveCriarNotificacaoParaCadaResponsavel() {
        ConfiguracaoNotificacao configuracao =
                mock(ConfiguracaoNotificacao.class);

        Usuario operador = Usuario.builder()
                .id(7L)
                .nome("Samuel")
                .build();

        Usuario supervisor = Usuario.builder()
                .id(9L)
                .nome("Lucas")
                .build();

        NotificacaoContextoDTO contexto =
                new NotificacaoContextoDTO(
                        2L,
                        20L,
                        null,
                        null
                );

        when(configuracao
                .getNotificacaoSistemaAtiva())
                .thenReturn(true);

        when(configuracaoNotificacaoService
                .buscarPorTipo(
                        TipoNotificacao.NOVA_OCORRENCIA
                ))
                .thenReturn(configuracao);

        when(ocorrenciaDestinatarioService
                .buscarPorEquipamento(2L))
                .thenReturn(
                        List.of(
                                operador,
                                supervisor
                        )
                );

        when(notificacaoRepository
                .existsByUsuarioIdAndOcorrenciaId(
                        anyLong(),
                        eq(20L)
                ))
                .thenReturn(false);

        service.notificarResponsaveisEquipamento(
                TipoNotificacao.NOVA_OCORRENCIA,
                "Falha detectada",
                "Nível de solvente baixo.",
                contexto
        );

        ArgumentCaptor<Notificacao> captor =
                ArgumentCaptor.forClass(
                        Notificacao.class
                );

        verify(
                notificacaoRepository,
                times(2)
        ).save(captor.capture());

        List<Notificacao> notificacoes =
                captor.getAllValues();

        assertEquals(
                7L,
                notificacoes.get(0)
                        .getUsuario()
                        .getId()
        );

        assertEquals(
                9L,
                notificacoes.get(1)
                        .getUsuario()
                        .getId()
        );

        for (Notificacao notificacao : notificacoes) {
            assertEquals(
                    TipoNotificacao.NOVA_OCORRENCIA,
                    notificacao.getTipo()
            );

            assertEquals(
                    NivelNotificacao.ATENCAO,
                    notificacao.getNivel()
            );

            assertEquals(
                    2L,
                    notificacao.getEquipamentoId()
            );

            assertEquals(
                    20L,
                    notificacao.getOcorrenciaId()
            );

            assertFalse(notificacao.getLida());
        }
    }

    @Test
    void naoDeveCriarNotificacaoDuplicada() {
        ConfiguracaoNotificacao configuracao =
                mock(ConfiguracaoNotificacao.class);

        Usuario operador = Usuario.builder()
                .id(7L)
                .build();

        NotificacaoContextoDTO contexto =
                new NotificacaoContextoDTO(
                        2L,
                        20L,
                        null,
                        null
                );

        when(configuracao
                .getNotificacaoSistemaAtiva())
                .thenReturn(true);

        when(configuracaoNotificacaoService
                .buscarPorTipo(
                        TipoNotificacao.NOVA_OCORRENCIA
                ))
                .thenReturn(configuracao);

        when(ocorrenciaDestinatarioService
                .buscarPorEquipamento(2L))
                .thenReturn(List.of(operador));

        when(notificacaoRepository
                .existsByUsuarioIdAndOcorrenciaId(
                        7L,
                        20L
                ))
                .thenReturn(true);

        service.notificarResponsaveisEquipamento(
                TipoNotificacao.NOVA_OCORRENCIA,
                "Falha detectada",
                "Falha já notificada.",
                contexto
        );

        verify(
                notificacaoRepository,
                never()
        ).save(any());
    }

    @Test
    void naoDeveNotificarQuandoConfiguracaoEstaDesativada() {
        ConfiguracaoNotificacao configuracao =
                mock(ConfiguracaoNotificacao.class);

        NotificacaoContextoDTO contexto =
                new NotificacaoContextoDTO(
                        2L,
                        20L,
                        null,
                        null
                );

        when(configuracao
                .getNotificacaoSistemaAtiva())
                .thenReturn(false);

        when(configuracaoNotificacaoService
                .buscarPorTipo(
                        TipoNotificacao.NOVA_OCORRENCIA
                ))
                .thenReturn(configuracao);

        service.notificarResponsaveisEquipamento(
                TipoNotificacao.NOVA_OCORRENCIA,
                "Falha detectada",
                "Mensagem",
                contexto
        );

        verify(
                ocorrenciaDestinatarioService,
                never()
        ).buscarPorEquipamento(anyLong());

        verify(
                notificacaoRepository,
                never()
        ).save(any());
    }
}