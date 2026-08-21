package com.pulseapi.service;

import com.pulseapi.dto.notificacao.NotificacaoContextoDTO;
import com.pulseapi.dto.notificacao.NotificacaoResponseDTO;
import com.pulseapi.entity.*;
import com.pulseapi.exception.ResourceNotFoundException;
import com.pulseapi.repository.NotificacaoRepository;
import com.pulseapi.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ConfiguracaoNotificacaoService configuracaoNotificacaoService;

    public NotificacaoService(
            NotificacaoRepository notificacaoRepository,
            UsuarioRepository usuarioRepository,
            ConfiguracaoNotificacaoService configuracaoNotificacaoService
    ) {
        this.notificacaoRepository = notificacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.configuracaoNotificacaoService = configuracaoNotificacaoService;
    }

    @Transactional
    public void notificar(
            TipoNotificacao tipo,
            String titulo,
            String mensagem,
            NotificacaoContextoDTO contexto
    ) {

        ConfiguracaoNotificacao configuracao =
                configuracaoNotificacaoService.buscarPorTipo(tipo);

        if (!Boolean.TRUE.equals(configuracao.getNotificacaoSistemaAtiva())) {
            return;
        }

        NivelNotificacao nivel = definirNivel(tipo);

        List<Usuario> destinatarios = buscarDestinatarios(tipo);

        for (Usuario usuario : destinatarios) {

            Notificacao notificacao =
                    Notificacao.builder()
                            .tipo(tipo)
                            .nivel(nivel)
                            .titulo(titulo)
                            .mensagem(mensagem)
                            .lida(false)
                            .equipamentoId(contexto != null ? contexto.equipamentoId() : null)
                            .ocorrenciaId(contexto != null ? contexto.ocorrenciaId() : null)
                            .producaoId(contexto != null ? contexto.producaoId() : null)
                            .filaImpressaoId(contexto != null ? contexto.filaImpressaoId() : null)
                            .usuario(usuario)
                            .build();

            notificacaoRepository.save(notificacao);
        }

        /*
         * Próxima etapa:
         *
         * if (configuracao.getNotificacaoEmailAtiva()) {
         *     emailService.enviar(...);
         * }
         */
    }

    // =========================================================
    // DESTINATÁRIOS
    // =========================================================

    private List<Usuario> buscarDestinatarios(TipoNotificacao tipo) {
        /*
         * V1:
         * ADMIN, GESTOR e SUPERVISOR recebem
         * notificações operacionais.
         *
         * OPERADOR será refinado depois por linha.
         */

        return usuarioRepository.findAll()
                .stream()
                .filter(usuario ->
                        usuario.getStatus() == StatusUsuario.ATIVO
                )
                .filter(usuario -> {

                    String perfil =
                            usuario.getPerfil().getNome();

                    return perfil.equals("ADMIN")
                            || perfil.equals("GESTOR")
                            || perfil.equals("SUPERVISOR");
                })
                .toList();
    }

    // =========================================================
    // NÍVEL
    // =========================================================

    private NivelNotificacao definirNivel(TipoNotificacao tipo) {
        return switch(tipo) {
            case PRODUCAO_INICIADA,
                 PRODUCAO_CONCLUIDA,
                 EQUIPAMENTO_RECONECTADO,
                 IMPRESSAO_CONCLUIDA
                    -> NivelNotificacao.INFORMATIVA;

            case NOVA_OCORRENCIA,
                 ERRO_IMPRESSAO
                    -> NivelNotificacao.ATENCAO;

            case OCORRENCIA_CRITICA,
                 EQUIPAMENTO_SEM_CONEXAO
                    -> NivelNotificacao.CRITICA;
        };
    }

    // =========================================================
    // CONSULTAS
    // =========================================================

    public List<NotificacaoResponseDTO> listarPorUsuario(Long usuarioId) {
        return notificacaoRepository
                .findByUsuarioIdOrderByCriadoEmDesc(usuarioId)
                .stream()
                .map(this::converter)
                .toList();
    }

    public List<NotificacaoResponseDTO> listarNaoLidas(Long usuarioId) {
        return notificacaoRepository
                .findByUsuarioIdAndLidaFalseOrderByCriadoEmDesc(usuarioId)
                .stream()
                .map(this::converter)
                .toList();
    }

    public long contarNaoLidas(Long usuarioId) {
        return notificacaoRepository.countByUsuarioIdAndLidaFalse(usuarioId);
    }

    // =========================================================
    // MARCAR COMO LIDA
    // =========================================================

    @Transactional
    public NotificacaoResponseDTO marcarComoLida(Long notificacaoId, Long usuarioId) {
        Notificacao notificacao =
                notificacaoRepository.findById(notificacaoId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Notificação não encontrada.")
                        );

        if (!notificacao.getUsuario().getId().equals(usuarioId)) {
            throw new ResourceNotFoundException("Notificação não encontrada.");
        }

        notificacao.setLida(true);

        return converter(notificacaoRepository.save(notificacao));
    }

        // =========================================================
        // DTO
        // =========================================================

        private NotificacaoResponseDTO converter(
                Notificacao notificacao
    ) {

        return new NotificacaoResponseDTO(
                notificacao.getId(),
                notificacao.getTipo(),
                notificacao.getNivel(),
                notificacao.getTitulo(),
                notificacao.getMensagem(),
                notificacao.getLida(),
                notificacao.getEquipamentoId(),
                notificacao.getOcorrenciaId(),
                notificacao.getProducaoId(),
                notificacao.getFilaImpressaoId(),
                notificacao.getCriadoEm()
        );
    }
}

