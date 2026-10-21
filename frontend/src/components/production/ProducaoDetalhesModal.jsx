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

import StatusBadge from "../common/StatusBadge.jsx";

import {
    DataTable,
    TableActionButton,
    TableActions,
    TablePrimaryText,
    TableText,
} from "../common/table/index.js";

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
    producaoItemStatusMap,
} from "../../config/statusMaps.js";

import ImportarItensModal from "./ImportarItensModal.jsx";

import {
    useAuth,
} from "../../contexts/AuthContext.jsx";

import {
    ACOES,
    podeExecutar,
} from "../../config/accessControl.js";

function ProducaoDetalhesModal({
                                   isOpen,
                                   producaoId,
                                   onClose,
                                   onUpdated,
                               }) {

    const { usuario } = useAuth();

    const perfil =
        usuario?.perfil;

    const podeImportar =
        podeExecutar(
            perfil,
            ACOES.PRODUCAO_IMPORTAR_ITENS
        );

    const podeFinalizarCarga =
        podeExecutar(
            perfil,
            ACOES.PRODUCAO_FINALIZAR_CARGA
        );

    const [
        confirmacaoAcao,
        setConfirmacaoAcao,
    ] = useState(null);

    const podeCancelar =
        podeExecutar(
            perfil,
            ACOES.PRODUCAO_CANCELAR
        );

    const podeIniciar =
        podeExecutar(
            perfil,
            ACOES.PRODUCAO_INICIAR
        );

    const podePausar =
        podeExecutar(
            perfil,
            ACOES.PRODUCAO_PAUSAR
        );

    const podeRetomar =
        podeExecutar(
            perfil,
            ACOES.PRODUCAO_RETOMAR
        );

    const podeFinalizarAvaliacao =
        podeExecutar(
            perfil,
            ACOES.PRODUCAO_FINALIZAR_AVALIACAO
        );

    const podeGerenciarRetrabalho =
        podeExecutar(
            perfil,
            ACOES.PRODUCAO_MARCAR_RETRABALHO
        );

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
        setConfirmacaoAcao(null);

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

    async function importarItens(arquivo) {
        if (!validarPermissao(podeImportar)) {
            return;
        }

        try {
            setActionLoading("IMPORTAR");

            const resposta =
                await producaoService
                    .importarItens(
                        producao.id,
                        arquivo
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

    async function marcarRetrabalho(
        item
    ) {
        if (!validarPermissao(
            podeGerenciarRetrabalho
        )) {
            return;
        }

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
        if (!validarPermissao(
            podeGerenciarRetrabalho
        )) {
            return;
        }

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
        if (!validarPermissao(podeCancelar)) {
            return;
        }

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
        if (!validarPermissao(podeIniciar)) {
            return;
        }

        setCancelamentoOpen(false);

        setConfirmacaoAcao({
            tipo: "INICIAR",
            titulo: "Iniciar produção",
            mensagem:
                "A impressora será preparada e o cabeçote será habilitado. Confirme somente se a linha estiver pronta para iniciar.",
            confirmarLabel: "Iniciar produção",
            destaque: "blue",
        });
    }

    function pausarProducao() {
        if (!validarPermissao(podePausar)) {
            return;
        }

        setCancelamentoOpen(false);

        setConfirmacaoAcao({
            tipo: "PAUSAR",
            titulo: "Pausar produção",
            mensagem:
                "Pare fisicamente a esteira antes de continuar. O cabeçote será desabilitado e o Buffer da impressora será limpo.",
            confirmarLabel: "Confirmar pausa",
            destaque: "amber",
        });
    }

    function retomarProducao() {
        if (!validarPermissao(podeRetomar)) {
            return;
        }

        setCancelamentoOpen(false);

        setConfirmacaoAcao({
            tipo: "RETOMAR",
            titulo: "Retomar produção",
            mensagem:
                "A impressora será preparada novamente e o cabeçote será habilitado. Verifique se a linha está pronta.",
            confirmarLabel: "Retomar produção",
            destaque: "blue",
        });
    }

    async function confirmarAcaoProducao() {
        if (!confirmacaoAcao || !producao) {
            return;
        }

        const configuracoes = {
            INICIAR: {
                permissao: podeIniciar,
                acao: () =>
                    producaoService.iniciar(
                        producao.id
                    ),
                mensagem:
                    "Produção iniciada com sucesso.",
            },

            PAUSAR: {
                permissao: podePausar,
                acao: () =>
                    producaoService.pausar(
                        producao.id
                    ),
                mensagem:
                    "Produção pausada com sucesso.",
            },

            RETOMAR: {
                permissao: podeRetomar,
                acao: () =>
                    producaoService.retomar(
                        producao.id
                    ),
                mensagem:
                    "Produção retomada com sucesso.",
            },
        };

        const configuracao =
            configuracoes[confirmacaoAcao.tipo];

        if (
            !configuracao ||
            !validarPermissao(configuracao.permissao)
        ) {
            return;
        }

        const sucesso = await executarAcao(
            confirmacaoAcao.tipo,
            configuracao.acao,
            configuracao.mensagem
        );

        if (sucesso) {
            setConfirmacaoAcao(null);
        }
    }

    function finalizarCarga() {
        if (!validarPermissao(
            podeFinalizarCarga
        )) {
            return;
        }

        executarAcao(
            "FINALIZAR_CARGA",
            () =>
                producaoService
                    .finalizarCarga(
                        producao.id
                    ),
            "Carga finalizada com sucesso."
        );
    }

    function finalizarAvaliacao() {
        if (!validarPermissao(
            podeFinalizarAvaliacao
        )) {
            return;
        }

        executarAcao(
            "FINALIZAR_AVALIACAO",
            () =>
                producaoService
                    .finalizarAvaliacao(
                        producao.id
                    ),
            "Avaliação finalizada com sucesso."
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm">
                <div className="flex max-h-[96vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f4f6f9] shadow-2xl">
                    <header className="flex items-start justify-between border-b border-slate-200 bg-white px-4 py-3.5">
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-lg font-bold text-slate-900">
                                    {producao?.codigoOrdem ||
                                        "Produção"}
                                </h2>

                                {producao && (
                                    <span
                                        className={`
                                            inline-flex items-center gap-1.5 rounded-full
                                            border px-2.5 py-1
                                            text-[10px] font-semibold
                                            ${status.className}
                                        `}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${status.dotClass || "bg-slate-400"}`}
                                        />
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

                    <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-5">
                        {loading && !producao ? (
                            <div className="flex min-h-72 items-center justify-center">
                                <Loader2
                                    size={32}
                                    className="animate-spin text-blue-600"
                                />
                            </div>
                        ) : producao ? (
                            <div className="space-y-4">
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
                                    producao={producao}
                                    bloqueado={bloqueado}
                                    actionLoading={actionLoading}
                                    podeImportar={podeImportar}
                                    podeFinalizarCarga={podeFinalizarCarga}
                                    podeIniciar={podeIniciar}
                                    podePausar={podePausar}
                                    podeRetomar={podeRetomar}
                                    podeFinalizarAvaliacao={podeFinalizarAvaliacao}
                                    podeCancelar={podeCancelar}
                                    onImportar={() => setImportarModalOpen(true)}
                                    onFinalizarCarga={finalizarCarga}
                                    onIniciar={iniciarProducao}
                                    onPausar={pausarProducao}
                                    onRetomar={retomarProducao}
                                    onFinalizarAvaliacao={finalizarAvaliacao}
                                    onCancelar={() => {
                                        setConfirmacaoAcao(null);
                                        setCancelamentoOpen(true);
                                    }}
                                />

                                {confirmacaoAcao && (
                                    <ConfirmacaoAcaoBox
                                        titulo={confirmacaoAcao.titulo}
                                        mensagem={confirmacaoAcao.mensagem}
                                        confirmarLabel={
                                            confirmacaoAcao.confirmarLabel
                                        }
                                        destaque={
                                            confirmacaoAcao.destaque
                                        }
                                        loading={
                                            actionLoading ===
                                            confirmacaoAcao.tipo
                                        }
                                        onConfirmar={
                                            confirmarAcaoProducao
                                        }
                                        onFechar={() =>
                                            setConfirmacaoAcao(null)
                                        }
                                    />
                                )}

                                {podeCancelar && cancelamentoOpen && (
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
                                    producaoStatus={producao.status}
                                    actionLoading={actionLoading}
                                    podeGerenciarRetrabalho={podeGerenciarRetrabalho}
                                    onMarcarRetrabalho={marcarRetrabalho}
                                    onDesmarcarRetrabalho={desmarcarRetrabalho}
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

            { podeImportar && (
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
            )}
        </>
    );
}

function InformacoesProducao({
                                 producao,
                             }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-bold text-slate-900">
                Informações da produção
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
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
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-red-600">
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
            iconClass: "bg-blue-500",
        },
        {
            label: "Aguardando validação",
            valor:
            resumo.aguardandoValidacao,
            iconClass: "bg-amber-500",
        },
        {
            label: "Retrabalho",
            valor: resumo.retrabalho,
            iconClass: "bg-orange-500",
        },
        {
            label: "Concluídos",
            valor: resumo.concluidos,
            iconClass: "bg-emerald-500",
        },
        {
            label: "Erros",
            valor: resumo.erros,
            iconClass: "bg-red-500",
        },
    ];

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-5">
                {cards.map((card, index) => (
                    <div
                        key={card.label}
                        className={`flex items-center gap-3 px-4 py-3.5 ${
                            index >= 2
                                ? "sm:border-t sm:border-slate-100 xl:border-t-0"
                                : ""
                        }`}
                    >
                        <span className={`h-2 w-2 shrink-0 rounded-full ${card.iconClass}`} />

                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                {card.label}
                            </p>

                            <p className="mt-0.5 text-lg font-bold text-slate-900">
                                {card.valor}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function AcoesProducao({
                           producao,
                           bloqueado,
                           actionLoading,
                           podeImportar,
                           podeFinalizarCarga,
                           podeIniciar,
                           podePausar,
                           podeRetomar,
                           podeFinalizarAvaliacao,
                           podeCancelar,
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

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-bold text-slate-900">
                Ações disponíveis
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
                {status === "AGUARDANDO_DADOS" && (
                    <>
                        {podeImportar && (
                            <ActionButton
                                icon={FileUp}
                                label="Importar itens"
                                onClick={onImportar}
                                disabled={bloqueado}
                            />
                        )}

                        {podeFinalizarCarga && (
                            <ActionButton
                                icon={CheckCircle2}
                                label="Finalizar carga"
                                onClick={
                                    onFinalizarCarga
                                }
                                loading={
                                    actionLoading ===
                                    "FINALIZAR_CARGA"
                                }
                                disabled={bloqueado}
                                color="green"
                            />
                        )}
                    </>
                )}

                {status === "PRONTA" &&
                    podeIniciar && (
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

                {podePausar &&
                    [
                        "EM_ANDAMENTO",
                        "EM_RETRABALHO",
                    ].includes(status) && (
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

                {status === "PAUSADA" &&
                    podeRetomar && (
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
                    "AGUARDANDO_AVALIACAO" &&
                    podeFinalizarAvaliacao && (
                        <ActionButton
                            icon={CheckCircle2}
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

                {podeCancelar &&
                    [
                        "AGUARDANDO_DADOS",
                        "PRONTA",
                        "PAUSADA",
                    ].includes(status) && (
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
                        itens = [],
                        producaoStatus,
                        actionLoading,
                        podeGerenciarRetrabalho,
                        onMarcarRetrabalho,
                        onDesmarcarRetrabalho,
                    }) {
    const permiteAcoes =
        podeGerenciarRetrabalho &&
        producaoStatus ===
        "AGUARDANDO_AVALIACAO";

    const columns = [
        {
            key: "sequencia",
            header: "Sequência",
            width: "7rem",
            render: (item) => (
                <span className="font-bold tabular-nums text-slate-900">
                    {item.sequencia ?? "—"}
                </span>
            ),
        },
        {
            key: "referencia",
            header: "Referência",
            width: "12rem",
            render: (item) => (
                <TablePrimaryText
                    title={
                        item.referenciaExterna
                    }
                >
                    {item.referenciaExterna ||
                        "Sem referência"}
                </TablePrimaryText>
            ),
        },
        {
            key: "valores",
            header: "Valores",
            width: "26rem",
            render: (item) => (
                <ValoresItem
                    valores={item.valores}
                />
            ),
        },
        {
            key: "status",
            header: "Status",
            width: "15rem",
            render: (item) => (
                <div>
                    <StatusBadge
                        status={item.status}
                        statusMap={
                            producaoItemStatusMap
                        }
                        showDot
                    />

                    {item.mensagemErro && (
                        <p
                            className="mt-1.5 max-w-xs text-[10px] leading-4 text-red-600"
                            title={
                                item.mensagemErro
                            }
                        >
                            {item.mensagemErro}
                        </p>
                    )}
                </div>
            ),
        },
        {
            key: "impressao",
            header: "Impressão",
            width: "11rem",
            render: (item) => (
                <TableText className="whitespace-nowrap">
                    {formatarData(
                        item.impressoEm
                    )}
                </TableText>
            ),
        },
    ];

    if (permiteAcoes) {
        columns.push({
            key: "acoes",
            header: "Ações",
            type: "actions",
            align: "right",
            width: "7rem",
            render: (item) => {
                const marcando =
                    actionLoading ===
                    `MARCAR-${item.id}`;

                const desmarcando =
                    actionLoading ===
                    `DESMARCAR-${item.id}`;

                if (
                    item.status ===
                    "AGUARDANDO_VALIDACAO"
                ) {
                    return (
                        <TableActions>
                            <TableActionButton
                                title="Marcar para retrabalho"
                                aria-label={`Marcar item ${item.sequencia} para retrabalho`}
                                variant="warning"
                                disabled={Boolean(
                                    actionLoading
                                )}
                                onClick={() =>
                                    onMarcarRetrabalho?.(
                                        item
                                    )
                                }
                            >
                                {marcando ? (
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Wrench
                                        size={14}
                                    />
                                )}
                            </TableActionButton>
                        </TableActions>
                    );
                }

                if (
                    item.status ===
                    "AGUARDANDO_RETRABALHO"
                ) {
                    return (
                        <TableActions>
                            <TableActionButton
                                title="Desmarcar retrabalho"
                                aria-label={`Desmarcar retrabalho do item ${item.sequencia}`}
                                disabled={Boolean(
                                    actionLoading
                                )}
                                onClick={() =>
                                    onDesmarcarRetrabalho?.(
                                        item
                                    )
                                }
                            >
                                {desmarcando ? (
                                    <Loader2
                                        size={14}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <RotateCcw
                                        size={14}
                                    />
                                )}
                            </TableActionButton>
                        </TableActions>
                    );
                }

                return (
                    <span className="text-[10px] text-slate-400">
                        —
                    </span>
                );
            },
        });
    }

    return (
        <section>
            <div className="rounded-t-xl border border-b-0 border-slate-200 bg-white px-4 py-3.5">
                <h3 className="text-sm font-bold text-slate-900">
                    Itens da produção
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                    {itens.length}{" "}
                    {itens.length === 1
                        ? "item encontrado"
                        : "itens encontrados"}
                </p>
            </div>

            <div className="[&>div]:rounded-t-none">
                <DataTable
                    columns={columns}
                    data={itens}
                    minWidth="62rem"
                    rowKey={(item) =>
                        item.id
                    }
                    emptyIcon={FileUp}
                    emptyTitle="Nenhum item importado"
                    emptyDescription="Importe os dados da produção para visualizar os itens."
                />
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
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
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
                    className="h-10 rounded-xl border border-red-200 bg-white px-3.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
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
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-3.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
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
                inline-flex h-10 items-center
                gap-2 rounded-xl border bg-white
                px-3.5 text-xs font-semibold
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
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

function validarPermissao(
    permitido
) {
    if (permitido) {
        return true;
    }

    toast.error(
        "Você não possui permissão para realizar esta operação."
    );

    return false;
}


function ConfirmacaoAcaoBox({
                                titulo,
                                mensagem,
                                confirmarLabel,
                                destaque = "blue",
                                loading,
                                onConfirmar,
                                onFechar,
                            }) {
    const estilo =
        destaque === "amber"
            ? {
                container:
                    "border-amber-200 bg-amber-50",
                icone:
                    "bg-amber-100 text-amber-700",
                titulo:
                    "text-amber-950",
                texto:
                    "text-amber-800",
                botao:
                    "bg-amber-600 hover:bg-amber-700 focus:ring-amber-200",
            }
            : {
                container:
                    "border-blue-200 bg-blue-50",
                icone:
                    "bg-blue-100 text-blue-700",
                titulo:
                    "text-blue-950",
                texto:
                    "text-blue-800",
                botao:
                    "bg-blue-600 hover:bg-blue-700 focus:ring-blue-200",
            };

    return (
        <section
            className={`
                rounded-2xl border p-4
                ${estilo.container}
            `}
        >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                    <div
                        className={`
                            flex h-11 w-11 shrink-0
                            items-center justify-center
                            rounded-2xl
                            ${estilo.icone}
                        `}
                    >
                        <CirclePause size={21} />
                    </div>

                    <div>
                        <h3
                            className={`
                                text-sm font-bold
                                ${estilo.titulo}
                            `}
                        >
                            {titulo}
                        </h3>

                        <p
                            className={`
                                mt-1 max-w-3xl text-sm
                                leading-6
                                ${estilo.texto}
                            `}
                        >
                            {mensagem}
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onFechar}
                        disabled={loading}
                        className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Voltar
                    </button>

                    <button
                        type="button"
                        onClick={onConfirmar}
                        disabled={loading}
                        className={`
                            inline-flex h-10 items-center
                            justify-center gap-2 rounded-xl
                            px-5 text-sm font-semibold
                            text-white transition
                            focus:outline-none focus:ring-4
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                            ${estilo.botao}
                        `}
                    >
                        {loading && (
                            <Loader2
                                size={17}
                                className="animate-spin"
                            />
                        )}

                        {loading
                            ? "Processando..."
                            : confirmarLabel}
                    </button>
                </div>
            </div>
        </section>
    );
}

export default ProducaoDetalhesModal;
