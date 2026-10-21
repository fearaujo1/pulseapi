import {useCallback, useEffect, useMemo, useState} from "react";
import { ChevronDown, ClipboardCheck,ClipboardList, Clock3, History, Plus, Radio, Search, Wrench, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext.jsx";
import { ACOES, podeExecutar } from "../config/accessControl.js";
import Topbar from "../components/layout/Topbar.jsx";
import ProducoesTable from "../components/production/ProducoesTable.jsx";
import ProducaoFormModal from "../components/production/ProducaoFormModal.jsx";
import ProducaoDetalhesModal from "../components/production/ProducaoDetalhesModal.jsx";
import { producaoStatusMap } from "../config/statusMaps.js";
import { producaoService } from "../services/producaoService.js";
import SummaryCard from "../components/common/SummaryCard.jsx";
import Pagination from "../components/common/Pagination.jsx";
import usePagination from "../hooks/usePagination.js";

const STATUS_FINALIZADOS = [
    "CONCLUIDA",
    "CANCELADA",
];

function ProducoesPage() {
    const { usuario } = useAuth();

    const podeCriar = podeExecutar(
        usuario?.perfil,
        ACOES.PRODUCAO_CRIAR
    );

    const [producoes, setProducoes] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [busca, setBusca] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [isFormOpen, setIsFormOpen] =
        useState(false);

    const [submitLoading, setSubmitLoading] =
        useState(false);

    const [visualizacao, setVisualizacao] =
        useState("ATIVAS");

    const [
        producaoSelecionadaId,
        setProducaoSelecionadaId,
    ] = useState(null);

    const carregarProducoes = useCallback(
        async (
            showLoading = true,
            showError = true
        ) => {
            try {
                if (showLoading) {
                    setLoading(true);
                }

                const data =
                    await producaoService.listar();

                setProducoes(
                    Array.isArray(data)
                        ? data
                        : []
                );
            } catch (error) {
                console.error(
                    "Erro ao carregar produções:",
                    error
                );

                if (showLoading) {
                    setProducoes([]);
                }

                if (showError) {
                    toast.error(
                        error.response?.data?.detail ||
                        error.response?.data?.message ||
                        "Não foi possível carregar as produções."
                    );
                }
            } finally {
                if (showLoading) {
                    setLoading(false);
                }
            }
        },
        []
    );

    const atualizarManualmente =
        useCallback(async () => {
            try {
                setRefreshing(true);

                await carregarProducoes(
                    false,
                    true
                );
            } finally {
                setRefreshing(false);
            }
        }, [carregarProducoes]);

    useEffect(() => {
        carregarProducoes(
            true,
            true
        );

        const intervaloId =
            window.setInterval(
                () => {
                    carregarProducoes(
                        false,
                        false
                    );
                },
                5000
            );

        return () => {
            window.clearInterval(
                intervaloId
            );
        };
    }, [carregarProducoes]);

    const producoesFiltradas =
        useMemo(() => {
            const termo = busca
                .trim()
                .toLowerCase();

            return producoes.filter(
                (producao) => {
                    const finalizada =
                        STATUS_FINALIZADOS.includes(
                            producao.status
                        );

                    const correspondeVisualizacao =
                        visualizacao === "HISTORICO"
                            ? finalizada
                            : !finalizada;

                    const correspondeStatus =
                        !status ||
                        producao.status === status;

                    const correspondeBusca =
                        !termo ||
                        producao.codigoOrdem
                            ?.toLowerCase()
                            .includes(termo) ||
                        producao.linhaNome
                            ?.toLowerCase()
                            .includes(termo) ||
                        producao
                            .equipamentoPrincipalNome
                            ?.toLowerCase()
                            .includes(termo) ||
                        producao
                            .equipamentoRetrabalhoNome
                            ?.toLowerCase()
                            .includes(termo);

                    return (
                        correspondeVisualizacao &&
                        correspondeStatus &&
                        correspondeBusca
                    );
                }
            );
        }, [
            producoes,
            busca,
            status,
            visualizacao,
        ]);

    const {
        currentPage,
        totalPages,
        paginatedItems:
            producoesPaginadas,
        setCurrentPage,
        resetPage,
    } = usePagination(
        producoesFiltradas,
        10
    );

    const statusDisponiveis =
        useMemo(() => {
            return Object.entries(
                producaoStatusMap
            ).filter(([value]) => {
                const finalizado =
                    STATUS_FINALIZADOS.includes(
                        value
                    );

                return visualizacao === "HISTORICO"
                    ? finalizado
                    : !finalizado;
            });
        }, [visualizacao]);

    const possuiFiltros =
        Boolean(busca.trim() || status);

    function informarAcessoNegado() {
        toast.error(
            "Você não possui permissão para realizar esta operação."
        );
    }

    function alterarVisualizacao(
        novaVisualizacao
    ) {
        setVisualizacao(
            novaVisualizacao
        );

        setStatus("");
        resetPage();
    }

    function limparFiltros() {
        setBusca("");
        setStatus("");
        resetPage();
    }

    function selecionarProducao(
        producao
    ) {
        if (!producao?.id) {
            return;
        }

        setProducaoSelecionadaId(
            producao.id
        );
    }

    function abrirNovaProducao() {
        if (!podeCriar) {
            informarAcessoNegado();
            return;
        }

        setIsFormOpen(true);
    }

    function fecharFormulario() {
        if (submitLoading) {
            return;
        }

        setIsFormOpen(false);
    }

    async function cadastrarProducao(
        payload
    ) {
        if (!podeCriar) {
            informarAcessoNegado();
            return;
        }

        try {
            setSubmitLoading(true);

            const novaProducao =
                await producaoService
                    .cadastrar(payload);

            setProducoes(
                (anteriores) => [
                    novaProducao,
                    ...anteriores,
                ]
            );

            setIsFormOpen(false);

            toast.success(
                "Produção cadastrada com sucesso!"
            );
        } catch (error) {
            console.error(
                "Erro ao cadastrar produção:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Não foi possível cadastrar a produção."
            );
        } finally {
            setSubmitLoading(false);
        }
    }

    const indicadoresProducao = useMemo(() => {
        return [
            {label: "Total", value: producoes.length, detail: "Ordens cadastradas", icon: ClipboardList, color:"bg-blue-50 text-blue-600" },
            {label: "Em andamento", value: contarStatus(producoes,"EM_ANDAMENTO"), detail: "Produções em execução", icon: Clock3, color:"bg-emerald-50 text-emerald-600" },
            {label: "Em avaliação", value: contarStatus(producoes, "AGUARDANDO_AVALIACAO"), detail: "Aguardando validação", icon: ClipboardCheck, color: "bg-amber-50 text-amber-600" },
            {label: "Em retrabalho", value: contarStatus(producoes, "EM_RETRABALHO"), detail: "Itens para reimpressão", icon: Wrench, color: "bg-orange-50 text-orange-600" },
        ];
    }, [producoes]);

    return (
        <div className="min-h-screen bg-[#f4f6f9]">
            <Topbar />

            <main className="mx-auto w-full max-w-[1800px] px-4 py-5 md:px-6 lg:px-8">
                <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>

                        <h1 className="text-[26px] font-bold tracking-[-0.025em] text-slate-950 md:text-[30px]">
                            Controle de produções
                        </h1>

                        <p className="mt-1 text-[13px] text-slate-500">
                            Gerencie ordens, dados de
                            impressão, avaliação e
                            retrabalho.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">

                        {podeCriar && (
                            <button
                                type="button"
                                onClick={
                                    abrirNovaProducao
                                }
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
                            >
                                <Plus size={16} />
                                Nova produção
                            </button>
                        )}
                    </div>
                </header>

                <SummaryCard
                    items={indicadoresProducao}
                />

                <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                    <header className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                <ClipboardList
                                    size={17}
                                />
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm font-bold text-slate-900">
                                        Ordens de produção
                                    </h2>

                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-slate-100 px-1.5 text-[10px] font-bold text-slate-600">
                                        {
                                            producoesFiltradas.length
                                        }
                                    </span>
                                </div>

                                <p className="mt-0.5 text-[11px] text-slate-500">
                                    Selecione uma ordem para
                                    consultar ou operar.
                                </p>
                            </div>
                        </div>

                        <ViewTabs
                            value={visualizacao}
                            onChange={
                                alterarVisualizacao
                            }
                        />
                    </header>

                    <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 lg:px-5">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                            <div className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-blue-400 focus-within:ring-3 focus-within:ring-blue-100">
                                <Search
                                    size={16}
                                    className="shrink-0 text-slate-400"
                                />

                                <input
                                    type="search"
                                    value={busca}
                                    onChange={(event) => {
                                        setBusca(event.target.value);
                                        resetPage();
                                    }}
                                    placeholder="Buscar por ordem, linha ou equipamento"
                                    className="min-w-0 flex-1 bg-transparent text-xs text-slate-700 outline-none focus:outline-none focus-visible:outline-none placeholder:text-slate-400"
                                />

                                {busca && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setBusca("");
                                            resetPage();
                                        }}
                                        className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                        aria-label="Limpar busca"
                                    >
                                        <X
                                            size={14}
                                        />
                                    </button>
                                )}
                            </div>

                            <div className="relative w-full lg:w-60">
                                <select
                                    value={status}
                                    onChange={(event) => {
                                        setStatus(event.target.value)
                                        resetPage();
                                    }}
                                    className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-10 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
                                >
                                    <option value="">
                                        Todos os status
                                    </option>

                                    {statusDisponiveis.map(
                                        ([
                                             value,
                                             config,
                                        ]) => (
                                            <option
                                                key={value}
                                                value={value}
                                            >
                                                {config.label}
                                            </option>
                                        )
                                    )}
                                </select>

                                <ChevronDown
                                    size={15}
                                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                            </div>

                            {possuiFiltros && (
                                <button
                                    type="button"
                                    onClick={
                                        limparFiltros
                                    }
                                    className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X size={14} />
                                    Limpar filtros
                                </button>
                            )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-[10px] text-slate-400">
                                {
                                    producoesFiltradas.length
                                }{" "}
                                {producoesFiltradas.length ===
                                1
                                    ? "registro encontrado"
                                    : "registros encontrados"}
                            </p>

                            <div className="hidden items-center gap-1.5 text-[10px] text-slate-400 sm:flex">
                                <Radio size={11} />
                                Atualização a cada 5 segundos
                            </div>
                        </div>
                    </div>

                    <div className="p-3 lg:p-4">
                        <ProducoesTable
                            producoes={
                                producoesPaginadas
                            }
                            loading={loading}
                            onSelect={
                                selecionarProducao
                            }
                        />

                        {!loading &&
                            totalPages > 1 && (
                                <Pagination
                                    currentPage={
                                        currentPage
                                    }
                                    totalPages={
                                        totalPages
                                    }
                                    onPageChange={
                                        setCurrentPage
                                    }
                                />
                            )}
                    </div>
                </section>
            </main>

            {podeCriar && (
                <ProducaoFormModal
                    isOpen={isFormOpen}
                    onClose={
                        fecharFormulario
                    }
                    onSubmit={
                        cadastrarProducao
                    }
                    submitLoading={
                        submitLoading
                    }
                />
            )}

            <ProducaoDetalhesModal
                isOpen={
                    producaoSelecionadaId !==
                    null
                }
                producaoId={
                    producaoSelecionadaId
                }
                onClose={() =>
                    setProducaoSelecionadaId(
                        null
                    )
                }
                onUpdated={() =>
                    carregarProducoes(
                        false,
                        true
                    )
                }
            />
        </div>
    );
}

function ViewTabs({
                      value,
                      onChange,
                  }) {
    return (
        <div className="inline-flex w-full rounded-xl border border-slate-200 bg-slate-100 p-1 sm:w-fit">
            <button
                type="button"
                onClick={() =>
                    onChange("ATIVAS")
                }
                className={`
                    inline-flex flex-1 items-center justify-center
                    gap-2 whitespace-nowrap rounded-lg
                    px-3.5 py-2 text-xs font-semibold
                    transition sm:flex-none
                    ${
                    value === "ATIVAS"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                }
                `}
            >
                <Clock3 size={14} />
                Produções atuais
            </button>

            <button
                type="button"
                onClick={() =>
                    onChange("HISTORICO")
                }
                className={`
                    inline-flex flex-1 items-center justify-center
                    gap-2 whitespace-nowrap rounded-lg
                    px-3.5 py-2 text-xs font-semibold
                    transition sm:flex-none
                    ${
                    value === "HISTORICO"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                }
                `}
            >
                <History size={14} />
                Histórico
            </button>
        </div>
    );
}

function contarStatus(
    producoes,
    status
) {
    return producoes.filter(
        (producao) =>
            producao.status === status
    ).length;
}

export default ProducoesPage;