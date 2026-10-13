package com.pulseapi.integration.domino.service;

import com.pulseapi.entity.equipamento.Equipamento;
import com.pulseapi.entity.equipamento.StatusConexaoEquipamento;
import com.pulseapi.event.DashboardAtualizadoEvent;
import com.pulseapi.event.EquipamentoDesconectadoEvent;
import com.pulseapi.repository.EquipamentoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class DominoConnectionStatusService {

    private final EquipamentoRepository equipamentoRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final int limiteFalhasConsecutivas;

    private final ConcurrentMap<Long, Integer> falhasConsecutivas =
            new ConcurrentHashMap<>();

    public DominoConnectionStatusService(
            EquipamentoRepository equipamentoRepository,
            ApplicationEventPublisher eventPublisher,
            @Value(
                    "${pulseapi.domino.limite-falhas-consecutivas:3}"
            )
            int limiteFalhasConsecutivas
    ) {
        if (limiteFalhasConsecutivas < 1) {
            throw new IllegalArgumentException(
                    "O limite de falhas consecutivas deve ser maior que zero."
            );
        }

        this.equipamentoRepository = equipamentoRepository;
        this.eventPublisher = eventPublisher;
        this.limiteFalhasConsecutivas =
                limiteFalhasConsecutivas;
    }

    @Transactional
    public void registrarConexao(Long equipamentoId) {
        falhasConsecutivas.remove(equipamentoId);

        Equipamento equipamento =
                equipamentoRepository.findById(equipamentoId)
                        .orElse(null);

        if (equipamento == null) {
            return;
        }

        /*
         * Se já estava conectado, não existe mudança de estado.
         * Isso evita gravações no banco e mensagens WebSocket
         * desnecessárias em cada comando enviado à impressora.
         */
        if (equipamento.getStatusConexao()
                == StatusConexaoEquipamento.CONECTADO) {
            return;
        }

        LocalDateTime agora = LocalDateTime.now();

        equipamento.setStatusConexao(
                StatusConexaoEquipamento.CONECTADO
        );

        equipamento.setUltimaConexaoEm(agora);

        equipamentoRepository.save(equipamento);

        publicarAtualizacaoDashboard(
                "EQUIPAMENTO_CONECTADO",
                equipamento.getId()
        );

        /*
         * A produção não deve ser retomada automaticamente.
         * O operador deverá solicitar a retomada, momento em
         * que a conexão e o estado da impressora serão validados.
         */
    }

    @Transactional
    public void registrarDesconexao(Long equipamentoId) {
        int quantidadeFalhas =
                falhasConsecutivas.merge(
                        equipamentoId,
                        1,
                        Integer::sum
                );

        /*
         * Um único timeout não representa necessariamente
         * a perda definitiva da conexão.
         */
        if (quantidadeFalhas < limiteFalhasConsecutivas) {
            return;
        }

        Equipamento equipamento =
                equipamentoRepository.findById(equipamentoId)
                        .orElse(null);

        if (equipamento == null) {
            falhasConsecutivas.remove(equipamentoId);
            return;
        }

        /*
         * Os eventos são publicados somente durante a transição
         * para SEM_CONEXAO. Dessa forma, novas falhas não criam
         * pausas, ocorrências e notificações duplicadas.
         */
        if (equipamento.getStatusConexao()
                == StatusConexaoEquipamento.SEM_CONEXAO) {
            return;
        }

        LocalDateTime agora = LocalDateTime.now();

        equipamento.setStatusConexao(
                StatusConexaoEquipamento.SEM_CONEXAO
        );

        equipamento.setUltimaFalhaConexaoEm(agora);

        equipamentoRepository.save(equipamento);

        publicarAtualizacaoDashboard(
                "EQUIPAMENTO_SEM_CONEXAO",
                equipamento.getId()
        );

        /*
         * Este evento será tratado pelo listener responsável por:
         *
         * - pausar a produção;
         * - registrar a ocorrência;
         * - gerar a notificação.
         */
        eventPublisher.publishEvent(
                new EquipamentoDesconectadoEvent(
                        equipamento.getId(),
                        equipamento.getNome(),
                        agora
                )
        );
    }

    private void publicarAtualizacaoDashboard(
            String tipo,
            Long recursoId
    ) {
        eventPublisher.publishEvent(
                DashboardAtualizadoEvent.criar(
                        tipo,
                        recursoId
                )
        );
    }
}