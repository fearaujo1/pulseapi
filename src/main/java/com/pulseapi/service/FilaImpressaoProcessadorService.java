package com.pulseapi.service;

import com.pulseapi.dto.fila.ConfirmacaoImpressaoResponseDTO;
import com.pulseapi.dto.fila.ProcessamentoFilaResponseDTO;
import com.pulseapi.dto.fila.SincronizacaoFilaResponseDTO;
import com.pulseapi.entity.equipamento.Equipamento;
import com.pulseapi.entity.impressao.FilaImpressao;
import com.pulseapi.entity.impressao.StatusFilaImpressao;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.integration.domino.dto.DominoFifoCountResponse;
import com.pulseapi.integration.domino.dto.DominoLayoutOnlineResponse;
import com.pulseapi.integration.domino.service.DominoService;
import com.pulseapi.repository.FilaImpressaoRepository;
import org.springframework.stereotype.Service;
import com.pulseapi.integration.domino.dto.DominoProductCountResponse;
import java.time.LocalDateTime;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import java.util.ArrayList;
import java.util.List;

@Service
public class FilaImpressaoProcessadorService {

    private final FilaImpressaoRepository filaRepository;
    private final DominoService dominoService;
    private final ProducaoExecucaoService producaoExecucaoService;
    private final int capacidadeBuffer;
    private final int nivelReposicao;

    public FilaImpressaoProcessadorService(
            FilaImpressaoRepository filaRepository,
            DominoService dominoService,
            ProducaoExecucaoService producaoExecucaoService,
            @Value(
                    "${pulseapi.fila-impressao.capacidade-buffer:50}"
            )
            int capacidadeBuffer,
            @Value(
                    "${pulseapi.fila-impressao.nivel-reposicao:20}"
            )
            int nivelReposicao
    ) {
        if (capacidadeBuffer < 1
                || capacidadeBuffer > 4096) {
            throw new IllegalArgumentException(
                    "A capacidade do buffer deve estar "
                            + "entre 1 e 4096."
            );
        }

        if (nivelReposicao < 0
                || nivelReposicao >= capacidadeBuffer) {
            throw new IllegalArgumentException(
                    "O nível de reposição deve ser maior "
                            + "ou igual a zero e menor que "
                            + "a capacidade do buffer."
            );
        }

        this.filaRepository = filaRepository;
        this.dominoService = dominoService;
        this.producaoExecucaoService =
                producaoExecucaoService;
        this.capacidadeBuffer = capacidadeBuffer;
        this.nivelReposicao = nivelReposicao;
    }

    @Transactional
    public ProcessamentoFilaResponseDTO processarProximo(
            Long equipamentoId
    ) {
        FilaImpressao fila =
                filaRepository
                        .findFirstByEquipamentoIdAndStatusOrderByOrdemFilaAsc(
                                equipamentoId,
                                StatusFilaImpressao.PENDENTE
                        )
                        .orElseThrow(() ->
                                new BusinessException(
                                        "Não existem registros "
                                                + "pendentes para esse equipamento."
                                )
                        );

        Equipamento equipamento = fila.getEquipamento();
        validarConexaoEquipamento(equipamento);
        confirmarLayoutDoRegistro(fila);

        DominoFifoCountResponse fifoAntes =
                dominoService.consultarQuantidadeFifo(
                        equipamento
                );

        if (fifoAntes.quantidadeItens()
                >= capacidadeBuffer) {
            throw new BusinessException(
                    "O FIFO atingiu a capacidade "
                            + "configurada de "
                            + capacidadeBuffer
                            + " itens."
            );
        }

        enviarRegistroParaFifo(equipamento, fila);

        DominoFifoCountResponse fifoDepois =
                dominoService.consultarQuantidadeFifo(
                        equipamento
                );

        return new ProcessamentoFilaResponseDTO(
                fila.getId(),
                equipamento.getId(),
                fila.getOrdemFila(),
                fila.getPayloadMontado(),
                fila.getStatus(),
                fifoAntes.quantidadeItens(),
                fifoDepois.quantidadeItens(),
                "Registro enviado ao FIFO com sucesso."
        );
    }

    private void validarConexaoEquipamento(Equipamento equipamento) {
        if (equipamento.getIp() == null
                || equipamento.getIp().isBlank()) {
            throw new BusinessException(
                    "O equipamento não possui IP configurado."
            );
        }

        if (equipamento.getPorta() == null) {
            throw new BusinessException(
                    "O equipamento não possui porta configurada."
            );
        }

        if (equipamento.getProtocolo() == null
                || !equipamento.getProtocolo()
                .equalsIgnoreCase("CODENET")) {
            throw new BusinessException(
                    "O equipamento não está configurado com o protocolo CODENET."
            );
        }
    }

    private String limitarMensagem(String mensagem) {
        if (mensagem == null || mensagem.isBlank()) {
            return "Erro desconhecido durante o envio ao FIFO.";
        }

        return mensagem.length() <= 1000
                ? mensagem
                : mensagem.substring(0, 1000);
    }

    @Transactional
    public ConfirmacaoImpressaoResponseDTO verificarConsumo(
            Long equipamentoId
    ) {
        SincronizacaoFilaResponseDTO sincronizacao =
                sincronizar(
                        equipamentoId
                );

        FilaImpressao referencia =
                filaRepository
                        .findFirstByEquipamentoIdAndStatusOrderByOrdemFilaAsc(
                                equipamentoId,
                                StatusFilaImpressao.PRONTO_IMPRESSAO
                        )
                        .orElseGet(() ->
                                filaRepository
                                        .findFirstByEquipamentoIdAndStatusOrderByOrdemFilaAsc(
                                                equipamentoId,
                                                StatusFilaImpressao.ENVIADO_FIFO
                                        )
                                        .orElse(null)
                        );

        if (referencia == null) {
            return new ConfirmacaoImpressaoResponseDTO(
                    null,
                    equipamentoId,
                    null,
                    sincronizacao.quantidadeFifo(),
                    null,
                    sincronizacao.mensagem()
            );
        }

        return new ConfirmacaoImpressaoResponseDTO(
                referencia.getId(),
                equipamentoId,
                referencia.getStatus(),
                sincronizacao.quantidadeFifo(),
                referencia.getImpressoEm(),
                sincronizacao.mensagem()
        );
    }

    @Transactional
    public SincronizacaoFilaResponseDTO sincronizar(
            Long equipamentoId
    ) {
        FilaImpressao pronto =
                filaRepository
                        .findFirstByEquipamentoIdAndStatusOrderByOrdemFilaAsc(
                                equipamentoId,
                                StatusFilaImpressao.PRONTO_IMPRESSAO
                        )
                        .orElse(null);

        List<FilaImpressao> enviados =
                new ArrayList<>(
                        filaRepository
                                .findByEquipamentoIdAndStatusOrderByOrdemFilaAsc(
                                        equipamentoId,
                                        StatusFilaImpressao.ENVIADO_FIFO
                                )
                );

        FilaImpressao registroReferencia =
                pronto != null
                        ? pronto
                        : enviados.isEmpty()
                          ? null
                          : enviados.get(0);

        /*
         * Não existe item fisicamente ativo.
         * Se houver pendentes, tentamos abastecer o FIFO.
         */
        if (registroReferencia == null) {
            boolean possuiPendente =
                    filaRepository
                            .existsByEquipamentoIdAndStatus(
                                    equipamentoId,
                                    StatusFilaImpressao.PENDENTE
                            );

            if (!possuiPendente) {
                return new SincronizacaoFilaResponseDTO(
                        equipamentoId,
                        null,
                        "FILA_OCIOSA",
                        null,
                        0,
                        "Não existem registros pendentes "
                                + "ou em processamento."
                );
            }

            int quantidadeEnviada =
                    abastecerAteCapacidade(
                            equipamentoId
                    );

            return new SincronizacaoFilaResponseDTO(
                    equipamentoId,
                    null,
                    "FIFO_ABASTECIDO",
                    StatusFilaImpressao
                            .ENVIADO_FIFO
                            .name(),
                    quantidadeEnviada,
                    quantidadeEnviada
                            + " item(ns) enviados ao FIFO."
            );
        }

        Equipamento equipamento =
                registroReferencia.getEquipamento();

        validarConexaoEquipamento(
                equipamento
        );

        DominoFifoCountResponse fifoAtual =
                dominoService.consultarQuantidadeFifo(
                        equipamento
                );

        DominoProductCountResponse contadorAtual =
                dominoService.consultarContadorProduto(
                        equipamento
                );

        long contadorReferencia;

        if (pronto != null) {
            contadorReferencia =
                    obterContadorObrigatorio(
                            pronto.getContadorCarregamento(),
                            pronto,
                            "contador de carregamento"
                    );
        } else {
            contadorReferencia =
                    obterContadorObrigatorio(
                            enviados
                                    .get(0)
                                    .getContadorAntesEnvio(),
                            enviados.get(0),
                            "contador anterior ao envio"
                    );
        }

        long deltaContador =
                calcularDeltaContador(
                        contadorReferencia,
                        contadorAtual.quantidade()
                );

        /*
         * Quantos registros saíram fisicamente do FIFO desde
         * a última situação conhecida pelo banco.
         */
        int quantidadeEnviadaBanco =
                enviados.size();

        int quantidadeConsumidaFifo =
                Math.max(
                        0,
                        quantidadeEnviadaBanco
                                - fifoAtual.quantidadeItens()
                );

        /*
         * Se já existe um item PRONTO e não há mais nada no FIFO,
         * ainda pode ocorrer um último pulso para imprimir esse item.
         */
        int limiteTransicoes;

        if (pronto != null
                && enviados.isEmpty()) {
            limiteTransicoes = 1;
        } else {
            limiteTransicoes =
                    quantidadeConsumidaFifo;
        }

        long quantidadePulsosReconhecidos =
                Math.min(
                        deltaContador,
                        limiteTransicoes
                );

        int quantidadeImpressa = 0;
        int quantidadeCarregada = 0;

        Long ultimoRegistroAlterado =
                registroReferencia.getId();

        LocalDateTime momentoSincronizacao =
                LocalDateTime.now();

        /*
         * Cada pulso realiza duas possíveis transições:
         *
         * 1. O item que já estava PRONTO é impresso.
         * 2. O primeiro ENVIADO_FIFO é carregado na tela.
         *
         * O laço repete essas transições para todos os pulsos
         * ocorridos entre duas consultas.
         */
        for (
                long indice = 1;
                indice <= quantidadePulsosReconhecidos;
                indice++
        ) {
            long contadorDoPulso =
                    contadorReferencia + indice;

            if (pronto != null) {
                marcarComoImpresso(
                        pronto,
                        contadorDoPulso,
                        momentoSincronizacao
                );

                ultimoRegistroAlterado =
                        pronto.getId();

                quantidadeImpressa++;

                pronto = null;
            }

            if (!enviados.isEmpty()) {
                FilaImpressao carregado =
                        enviados.remove(0);

                carregado.setStatus(
                        StatusFilaImpressao.PRONTO_IMPRESSAO
                );

                carregado.setContadorCarregamento(
                        contadorDoPulso
                );

                carregado.setMensagemErro(null);

                filaRepository.saveAndFlush(
                        carregado
                );

                pronto = carregado;

                ultimoRegistroAlterado =
                        carregado.getId();

                quantidadeCarregada++;
            }

            if (pronto == null
                    && enviados.isEmpty()) {
                break;
            }
        }

        /*
         * Após confirmar os itens impressos, registrarImpressaoConfirmada()
         * cria novos registros PENDENTE para manter a janela da produção.
         */
        DominoFifoCountResponse fifoDepoisTransicoes =
                dominoService.consultarQuantidadeFifo(
                        equipamento
                );

        int quantidadeReposta = 0;

        if (fifoDepoisTransicoes.quantidadeItens()
                <= nivelReposicao) {
            quantidadeReposta =
                    abastecerAteCapacidade(
                            equipamentoId
                    );
        }

        DominoFifoCountResponse fifoFinal =
                dominoService.consultarQuantidadeFifo(
                        equipamento
                );

        if (quantidadeImpressa == 0
                && quantidadeCarregada == 0
                && quantidadeReposta == 0) {
            String statusAtual =
                    pronto != null
                            ? StatusFilaImpressao
                            .PRONTO_IMPRESSAO
                            .name()
                            : StatusFilaImpressao
                            .ENVIADO_FIFO
                            .name();

            return new SincronizacaoFilaResponseDTO(
                    equipamentoId,
                    registroReferencia.getId(),
                    "AGUARDANDO_PULSO",
                    statusAtual,
                    fifoFinal.quantidadeItens(),
                    "Nenhum novo pulso foi confirmado. "
                            + "Contador atual: "
                            + contadorAtual.quantidade()
                            + ". FIFO atual: "
                            + fifoFinal.quantidadeItens()
                            + "."
            );
        }

        String statusFinal =
                pronto != null
                        ? StatusFilaImpressao
                        .PRONTO_IMPRESSAO
                        .name()
                        : StatusFilaImpressao
                        .ENVIADO_FIFO
                        .name();

        return new SincronizacaoFilaResponseDTO(
                equipamentoId,
                ultimoRegistroAlterado,
                "ESTEIRA_AVANCADA",
                statusFinal,
                fifoFinal.quantidadeItens(),
                "Pulsos reconhecidos: "
                        + quantidadePulsosReconhecidos
                        + "; itens impressos: "
                        + quantidadeImpressa
                        + "; itens carregados: "
                        + quantidadeCarregada
                        + "; itens repostos: "
                        + quantidadeReposta
                        + "."
        );
    }

    @Transactional
    public void prepararInicioProducao(
            Long equipamentoId
    ) {
        FilaImpressao primeiroPendente =
                filaRepository
                        .findFirstByEquipamentoIdAndStatusOrderByOrdemFilaAsc(
                                equipamentoId,
                                StatusFilaImpressao.PENDENTE
                        )
                        .orElseThrow(() ->
                                new BusinessException(
                                        "Não existem registros pendentes para preparar a produção."
                                )
                        );

        Equipamento equipamento =
                primeiroPendente.getEquipamento();

        validarConexaoEquipamento(
                equipamento
        );

        /*
         * Impede impressão acidental durante a preparação.
         * O jato permanece ligado, mas o cabeçote não imprime.
         */
        dominoService.desabilitarCabecote(
                equipamento
        );

        String layoutEsperado =
                primeiroPendente
                        .getLayout()
                        .getNomeNaImpressora();

        DominoLayoutOnlineResponse layoutAtual =
                dominoService.consultarLayoutOnline(
                        equipamento
                );

        if (!layoutEsperado.equals(
                layoutAtual.nome()
        )) {
            dominoService.selecionarLayout(
                    equipamento,
                    layoutEsperado
            );

            DominoLayoutOnlineResponse layoutConfirmado =
                    dominoService.consultarLayoutOnline(
                            equipamento
                    );

            if (!layoutEsperado.equals(
                    layoutConfirmado.nome()
            )) {
                throw new BusinessException(
                        "A impressora não confirmou o layout "
                                + layoutEsperado
                                + " como online."
                );
            }
        }

        /*
         * Habilita a atualização da prévia na tela.
         */
        dominoService.ativarAtualizacaoMonitorLayout(
                equipamento
        );

        DominoFifoCountResponse fifoInicial =
                dominoService.consultarQuantidadeFifo(
                        equipamento
                );

        /*
         * Não apagamos conteúdo desconhecido automaticamente.
         * Na retomada, o método pausar() já terá limpado o FIFO.
         */
        if (fifoInicial.quantidadeItens() > 0) {
            throw new BusinessException(
                    "O FIFO físico já possui "
                            + fifoInicial.quantidadeItens()
                            + " item(ns). Limpe ou reconcilie "
                            + "a impressora antes de iniciar."
            );
        }

        int quantidadeEnviada =
                abastecerAteCapacidade(
                        equipamentoId
                );

        if (quantidadeEnviada == 0) {
            throw new BusinessException(
                    "Nenhum item foi enviado ao FIFO durante "
                            + "a preparação da produção."
            );
        }

        FilaImpressao primeiroEnviado =
                filaRepository
                        .findFirstByEquipamentoIdAndStatusOrderByOrdemFilaAsc(
                                equipamentoId,
                                StatusFilaImpressao.ENVIADO_FIFO
                        )
                        .orElseThrow(() ->
                                new BusinessException(
                                        "Nenhum registro enviado foi encontrado."
                                )
                        );

        /*
         * Com o cabeçote desabilitado, o Print Go preparatório
         * carrega o primeiro conjunto de dados sem imprimir
         * fisicamente no produto.
         */
        dominoService.dispararSoftwarePrintGo(
                equipamento
        );

        DominoProductCountResponse contadorDepois =
                dominoService.consultarContadorProduto(
                        equipamento
                );

        primeiroEnviado.setStatus(
                StatusFilaImpressao.PRONTO_IMPRESSAO
        );

        primeiroEnviado.setContadorCarregamento(
                contadorDepois.quantidade()
        );

        primeiroEnviado.setMensagemErro(null);

        /*
         * Garante que o estado lógico foi gravado antes de
         * habilitar fisicamente a impressão.
         */
        filaRepository.saveAndFlush(
                primeiroEnviado
        );

        DominoFifoCountResponse fifoPreparado =
                dominoService.consultarQuantidadeFifo(
                        equipamento
                );

        /*
         * Se somente um registro tiver sido enviado, o Print Go
         * preparatório poderá deixar o FIFO com zero porque esse
         * registro já foi carregado como PRONTO_IMPRESSAO.
         *
         * Portanto, a existência de primeiroEnviado como pronto
         * é a confirmação principal; não exigimos FIFO > 0.
         */
        if (primeiroEnviado.getStatus()
                != StatusFilaImpressao.PRONTO_IMPRESSAO) {
            throw new BusinessException(
                    "A impressora não possui item preparado para impressão."
            );
        }

        dominoService.habilitarCabecote(
                equipamento
        );
    }

    @Transactional
    public int abastecerAteCapacidade(
            Long equipamentoId
    ) {
        FilaImpressao primeiroPendente =
                filaRepository
                        .findFirstByEquipamentoIdAndStatusOrderByOrdemFilaAsc(
                                equipamentoId,
                                StatusFilaImpressao.PENDENTE
                        )
                        .orElse(null);

        if (primeiroPendente == null) {
            return 0;
        }

        Equipamento equipamento =
                primeiroPendente.getEquipamento();

        validarConexaoEquipamento(
                equipamento
        );

        confirmarLayoutDoRegistro(
                primeiroPendente
        );

        DominoFifoCountResponse fifoAtual =
                dominoService.consultarQuantidadeFifo(
                        equipamento
                );

        int quantidadeFisica =
                fifoAtual.quantidadeItens();

        if (quantidadeFisica > capacidadeBuffer) {
            throw new BusinessException(
                    "O FIFO físico possui "
                            + quantidadeFisica
                            + " itens, ultrapassando a "
                            + "capacidade configurada de "
                            + capacidadeBuffer
                            + "."
            );
        }

        int vagasDisponiveis =
                capacidadeBuffer - quantidadeFisica;

        int quantidadeEnviada = 0;

        /*
         * Mantemos o mesmo layout durante todo o abastecimento.
         * Uma troca de layout no meio do FIFO poderia invalidar
         * os dados já armazenados.
         */
        Long layoutId =
                primeiroPendente
                        .getLayout()
                        .getId();

        while (quantidadeEnviada
                < vagasDisponiveis) {

            FilaImpressao proximo =
                    filaRepository
                            .findFirstByEquipamentoIdAndStatusOrderByOrdemFilaAsc(
                                    equipamentoId,
                                    StatusFilaImpressao.PENDENTE
                            )
                            .orElse(null);

            if (proximo == null) {
                break;
            }

            if (!layoutId.equals(
                    proximo.getLayout().getId()
            )) {
                break;
            }

            enviarRegistroParaFifo(
                    equipamento,
                    proximo
            );

            quantidadeEnviada++;
        }

        return quantidadeEnviada;
    }

    private void enviarRegistroParaFifo(Equipamento equipamento, FilaImpressao fila) {
        DominoProductCountResponse contadorAntes =
                dominoService.consultarContadorProduto(
                        equipamento
                );

        fila.setContadorAntesEnvio(contadorAntes.quantidade());
        fila.setContadorCarregamento(null);
        fila.setContadorAposImpressao(null);
        fila.setStatus(StatusFilaImpressao.ENVIANDO);
        fila.setMensagemErro(null);
        fila.setTentativas(fila.getTentativas() + 1);

        filaRepository.saveAndFlush(fila);

        try {
            dominoService.adicionarDadosFifo(
                    equipamento,
                    fila.getPayloadMontado()
            );

            fila.setStatus(StatusFilaImpressao.ENVIADO_FIFO);

            fila.setEnviadoEm(LocalDateTime.now());

            fila.setMensagemErro(null);

            filaRepository.saveAndFlush(fila);

        } catch (RuntimeException exception) {
            fila.setStatus(StatusFilaImpressao.ERRO);

            fila.setMensagemErro(
                    limitarMensagem(exception.getMessage())
            );

            filaRepository.save(fila);

            throw exception;
        }
    }

    private void confirmarLayoutDoRegistro(FilaImpressao fila) {
        Equipamento equipamento = fila.getEquipamento();
        String layoutEsperado = fila.getLayout().getNomeNaImpressora();
        DominoLayoutOnlineResponse layoutAtual = dominoService.consultarLayoutOnline(equipamento);

        if (layoutEsperado.equals(
                layoutAtual.nome()
        )) {
            return;
        }

        dominoService.selecionarLayout(equipamento, layoutEsperado);
        DominoLayoutOnlineResponse layoutConfirmado = dominoService.consultarLayoutOnline(equipamento);

        if (!layoutEsperado.equals(layoutConfirmado.nome())) {
            throw new BusinessException(
                    "A impressora não confirmou o layout "
                            + layoutEsperado
                            + " como online."
            );
        }
    }

    private void marcarComoImpresso(
            FilaImpressao fila,
            long contadorDoPulso,
            LocalDateTime momento
    ) {
        fila.setStatus(
                StatusFilaImpressao.IMPRESSO
        );

        fila.setContadorAposImpressao(
                contadorDoPulso
        );

        fila.setImpressoEm(
                momento
        );

        fila.setMensagemErro(null);

        filaRepository.saveAndFlush(
                fila
        );

        /*
         * Atualiza o ProducaoItem e cria outro PENDENTE
         * para manter a janela configurada.
         */
        producaoExecucaoService
                .registrarImpressaoConfirmada(
                        fila
                );
    }

    private long obterContadorObrigatorio(
            Long contador,
            FilaImpressao fila,
            String descricao
    ) {
        if (contador != null) {
            return contador;
        }

        fila.setStatus(
                StatusFilaImpressao.ERRO
        );

        fila.setMensagemErro(
                "Registro sem "
                        + descricao
                        + "."
        );

        filaRepository.save(
                fila
        );

        throw new BusinessException(
                "O registro "
                        + fila.getId()
                        + " não possui "
                        + descricao
                        + "."
        );
    }

    private long calcularDeltaContador(
            long contadorAnterior,
            long contadorAtual
    ) {
        /*
         * Um valor menor pode indicar reinicialização ou reset.
         * Nesse caso não confirmamos impressões por suposição.
         */
        if (contadorAtual < contadorAnterior) {
            return 0;
        }

        return contadorAtual - contadorAnterior;
    }


}