package com.pulseapi.integration.domino.monitoring;

import com.pulseapi.integration.domino.dto.DominoStatusResponse;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import com.pulseapi.integration.domino.parser.DominoStatusMap;
import java.util.Set;

@Component
public class DominoStatusStateTracker {

    private final ConcurrentMap<StatusKey, ActiveStatus> activeStatuses =
            new ConcurrentHashMap<>();

    public DominoStatusStateChange processar(
            Long equipamentoId,
            DominoStatusResponse atual
    ) {
        String codigo = atual.codigoStatus();
        char categoria = codigo.charAt(0);
        String familia = codigo.substring(1);

        StatusKey key = new StatusKey(
                equipamentoId,
                atual.jato(),
                familia
        );

        if (categoria == '0') {
            Set<String> familias =
                    DominoStatusMap.familiasNormalizadas(codigo);

            if (familias.isEmpty()) {
                familias = Set.of(familia);
            }

            ActiveStatus primeiroRemovido = null;
            long quantidade = 1;

            for (String familiaNormalizada : familias) {
                StatusKey chaveNormalizada =
                        new StatusKey(
                                equipamentoId,
                                atual.jato(),
                                familiaNormalizada
                        );

                ActiveStatus removido =
                        activeStatuses.remove(chaveNormalizada);

                if (removido != null) {
                    if (primeiroRemovido == null) {
                        primeiroRemovido = removido;
                    }

                    quantidade = Math.max(
                            quantidade,
                            removido.quantidadeRecebimentos()
                    );
                }
            }

            if (primeiroRemovido == null) {
                return new DominoStatusStateChange(
                        DominoStatusTransition.STATUS_INFORMATIVO,
                        atual,
                        null,
                        1
                );
            }

            return new DominoStatusStateChange(
                    DominoStatusTransition.NORMALIZADA,
                    atual,
                    primeiroRemovido.status(),
                    quantidade
            );
        }

        if (categoria != '1' && categoria != '2') {
            return new DominoStatusStateChange(
                    DominoStatusTransition.STATUS_INFORMATIVO,
                    atual,
                    null,
                    1
            );
        }

        ChangeHolder holder = new ChangeHolder();

        activeStatuses.compute(key, (ignored, existente) -> {
            LocalDateTime agora = LocalDateTime.now();

            if (existente == null) {
                holder.change = new DominoStatusStateChange(
                        DominoStatusTransition.NOVA_FALHA,
                        atual,
                        null,
                        1
                );

                return new ActiveStatus(
                        atual,
                        agora,
                        agora,
                        1
                );
            }

            long quantidade =
                    existente.quantidadeRecebimentos() + 1;

            DominoStatusTransition transition =
                    existente.status()
                            .codigoStatus()
                            .equals(codigo)
                            ? DominoStatusTransition.FALHA_REPETIDA
                            : DominoStatusTransition.FALHA_ATUALIZADA;

            holder.change = new DominoStatusStateChange(
                    transition,
                    atual,
                    existente.status(),
                    quantidade
            );

            return new ActiveStatus(
                    atual,
                    existente.detectadoEm(),
                    agora,
                    quantidade
            );
        });

        return holder.change;
    }

    public void limparEquipamento(Long equipamentoId) {
        activeStatuses.keySet().removeIf(
                key -> key.equipamentoId().equals(equipamentoId)
        );
    }

    private record StatusKey(
            Long equipamentoId,
            int jato,
            String familia
    ) {
    }

    private record ActiveStatus(
            DominoStatusResponse status,
            LocalDateTime detectadoEm,
            LocalDateTime recebidoEm,
            long quantidadeRecebimentos
    ) {
    }

    private static class ChangeHolder {
        private DominoStatusStateChange change;
    }
}