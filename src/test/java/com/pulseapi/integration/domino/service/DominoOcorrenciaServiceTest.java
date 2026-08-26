package com.pulseapi.integration.domino.service;

import com.pulseapi.entity.*;
import com.pulseapi.integration.domino.dto.DominoStatusResponse;
import com.pulseapi.repository.EquipamentoRepository;
import com.pulseapi.repository.OcorrenciaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DominoOcorrenciaServiceTest {

    @Mock
    private OcorrenciaRepository ocorrenciaRepository;

    @Mock
    private EquipamentoRepository equipamentoRepository;

    @InjectMocks
    private DominoOcorrenciaService service;

    @Test
    void deveRegistrarNovaFalhaConhecida() {
        Equipamento equipamento = Equipamento.builder()
                .id(2L)
                .nome("Simulador")
                .codigo("EQP-002")
                .build();

        DominoStatusResponse status =
                new DominoStatusResponse(
                        "205",
                        1,
                        "14:30",
                        "Nível de solvente baixo",
                        "CRITICA"
                );

        when(buscarOcorrenciaAtiva("05"))
                .thenReturn(Optional.empty());

        when(equipamentoRepository.findById(2L))
                .thenReturn(Optional.of(equipamento));

        when(ocorrenciaRepository.save(any(Ocorrencia.class)))
                .thenAnswer(invocation -> {
                    Ocorrencia ocorrencia =
                            invocation.getArgument(0);

                    ocorrencia.setId(10L);

                    return ocorrencia;
                });

        Optional<Long> resultado =
                service.registrarOuAtualizarFalha(
                        2L,
                        status
                );

        assertTrue(resultado.isPresent());
        assertEquals(10L, resultado.get());

        ArgumentCaptor<Ocorrencia> captor =
                ArgumentCaptor.forClass(Ocorrencia.class);

        verify(ocorrenciaRepository)
                .save(captor.capture());

        Ocorrencia salva = captor.getValue();

        assertEquals(
                OrigemOcorrencia.DOMINO,
                salva.getOrigem()
        );

        assertEquals(
                TipoOcorrencia.FALHA_EQUIPAMENTO,
                salva.getTipo()
        );

        assertEquals(
                StatusOcorrencia.ABERTA,
                salva.getStatus()
        );

        assertEquals("205", salva.getCodigoFalha());
        assertEquals("05", salva.getFamiliaStatus());
        assertEquals(1, salva.getJato());
        assertNotNull(salva.getDetectadoEm());
    }

    @Test
    void naoDeveDuplicarFalhaExistente() {
        Ocorrencia existente = Ocorrencia.builder()
                .id(10L)
                .origem(OrigemOcorrencia.DOMINO)
                .codigoFalha("205")
                .familiaStatus("05")
                .jato(1)
                .status(StatusOcorrencia.ABERTA)
                .build();

        DominoStatusResponse status =
                new DominoStatusResponse(
                        "205",
                        1,
                        "14:31",
                        "Nível de solvente baixo",
                        "CRITICA"
                );

        when(buscarOcorrenciaAtiva("05"))
                .thenReturn(Optional.of(existente));

        Optional<Long> resultado =
                service.registrarOuAtualizarFalha(
                        2L,
                        status
                );

        assertEquals(Optional.of(10L), resultado);

        verify(ocorrenciaRepository, never())
                .save(any());

        verifyNoInteractions(equipamentoRepository);
    }

    @Test
    void deveIgnorarCodigoDesconhecidoDoSimulador() {
        DominoStatusResponse status =
                new DominoStatusResponse(
                        "299",
                        1,
                        "14:40",
                        "Status Domino não mapeado",
                        "CRITICA"
                );

        Optional<Long> resultado =
                service.registrarOuAtualizarFalha(
                        2L,
                        status
                );

        assertTrue(resultado.isEmpty());
        verifyNoInteractions(ocorrenciaRepository);
        verifyNoInteractions(equipamentoRepository);
    }

    @SuppressWarnings("unchecked")
    private Optional<Ocorrencia> buscarOcorrenciaAtiva(
            String familia
    ) {
        return ocorrenciaRepository
                .findFirstByEquipamentoIdAndOrigemAndFamiliaStatusAndJatoAndStatusInOrderByCriadoEmDesc(
                        eq(2L),
                        eq(OrigemOcorrencia.DOMINO),
                        eq(familia),
                        eq(1),
                        any(Collection.class)
                );
    }
}