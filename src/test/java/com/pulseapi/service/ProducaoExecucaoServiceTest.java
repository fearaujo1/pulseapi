package com.pulseapi.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pulseapi.dto.producao.CancelarProducaoRequestDTO;
import com.pulseapi.entity.equipamento.Equipamento;
import com.pulseapi.entity.impressao.EtapaFilaProducao;
import com.pulseapi.entity.impressao.FilaImpressao;
import com.pulseapi.entity.impressao.LayoutImpressao;
import com.pulseapi.entity.impressao.StatusFilaImpressao;
import com.pulseapi.entity.producao.Producao;
import com.pulseapi.entity.producao.ProducaoItem;
import com.pulseapi.entity.producao.StatusProducao;
import com.pulseapi.entity.producao.StatusProducaoItem;
import com.pulseapi.event.ProducaoIniciadaEvent;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.integration.domino.service.DominoService;
import com.pulseapi.repository.FilaImpressaoRepository;
import com.pulseapi.repository.ProducaoItemRepository;
import com.pulseapi.repository.ProducaoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProducaoExecucaoServiceTest {

    private static final Long PRODUCAO_ID = 1L;
    private static final Long EQUIPAMENTO_ID = 10L;

    @Mock
    private ProducaoRepository producaoRepository;

    @Mock
    private ProducaoItemRepository itemRepository;

    @Mock
    private FilaImpressaoRepository filaRepository;

    @Mock
    private PayloadMontadorService payloadMontadorService;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private DominoService dominoService;

    private ProducaoExecucaoService service;

    @BeforeEach
    void setUp() {
        service =
                new ProducaoExecucaoService(
                        producaoRepository,
                        itemRepository,
                        filaRepository,
                        payloadMontadorService,
                        objectMapper,
                        eventPublisher,
                        50,
                        dominoService
                );
    }

    @Test
    void deveIniciarProducaoPronta() {
        Equipamento equipamento =
                criarEquipamentoValido();

        LayoutImpressao layout =
                criarLayoutAtivo();

        Producao producao =
                criarProducao(
                        StatusProducao.PRONTA,
                        equipamento
                );

        producao.setLayoutPrincipal(layout);
        producao.setQuantidadeTotal(2L);

        when(
                producaoRepository
                        .buscarPorIdParaAtualizacao(
                                PRODUCAO_ID
                        )
        ).thenReturn(
                Optional.of(producao)
        );

        when(
                itemRepository.countByProducaoId(
                        PRODUCAO_ID
                )
        ).thenReturn(2L);

        when(
                filaRepository
                        .existsByEquipamentoIdAndStatusIn(
                                eq(EQUIPAMENTO_ID),
                                anyCollection()
                        )
        ).thenReturn(false);

        when(
                filaRepository
                        .findAllByProducaoItemProducaoIdAndStatusInOrderByOrdemFilaAsc(
                                eq(PRODUCAO_ID),
                                anyCollection()
                        )
        ).thenReturn(List.of());

        when(
                itemRepository
                        .findTop2ByProducaoIdAndStatusOrderBySequenciaAsc(
                                PRODUCAO_ID,
                                StatusProducaoItem.AGUARDANDO
                        )
        ).thenReturn(List.of());

        var resposta =
                service.iniciar(
                        PRODUCAO_ID
                );

        assertEquals(
                StatusProducao.EM_ANDAMENTO,
                producao.getStatus()
        );

        assertNotNull(
                producao.getIniciadaEm()
        );

        assertEquals(
                StatusProducao.EM_ANDAMENTO,
                resposta.status()
        );

        verify(producaoRepository)
                .saveAndFlush(producao);

        verify(eventPublisher)
                .publishEvent(
                        any(
                                ProducaoIniciadaEvent.class
                        )
                );
    }

    @Test
    void devePausarProducaoEmAndamento() {
        Equipamento equipamento =
                criarEquipamentoValido();

        Producao producao =
                criarProducao(
                        StatusProducao.EM_ANDAMENTO,
                        equipamento
                );

        when(
                producaoRepository
                        .buscarPorIdParaAtualizacao(
                                PRODUCAO_ID
                        )
        ).thenReturn(
                Optional.of(producao)
        );

        when(
                filaRepository
                        .findAllByProducaoItemProducaoIdAndStatusInOrderByOrdemFilaAsc(
                                eq(PRODUCAO_ID),
                                anyCollection()
                        )
        ).thenReturn(List.of());

        var resposta =
                service.pausar(
                        PRODUCAO_ID
                );

        assertEquals(
                StatusProducao.PAUSADA,
                producao.getStatus()
        );

        assertEquals(
                StatusProducao.EM_ANDAMENTO,
                producao.getStatusAntesPausa()
        );

        assertEquals(
                StatusProducao.PAUSADA,
                resposta.status()
        );

        verify(dominoService)
                .desabilitarCabecote(
                        equipamento
                );

        verify(dominoService)
                .limparFifo(
                        equipamento
                );

        verify(producaoRepository)
                .save(producao);
    }

    @Test
    void deveRetomarProducaoPausada() {
        Equipamento equipamento =
                criarEquipamentoValido();

        Producao producao =
                criarProducao(
                        StatusProducao.PAUSADA,
                        equipamento
                );

        producao.setStatusAntesPausa(
                StatusProducao.EM_ANDAMENTO
        );

        when(
                producaoRepository
                        .buscarPorIdParaAtualizacao(
                                PRODUCAO_ID
                        )
        ).thenReturn(
                Optional.of(producao)
        );

        /*
         * Mantém a produção em execução durante a verificação
         * de término feita pelo método retomar().
         */
        when(
                itemRepository
                        .countByProducaoIdAndStatusIn(
                                eq(PRODUCAO_ID),
                                anyCollection()
                        )
        ).thenReturn(1L);

        var resposta =
                service.retomar(
                        PRODUCAO_ID
                );

        assertEquals(
                StatusProducao.EM_ANDAMENTO,
                producao.getStatus()
        );

        assertEquals(
                null,
                producao.getStatusAntesPausa()
        );

        assertEquals(
                StatusProducao.EM_ANDAMENTO,
                resposta.status()
        );

        verify(producaoRepository)
                .saveAndFlush(producao);

        verify(eventPublisher)
                .publishEvent(
                        any(
                                ProducaoIniciadaEvent.class
                        )
                );
    }

    @Test
    void deveCancelarProducaoPausada() {
        Equipamento equipamento =
                criarEquipamentoValido();

        Producao producao =
                criarProducao(
                        StatusProducao.PAUSADA,
                        equipamento
                );

        ProducaoItem item =
                org.mockito.Mockito.mock(
                        ProducaoItem.class
                );

        CancelarProducaoRequestDTO dto =
                org.mockito.Mockito.mock(
                        CancelarProducaoRequestDTO.class
                );

        when(dto.motivo())
                .thenReturn(
                        "Cancelamento para teste"
                );

        when(
                producaoRepository
                        .buscarPorIdParaAtualizacao(
                                PRODUCAO_ID
                        )
        ).thenReturn(
                Optional.of(producao)
        );

        when(
                filaRepository
                        .existsByProducaoItemProducaoIdAndStatusIn(
                                eq(PRODUCAO_ID),
                                anyCollection()
                        )
        ).thenReturn(false);

        when(
                filaRepository
                        .findAllByProducaoItemProducaoIdAndStatusInOrderByOrdemFilaAsc(
                                eq(PRODUCAO_ID),
                                anyCollection()
                        )
        ).thenReturn(List.of());

        when(
                itemRepository
                        .findAllByProducaoIdOrderBySequenciaAsc(
                                PRODUCAO_ID
                        )
        ).thenReturn(
                List.of(item)
        );

        when(item.getStatus())
                .thenReturn(
                        StatusProducaoItem.AGUARDANDO
                );

        var resposta =
                service.cancelar(
                        PRODUCAO_ID,
                        dto
                );

        assertEquals(
                StatusProducao.CANCELADA,
                producao.getStatus()
        );

        assertNotNull(
                producao.getCanceladaEm()
        );

        assertEquals(
                "Cancelamento para teste",
                producao.getMotivoCancelamento()
        );

        assertEquals(
                StatusProducao.CANCELADA,
                resposta.status()
        );

        verify(item).setStatus(
                StatusProducaoItem.CANCELADO
        );

        verify(producaoRepository)
                .save(producao);
    }

    @Test
    void naoDeveCancelarProducaoEmAndamento() {
        Equipamento equipamento =
                criarEquipamentoValido();

        Producao producao =
                criarProducao(
                        StatusProducao.EM_ANDAMENTO,
                        equipamento
                );

        CancelarProducaoRequestDTO dto =
                org.mockito.Mockito.mock(
                        CancelarProducaoRequestDTO.class
                );

        when(
                producaoRepository
                        .buscarPorIdParaAtualizacao(
                                PRODUCAO_ID
                        )
        ).thenReturn(
                Optional.of(producao)
        );

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () ->
                                service.cancelar(
                                        PRODUCAO_ID,
                                        dto
                                )
                );

        assertEquals(
                "A produção não pode ser cancelada no estado atual. "
                        + "Se ela estiver sendo executada, pause-a primeiro.",
                exception.getMessage()
        );

        verify(producaoRepository, never())
                .save(any(Producao.class));

        verify(dominoService, never())
                .limparFifo(
                        any(Equipamento.class)
                );
    }

    @Test
    void deveFinalizarEtapaPrincipalAposUltimaImpressao() {
        Equipamento equipamento =
                criarEquipamentoValido();

        Producao producao =
                criarProducao(
                        StatusProducao.EM_ANDAMENTO,
                        equipamento
                );

        ProducaoItem item =
                org.mockito.Mockito.mock(
                        ProducaoItem.class
                );

        FilaImpressao fila =
                org.mockito.Mockito.mock(
                        FilaImpressao.class
                );

        LocalDateTime impressoEm =
                LocalDateTime.now();

        when(fila.getProducaoItem())
                .thenReturn(item);

        when(fila.getEtapaProducao())
                .thenReturn(
                        EtapaFilaProducao.PRINCIPAL
                );

        when(fila.getImpressoEm())
                .thenReturn(impressoEm);

        when(item.getProducao())
                .thenReturn(producao);

        when(item.getStatus())
                .thenReturn(
                        StatusProducaoItem.EM_IMPRESSAO
                );

        when(
                filaRepository
                        .countByProducaoItemProducaoIdAndEtapaProducaoAndStatusIn(
                                eq(PRODUCAO_ID),
                                eq(
                                        EtapaFilaProducao.PRINCIPAL
                                ),
                                anyCollection()
                        )
        ).thenReturn(0L);

        when(
                itemRepository
                        .countByProducaoIdAndStatusIn(
                                eq(PRODUCAO_ID),
                                anyCollection()
                        )
        ).thenReturn(0L);

        service.registrarImpressaoConfirmada(
                fila
        );

        verify(item).setStatus(
                StatusProducaoItem
                        .AGUARDANDO_VALIDACAO
        );

        verify(item).setImpressoEm(
                impressoEm
        );

        assertEquals(
                StatusProducao.AGUARDANDO_AVALIACAO,
                producao.getStatus()
        );

        verify(dominoService)
                .desabilitarCabecote(
                        equipamento
                );

        verify(dominoService)
                .limparFifo(
                        equipamento
                );

        verify(producaoRepository)
                .save(producao);
    }

    @Test
    void deveConcluirAvaliacaoSemRetrabalho() {
        Equipamento equipamento =
                criarEquipamentoValido();

        Producao producao =
                criarProducao(
                        StatusProducao.AGUARDANDO_AVALIACAO,
                        equipamento
                );

        when(
                producaoRepository
                        .buscarPorIdParaAtualizacao(
                                PRODUCAO_ID
                        )
        ).thenReturn(
                Optional.of(producao)
        );

        when(
                itemRepository
                        .atualizarStatusEmLote(
                                PRODUCAO_ID,
                                StatusProducaoItem
                                        .AGUARDANDO_VALIDACAO,
                                StatusProducaoItem
                                        .CONCLUIDO
                        )
        ).thenReturn(3);

        when(
                itemRepository
                        .countByProducaoIdAndStatus(
                                PRODUCAO_ID,
                                StatusProducaoItem
                                        .AGUARDANDO_RETRABALHO
                        )
        ).thenReturn(0L);

        var resposta =
                service.finalizarAvaliacao(
                        PRODUCAO_ID
                );

        assertEquals(
                StatusProducao.CONCLUIDA,
                producao.getStatus()
        );

        assertNotNull(
                producao.getConcluidaEm()
        );

        assertEquals(
                StatusProducao.CONCLUIDA,
                resposta.status()
        );

        assertEquals(
                3,
                resposta.quantidadeAprovada()
        );

        verify(producaoRepository)
                .save(producao);
    }

    @Test
    void deveIniciarRetrabalhoAposAvaliacao() {
        Equipamento equipamentoPrincipal =
                criarEquipamentoValido();

        Equipamento equipamentoRetrabalho =
                criarEquipamentoValido();

        when(equipamentoRetrabalho.getId())
                .thenReturn(20L);

        LayoutImpressao layoutRetrabalho =
                criarLayoutAtivo();

        Producao producao =
                criarProducao(
                        StatusProducao.AGUARDANDO_AVALIACAO,
                        equipamentoPrincipal
                );

        producao.setEquipamentoRetrabalho(
                equipamentoRetrabalho
        );

        producao.setLayoutRetrabalho(
                layoutRetrabalho
        );

        when(
                producaoRepository
                        .buscarPorIdParaAtualizacao(
                                PRODUCAO_ID
                        )
        ).thenReturn(
                Optional.of(producao)
        );

        when(
                itemRepository
                        .atualizarStatusEmLote(
                                PRODUCAO_ID,
                                StatusProducaoItem
                                        .AGUARDANDO_VALIDACAO,
                                StatusProducaoItem
                                        .CONCLUIDO
                        )
        ).thenReturn(2);

        when(
                itemRepository
                        .countByProducaoIdAndStatus(
                                PRODUCAO_ID,
                                StatusProducaoItem
                                        .AGUARDANDO_RETRABALHO
                        )
        ).thenReturn(1L);

        when(
                filaRepository
                        .existsByEquipamentoIdAndStatusIn(
                                eq(20L),
                                anyCollection()
                        )
        ).thenReturn(false);

        var resposta =
                service.finalizarAvaliacao(
                        PRODUCAO_ID
                );

        assertEquals(
                StatusProducao.EM_RETRABALHO,
                producao.getStatus()
        );

        assertEquals(
                StatusProducao.EM_RETRABALHO,
                resposta.status()
        );

        assertEquals(
                1L,
                resposta.quantidadeRetrabalho()
        );

        verify(producaoRepository)
                .saveAndFlush(producao);

        verify(eventPublisher)
                .publishEvent(
                        any(
                                ProducaoIniciadaEvent.class
                        )
                );
    }

    @Test
    void deveFinalizarEtapaDeRetrabalhoAposUltimaImpressao() {
        Equipamento equipamentoPrincipal =
                criarEquipamentoValido();

        Equipamento equipamentoRetrabalho =
                criarEquipamentoValido();

        when(equipamentoRetrabalho.getId())
                .thenReturn(20L);

        Producao producao =
                criarProducao(
                        StatusProducao.EM_RETRABALHO,
                        equipamentoPrincipal
                );

        producao.setEquipamentoRetrabalho(
                equipamentoRetrabalho
        );

        ProducaoItem item =
                org.mockito.Mockito.mock(
                        ProducaoItem.class
                );

        FilaImpressao fila =
                org.mockito.Mockito.mock(
                        FilaImpressao.class
                );

        LocalDateTime impressoEm =
                LocalDateTime.now();

        when(fila.getProducaoItem())
                .thenReturn(item);

        when(fila.getEtapaProducao())
                .thenReturn(
                        EtapaFilaProducao.RETRABALHO
                );

        when(fila.getImpressoEm())
                .thenReturn(impressoEm);

        when(item.getProducao())
                .thenReturn(producao);

        when(item.getStatus())
                .thenReturn(
                        StatusProducaoItem.EM_RETRABALHO
                );

        when(
                filaRepository
                        .countByProducaoItemProducaoIdAndEtapaProducaoAndStatusIn(
                                eq(PRODUCAO_ID),
                                eq(
                                        EtapaFilaProducao.RETRABALHO
                                ),
                                anyCollection()
                        )
        ).thenReturn(0L);

        when(
                itemRepository
                        .countByProducaoIdAndStatusIn(
                                eq(PRODUCAO_ID),
                                anyCollection()
                        )
        ).thenReturn(0L);

        service.registrarImpressaoConfirmada(
                fila
        );

        verify(item).setStatus(
                StatusProducaoItem
                        .AGUARDANDO_VALIDACAO
        );

        assertEquals(
                StatusProducao.AGUARDANDO_AVALIACAO,
                producao.getStatus()
        );

        verify(dominoService)
                .desabilitarCabecote(
                        equipamentoRetrabalho
                );

        verify(dominoService)
                .limparFifo(
                        equipamentoRetrabalho
                );

        verify(producaoRepository)
                .save(producao);
    }

    private Producao criarProducao(
            StatusProducao status,
            Equipamento equipamentoPrincipal
    ) {
        Producao producao =
                new Producao();

        producao.setId(PRODUCAO_ID);
        producao.setStatus(status);
        producao.setEquipamentoPrincipal(
                equipamentoPrincipal
        );

        return producao;
    }

    private Equipamento criarEquipamentoValido() {
        Equipamento equipamento =
                org.mockito.Mockito.mock(
                        Equipamento.class
                );

        when(equipamento.getId())
                .thenReturn(
                        EQUIPAMENTO_ID
                );

        when(equipamento.getIp())
                .thenReturn(
                        "192.168.0.32"
                );

        when(equipamento.getPorta())
                .thenReturn(9100);

        when(equipamento.getProtocolo())
                .thenReturn(
                        "CODENET"
                );

        return equipamento;
    }

    private LayoutImpressao criarLayoutAtivo() {
        LayoutImpressao layout =
                org.mockito.Mockito.mock(
                        LayoutImpressao.class
                );

        when(layout.getAtivo())
                .thenReturn(true);

        return layout;
    }
}