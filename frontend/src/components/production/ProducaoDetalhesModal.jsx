import {
    CheckCircle2,
    CirclePause,
    CirclePlay,
    FileUp,
    Loader2,
    RefreshCw,
    RotateCcw,
    Trash2,
    Wrench,
    X,
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import toast from "react-hot-toast";

import {
    producaoService,
} from "../../services/producaoService.js";

import {
    obterStatusProducao,
} from "./producaoStatusMap.js";

import ImportarItensModal from "./ImportarItensModal.jsx";

const statusItemMap = {
    AGUARDANDO: {
        label: "Aguardando",
        className:
            "bg-slate-100 text-slate-700 ring-slate-300",
    },

    EM_IMPRESSAO: {
        label: "Em impressão",
        className:
            "bg-blue-100 text-blue-700 ring-blue-300",
    },

    AGUARDANDO_VALIDACAO: {
        label: "Aguardando validação",
        className:
            "bg-amber-100 text-amber-700 ring-amber-300",
    },

    AGUARDANDO_RETRABALHO: {
        label: "Aguardando retrabalho",
        className:
            "bg-orange-100 text-orange-700 ring-orange-300",
    },

    EM_RETRABALHO: {
        label: "Em retrabalho",
        className:
            "bg-violet-100 text-violet-700 ring-violet-300",
    },

    CONCLUIDO: {
        label: "Concluído",
        className:
            "bg-green-100 text-green-700 ring-green-300",
    },

    ERRO: {
        label: "Erro",
        className:
            "bg-red-100 text-red-700 ring-red-300",
    },

    CANCELADO: {
        label: "Cancelado",
        className:
            "bg-slate-100 text-slate-600 ring-slate-300",
    },
};

function ProducaoDetalhesModal({
                                   isOpen,
                                   producaoId,
                                   onClose,
                                   onUpdated,
                               }) {
    const [producao, setProducao] =
        useState(null);

    const [itens, setItens] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [actionLoading, setActionLoading] =
        useState("");

    const [
        importarModalOpen,
        setImportarModalOpen,
    ] = useState(false);

    const [
        motivoCancelamento,
        setMotivoCancelamento,
    ] = useState("");

    const [
        cancelamentoOpen,
        setCancelamentoOpen,
    ] = useState(false);

    const carregarDados =
        useCallback(
            async (
                showLoading = true,
                showError = true
            ) => {
                if (!producaoId) {
                    return;
                }

                try {
                    if (showLoading) {
                        setLoading(true);
                    }

                    const [
                        producaoData,
                        itensData,
                    ] = await Promise.all([
                        producaoService.buscarPorId(
                            producaoId
                        ),

                        producaoService.listarItens(
                            producaoId
                        ),
                    ]);

                    setProducao(producaoData);

                    setItens(
                        Array.isArray(itensData)
                            ? itensData
                            : []
                    );
                } catch (error) {
                    console.error(
                        "Erro ao carregar produção:",
                        error
                    );

                    if (showError) {
                        toast.error(
                            error.response?.data?.detail ||
                            error.response?.data?.message ||
                            "Não foi possível carregar os detalhes da produção."
                        );
                    }
                } finally {
                    if (showLoading) {
                        setLoading(false);
                    }
                }
            },
            [producaoId]
        );

    useEffect(() => {
        if (!isOpen || !producaoId) {
            return;
        }

        setProducao(null);
        setItens([]);
        setCancelamentoOpen(false);
        setMotivoCancelamento("");
        setImportarModalOpen(false);

        carregarDados(true, true);
    }, [
        isOpen,
        producaoId,
        carregarDados,
    ]);

    useEffect(() => {
        const statusMonitorados = [
            "EM_ANDAMENTO",
            "EM_RETRABALHO",
        ];

        if (
            !isOpen ||
            Boolean(actionLoading) ||
            !statusMonitorados.includes(
                producao?.status
            )
        ) {
            return undefined;
        }

        const intervaloId =
            window.setInterval(
                () => {
                    carregarDados(false, false);
                },
                2000
            );

        return () => {
            window.clearInterval(
                intervaloId
            );
        };
    }, [
        isOpen,
        producao?.status,
        actionLoading,
        carregarDados,
    ]);

    const resumoItens =
        useMemo(() => {
            return itens.reduce(
                (resumo, item) => {
                    resumo.total++;

                    if (
                        item.status ===
                        "AGUARDANDO_VALIDACAO"
                    ) {
                        resumo.aguardandoValidacao++;
                    }

                    if (
                        item.status ===
                        "AGUARDANDO_RETRABALHO" ||
                        item.status ===
                        "EM_RETRABALHO"
                    ) {
                        resumo.retrabalho++;
                    }

                    if (
                        item.status ===
                        "CONCLUIDO"
                    ) {
                        resumo.concluidos++;
                    }

                    if (
                        item.status ===
                        "ERRO"
                    ) {
                        resumo.erros++;
                    }

                    return resumo;
                },
                {
                    total: 0,
                    aguardandoValidacao: 0,
                    retrabalho: 0,
                    concluidos: 0,
                    erros: 0,
                }
            );
        }, [itens]);

    async function executarAcao(
        nome,
        acao,
        mensagem
    ) {
        try {
            setActionLoading(nome);

            const resposta =
                await acao();

            await carregarDados(
                false,
                true
            );

            toast.success(
                resposta?.mensagem ||
                mensagem
            );

            onUpdated?.();

            return true;
        } catch (error) {
            console.error(
                `Erro ao executar ${nome}:`,
                error
            );

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Não foi possível concluir a operação."
            );

            return false;
        } finally {
            setActionLoading("");
        }
    }

    async function importarItens(payload) {
        try {
            setActionLoading("IMPORTAR");

            const resposta =
                await producaoService
                    .importarItens(
                        producao.id,
                        payload
                    );

            setImportarModalOpen(false);

            await carregarDados(
                false,
                true
            );

            toast.success(
                `${resposta.quantidadeImportada} item(ns) importado(s) com sucesso.`
            );

            onUpdated?.();
        } catch (error) {
            console.error(
                "Erro ao importar itens:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Não foi possível importar os itens."
            );
        } finally {
            setActionLoading("");
        }
    }

    async function marcarRetrabalho(item) {
        await executarAcao(
            `MARCAR-${item.id}`,
            () =>
                producaoService
                    .marcarRetrabalho(
                        producao.id,
                        item.id
                    ),
            `Item ${item.sequencia} marcado para retrabalho.`
        );
    }

    async function desmarcarRetrabalho(
        item
    ) {
        await executarAcao(
            `DESMARCAR-${item.id}`,
            () =>
                producaoService
                    .desmarcarRetrabalho(
                        producao.id,
                        item.id
                    ),
            `Marcação do item ${item.sequencia} removida.`
        );
    }

    async function cancelarProducao() {
        const motivo =
            motivoCancelamento.trim();

        if (!motivo) {
            toast.error(
                "Informe o motivo do cancelamento."
            );

            return;
        }

        const sucesso =
            await executarAcao(
                "CANCELAR",
                () =>
                    producaoService.cancelar(
                        producao.id,
                        motivo
                    ),
                "Produção cancelada com sucesso."
            );

        if (!sucesso) {
            return;
        }

        setCancelamentoOpen(false);
        setMotivoCancelamento("");
    }

    function iniciarProducao() {
        const confirmado =
            window.confirm(
                "Confirma o início da produção? A impressora será preparada e o cabeçote será habilitado."
            );

        if (!confirmado) {
            return;
        }

        executarAcao(
            "INICIAR",
            () =>
                producaoService.iniciar(
                    producao.id
                ),
            "Produção iniciada com sucesso."
        );
    }

    function pausarProducao() {
        const confirmado =
            window.confirm(
                "Confirma a pausa? Pare fisicamente a esteira antes de continuar. O cabeçote será desabilitado e o FIFO será limpo."
            );

        if (!confirmado) {
            return;
        }

        executarAcao(
            "PAUSAR",
            () =>
                producaoService.pausar(
                    producao.id
                ),
            "Produção pausada com sucesso."
        );
    }

    function retomarProducao() {
        const confirmado =
            window.confirm(
                "Confirma a retomada? A impressora será novamente preparada e o cabeçote será habilitado."
            );

        if (!confirmado) {
            return;
        }

        executarAcao(
            "RETOMAR",
            () =>
                producaoService.retomar(
                    producao.id
                ),
            "Produção retomada com sucesso."
        );
    }

    if (!isOpen) {
        return null;
    }

    const status =
        obterStatusProducao(
            producao?.status
        );

    const bloqueado =
        Boolean(actionLoading);

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
                <div className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#f5f7fb] shadow-2xl">
                    <header className="flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-xl font-bold text-slate-900">
                                    {producao?.codigoOrdem ||
                                        "Produção"}
                                </h2>

                                {producao && (
                                    <span
                                        className={`
                                            inline-flex rounded-full
                                            px-3 py-1
                                            text-xs font-semibold
                                            ring-1 ring-inset
                                            ${status.className}
                                        `}
                                    >
                                        {status.label}
                                    </span>
                                )}
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                                Detalhes e operações da produção
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    carregarDados(
                                        true,
                                        true
                                    )
                                }
                                disabled={
                                    loading ||
                                    bloqueado
                                }
                                className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                                title="Atualizar"
                            >
                                <RefreshCw
                                    size={18}
                                    className={
                                        loading
                                            ? "animate-spin"
                                            : ""
                                    }
                                />
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={bloqueado}
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                                title="Fechar"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </header>

                    <div className="min-h-0 flex-1 overflow-y-auto p-6">
                        {loading && !producao ? (
                            <div className="flex min-h-72 items-center justify-center">
                                <Loader2
                                    size={32}
                                    className="animate-spin text-blue-600"
                                />
                            </div>
                        ) : producao ? (
                            <div className="space-y-6">
                                <InformacoesProducao
                                    producao={
                                        producao
                                    }
                                />

                                <ResumoItens
                                    resumo={
                                        resumoItens
                                    }
                                />

                                <AcoesProducao
                                    producao={
                                        producao
                                    }
                                    bloqueado={
                                        bloqueado
                                    }
                                    actionLoading={
                                        actionLoading
                                    }
                                    onImportar={() =>
                                        setImportarModalOpen(
                                            true
                                        )
                                    }
                                    onFinalizarCarga={() =>
                                        executarAcao(
                                            "FINALIZAR_CARGA",
                                            () =>
                                                producaoService
                                                    .finalizarCarga(
                                                        producao.id
                                                    ),
                                            "Carga finalizada com sucesso."
                                        )
                                    }
                                    onIniciar={
                                        iniciarProducao
                                    }
                                    onPausar={
                                        pausarProducao
                                    }
                                    onRetomar={
                                        retomarProducao
                                    }
                                    onFinalizarAvaliacao={() =>
                                        executarAcao(
                                            "FINALIZAR_AVALIACAO",
                                            () =>
                                                producaoService
                                                    .finalizarAvaliacao(
                                                        producao.id
                                                    ),
                                            "Avaliação finalizada com sucesso."
                                        )
                                    }
                                    onCancelar={() =>
                                        setCancelamentoOpen(
                                            true
                                        )
                                    }
                                />

                                {cancelamentoOpen && (
                                    <CancelamentoBox
                                        motivo={
                                            motivoCancelamento
                                        }
                                        onMotivoChange={
                                            setMotivoCancelamento
                                        }
                                        onConfirmar={
                                            cancelarProducao
                                        }
                                        onFechar={() => {
                                            setCancelamentoOpen(
                                                false
                                            );

                                            setMotivoCancelamento(
                                                ""
                                            );
                                        }}
                                        loading={
                                            actionLoading ===
                                            "CANCELAR"
                                        }
                                    />
                                )}

                                <ItensTable
                                    itens={itens}
                                    producaoStatus={
                                        producao.status
                                    }
                                    actionLoading={
                                        actionLoading
                                    }
                                    onMarcarRetrabalho={
                                        marcarRetrabalho
                                    }
                                    onDesmarcarRetrabalho={
                                        desmarcarRetrabalho
                                    }
                                />
                            </div>
                        ) : (
                            <p className="py-16 text-center text-sm text-slate-500">
                                Produção não encontrada.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <ImportarItensModal
                isOpen={
                    importarModalOpen
                }
                producao={producao}
                onClose={() => {
                    if (
                        actionLoading !==
                        "IMPORTAR"
                    ) {
                        setImportarModalOpen(
                            false
                        );
                    }
                }}
                onImport={
                    importarItens
                }
                loading={
                    actionLoading ===
                    "IMPORTAR"
                }
            />
        </>
    );
}

function InformacoesProducao({
                                 producao,
                             }) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">
                Informações da produção
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Info
                    label="Linha"
                    value={
                        producao.linhaNome
                    }
                />

                <Info
                    label="Equipamento principal"
                    value={
                        producao
                            .equipamentoPrincipalNome
                    }
                />

                <Info
                    label="Layout principal"
                    value={
                        producao
                            .layoutPrincipalNome
                    }
                />

                <Info
                    label="Quantidade total"
                    value={
                        producao.quantidadeTotal != null
                            ? String(
                                producao.quantidadeTotal
                            )
                            : "Não informada"
                    }
                />

                <Info
                    label="Validade"
                    value={
                        producao.validadeDias != null
                            ? `${producao.validadeDias} dias`
                            : "Não informada"
                    }
                />

                <Info
                    label="Equipamento de retrabalho"
                    value={
                        producao
                            .equipamentoRetrabalhoNome
                    }
                />

                <Info
                    label="Layout de retrabalho"
                    value={
                        producao
                            .layoutRetrabalhoNome
                    }
                />

                <Info
                    label="Iniciada em"
                    value={
                        formatarData(
                            producao.iniciadaEm
                        )
                    }
                />

                <Info
                    label="Concluída em"
                    value={
                        formatarData(
                            producao.concluidaEm
                        )
                    }
                />

                <Info
                    label="Cancelada em"
                    value={
                        formatarData(
                            producao.canceladaEm
                        )
                    }
                />
            </div>

            {producao.observacoes && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                    <Info
                        label="Observações"
                        value={
                            producao.observacoes
                        }
                    />
                </div>
            )}

            {producao.motivoCancelamento && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                        Motivo do cancelamento
                    </p>

                    <p className="mt-1 text-sm text-red-800">
                        {
                            producao
                                .motivoCancelamento
                        }
                    </p>
                </div>
            )}
        </section>
    );
}

function ResumoItens({
                         resumo,
                     }) {
    const cards = [
        {
            label: "Total",
            valor: resumo.total,
            className:
                "border-blue-200 bg-blue-50 text-blue-800",
        },
        {
            label: "Aguardando validação",
            valor:
            resumo.aguardandoValidacao,
            className:
                "border-amber-200 bg-amber-50 text-amber-800",
        },
        {
            label: "Retrabalho",
            valor: resumo.retrabalho,
            className:
                "border-orange-200 bg-orange-50 text-orange-800",
        },
        {
            label: "Concluídos",
            valor: resumo.concluidos,
            className:
                "border-green-200 bg-green-50 text-green-800",
        },
        {
            label: "Erros",
            valor: resumo.erros,
            className:
                "border-red-200 bg-red-50 text-red-800",
        },
    ];

    return (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={`
                        rounded-2xl border p-4
                        ${card.className}
                    `}
                >
                    <p className="text-xs font-semibold uppercase tracking-wide">
                        {card.label}
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                        {card.valor}
                    </p>
                </div>
            ))}
        </section>
    );
}

function AcoesProducao({
                           producao,
                           bloqueado,
                           actionLoading,
                           onImportar,
                           onFinalizarCarga,
                           onIniciar,
                           onPausar,
                           onRetomar,
                           onFinalizarAvaliacao,
                           onCancelar,
                       }) {
    const status =
        producao.status;

    const podeCancelar =
        [
            "AGUARDANDO_DADOS",
            "PRONTA",
            "PAUSADA",
        ].includes(status);

    const podePausar =
        [
            "EM_ANDAMENTO",
            "EM_RETRABALHO",
        ].includes(status);

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">
                Ações disponíveis
            </h3>

            <div className="mt-4 flex flex-wrap gap-3">
                {status ===
                    "AGUARDANDO_DADOS" && (
                        <>
                            <ActionButton
                                icon={FileUp}
                                label="Importar itens"
                                onClick={
                                    onImportar
                                }
                                disabled={
                                    bloqueado
                                }
                            />

                            <ActionButton
                                icon={
                                    CheckCircle2
                                }
                                label="Finalizar carga"
                                onClick={
                                    onFinalizarCarga
                                }
                                loading={
                                    actionLoading ===
                                    "FINALIZAR_CARGA"
                                }
                                disabled={
                                    bloqueado
                                }
                                color="green"
                            />
                        </>
                    )}

                {status === "PRONTA" && (
                    <ActionButton
                        icon={CirclePlay}
                        label="Iniciar produção"
                        onClick={onIniciar}
                        loading={
                            actionLoading ===
                            "INICIAR"
                        }
                        disabled={bloqueado}
                        color="green"
                    />
                )}

                {podePausar && (
                    <ActionButton
                        icon={CirclePause}
                        label={
                            status ===
                            "EM_RETRABALHO"
                                ? "Pausar retrabalho"
                                : "Pausar produção"
                        }
                        onClick={onPausar}
                        loading={
                            actionLoading ===
                            "PAUSAR"
                        }
                        disabled={bloqueado}
                        color="amber"
                    />
                )}

                {status === "PAUSADA" && (
                    <ActionButton
                        icon={CirclePlay}
                        label="Retomar produção"
                        onClick={onRetomar}
                        loading={
                            actionLoading ===
                            "RETOMAR"
                        }
                        disabled={bloqueado}
                        color="green"
                    />
                )}

                {status ===
                    "AGUARDANDO_AVALIACAO" && (
                        <ActionButton
                            icon={
                                CheckCircle2
                            }
                            label="Finalizar avaliação"
                            onClick={
                                onFinalizarAvaliacao
                            }
                            loading={
                                actionLoading ===
                                "FINALIZAR_AVALIACAO"
                            }
                            disabled={bloqueado}
                            color="green"
                        />
                    )}

                {podeCancelar && (
                    <ActionButton
                        icon={Trash2}
                        label="Cancelar produção"
                        onClick={onCancelar}
                        loading={
                            actionLoading ===
                            "CANCELAR"
                        }
                        disabled={bloqueado}
                        color="red"
                    />
                )}

                {status ===
                    "CONCLUIDA" && (
                        <p className="text-sm text-green-700">
                            Esta produção foi concluída.
                        </p>
                    )}

                {status ===
                    "CANCELADA" && (
                        <p className="text-sm text-slate-500">
                            Esta produção foi cancelada.
                        </p>
                    )}
            </div>
        </section>
    );
}

function ItensTable({
                        itens,
                        producaoStatus,
                        actionLoading,
                        onMarcarRetrabalho,
                        onDesmarcarRetrabalho,
                    }) {
    return (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="text-base font-bold text-slate-900">
                    Itens da produção
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                    {itens.length} item(ns) encontrado(s)
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[62rem]">
                    <thead className="border-b border-slate-200 bg-slate-50">
                    <tr className="text-left">
                        <Header>
                            Sequência
                        </Header>

                        <Header>
                            Referência
                        </Header>

                        <Header>
                            Valores
                        </Header>

                        <Header>
                            Status
                        </Header>

                        <Header>
                            Impressão
                        </Header>

                        <Header>
                            Ações
                        </Header>
                    </tr>
                    </thead>

                    <tbody>
                    {itens.length === 0 ? (
                        <tr>
                            <td
                                colSpan={6}
                                className="px-5 py-12 text-center text-sm text-slate-500"
                            >
                                Nenhum item importado.
                            </td>
                        </tr>
                    ) : (
                        itens.map((item) => {
                            const status =
                                statusItemMap[
                                    item.status
                                    ] || {
                                    label:
                                    item.status,
                                    className:
                                        "bg-slate-100 text-slate-700 ring-slate-300",
                                };

                            const carregandoItem =
                                actionLoading ===
                                `MARCAR-${item.id}` ||
                                actionLoading ===
                                `DESMARCAR-${item.id}`;

                            return (
                                <tr
                                    key={item.id}
                                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                                >
                                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                                        {
                                            item.sequencia
                                        }
                                    </td>

                                    <td className="px-4 py-4 text-sm text-slate-700">
                                        {item.referenciaExterna ||
                                            "—"}
                                    </td>

                                    <td className="px-4 py-4">
                                        <ValoresItem
                                            valores={
                                                item.valores
                                            }
                                        />
                                    </td>

                                    <td className="px-4 py-4">
                                            <span
                                                className={`
                                                    inline-flex whitespace-nowrap
                                                    rounded-full px-3 py-1
                                                    text-xs font-semibold
                                                    ring-1 ring-inset
                                                    ${status.className}
                                                `}
                                            >
                                                {
                                                    status.label
                                                }
                                            </span>

                                        {item.mensagemErro && (
                                            <p className="mt-2 max-w-xs text-xs text-red-600">
                                                {
                                                    item.mensagemErro
                                                }
                                            </p>
                                        )}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                                        {formatarData(
                                            item.impressoEm
                                        )}
                                    </td>

                                    <td className="px-4 py-4">
                                        {producaoStatus ===
                                            "AGUARDANDO_AVALIACAO" &&
                                            item.status ===
                                            "AGUARDANDO_VALIDACAO" && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onMarcarRetrabalho(
                                                            item
                                                        )
                                                    }
                                                    disabled={
                                                        Boolean(
                                                            actionLoading
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-orange-200 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-50 disabled:opacity-50"
                                                >
                                                    {carregandoItem ? (
                                                        <Loader2
                                                            size={15}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Wrench
                                                            size={15}
                                                        />
                                                    )}

                                                    Marcar retrabalho
                                                </button>
                                            )}

                                        {producaoStatus ===
                                            "AGUARDANDO_AVALIACAO" &&
                                            item.status ===
                                            "AGUARDANDO_RETRABALHO" && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onDesmarcarRetrabalho(
                                                            item
                                                        )
                                                    }
                                                    disabled={
                                                        Boolean(
                                                            actionLoading
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                                                >
                                                    {carregandoItem ? (
                                                        <Loader2
                                                            size={15}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <RotateCcw
                                                            size={15}
                                                        />
                                                    )}

                                                    Desmarcar
                                                </button>
                                            )}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function CancelamentoBox({
                             motivo,
                             onMotivoChange,
                             onConfirmar,
                             onFechar,
                             loading,
                         }) {
    return (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-5">
            <h3 className="font-bold text-red-900">
                Cancelar produção
            </h3>

            <p className="mt-1 text-sm text-red-700">
                Informe o motivo. Essa operação não poderá ser desfeita.
            </p>

            <textarea
                value={motivo}
                onChange={(event) =>
                    onMotivoChange(
                        event.target.value
                    )
                }
                maxLength={500}
                rows={3}
                disabled={loading}
                placeholder="Motivo do cancelamento..."
                className="mt-4 w-full resize-y rounded-xl border border-red-200 bg-white p-3 text-sm text-slate-700 outline-none focus:border-red-500 disabled:opacity-60"
            />

            <div className="mt-3 flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onFechar}
                    disabled={loading}
                    className="h-10 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                    Voltar
                </button>

                <button
                    type="button"
                    onClick={onConfirmar}
                    disabled={
                        loading ||
                        !motivo.trim()
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                    {loading && (
                        <Loader2
                            size={16}
                            className="animate-spin"
                        />
                    )}

                    Confirmar cancelamento
                </button>
            </div>
        </section>
    );
}

function ActionButton({
                          icon: Icon,
                          label,
                          onClick,
                          disabled,
                          loading = false,
                          color = "blue",
                      }) {
    const colors = {
        blue:
            "border-blue-200 text-blue-700 hover:bg-blue-50",

        green:
            "border-green-200 text-green-700 hover:bg-green-50",

        amber:
            "border-amber-200 text-amber-700 hover:bg-amber-50",

        red:
            "border-red-200 text-red-700 hover:bg-red-50",
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`
                inline-flex h-11 items-center
                gap-2 rounded-xl border bg-white
                px-4 text-sm font-semibold
                transition disabled:cursor-not-allowed
                disabled:opacity-50
                ${colors[color]}
            `}
        >
            {loading ? (
                <Loader2
                    size={17}
                    className="animate-spin"
                />
            ) : (
                <Icon size={17} />
            )}

            {label}
        </button>
    );
}

function Info({
                  label,
                  value,
              }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
                {value || "—"}
            </p>
        </div>
    );
}

function ValoresItem({
                         valores,
                     }) {
    const entries =
        Object.entries(
            valores || {}
        );

    if (entries.length === 0) {
        return (
            <span className="text-sm text-slate-400">
                —
            </span>
        );
    }

    return (
        <div className="flex max-w-md flex-wrap gap-1.5">
            {entries.map(
                ([chave, valor]) => (
                    <span
                        key={chave}
                        className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700"
                    >
                        <strong>
                            {chave}:
                        </strong>{" "}
                        {String(valor)}
                    </span>
                )
            )}
        </div>
    );
}

function Header({
                    children,
                }) {
    return (
        <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-600">
            {children}
        </th>
    );
}

function formatarData(data) {
    if (!data) {
        return "—";
    }

    const dataConvertida =
        new Date(data);

    if (
        Number.isNaN(
            dataConvertida.getTime()
        )
    ) {
        return "—";
    }

    return dataConvertida.toLocaleString(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short",
        }
    );
}

export default ProducaoDetalhesModal;