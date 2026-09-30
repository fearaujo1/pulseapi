import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    CheckCircle2,
    ClipboardList,
    Clock3,
    Plus,
    RefreshCw,
    Search,
    Wrench,
} from "lucide-react";

import toast from "react-hot-toast";

import Topbar from "../components/layout/Topbar.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import ContentCard from "../components/common/ContentCard.jsx";
import SummaryCard from "../components/common/SummaryCard.jsx";

import ProducoesTable from "../components/production/ProducoesTable.jsx";
import ProducaoFormModal from "../components/production/ProducaoFormModal.jsx";
import ProducaoDetalhesModal from "../components/production/ProducaoDetalhesModal.jsx";

import {
    producaoStatusMap,
} from "../components/production/producaoStatusMap.js";

import {
    producaoService,
} from "../services/producaoService.js";

function ProducoesPage() {
    const [producoes, setProducoes] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

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

    const STATUS_FINALIZADOS = [
        "CONCLUIDA",
        "CANCELADA",
    ];

    const [
        producaoSelecionadaId,
        setProducaoSelecionadaId,
    ] = useState(null);

    const carregarProducoes =
        useCallback(async (
            showLoading = true
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

                setProducoes([]);

                toast.error(
                    error?.response?.data?.detail ||
                    "Não foi possível carregar as produções."
                );
            } finally {
                if (showLoading) {
                    setLoading(false);
                }
            }
        }, []);

    useEffect(() => {
        const intervaloId =
            window.setInterval(() => {
                carregarProducoes(false);
            },
                5000
            );

        return () => {
            window.clearInterval(intervaloId);
        };
    }, [carregarProducoes]);

    const producoesFiltradas =
        useMemo(() => {
            const termo =
                busca
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
                        producao.equipamentoPrincipalNome
                            ?.toLowerCase()
                            .includes(termo) ||
                        producao.equipamentoRetrabalhoNome
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

    function alterarVisualizacao(
        novaVisualizacao
    ) {
        setVisualizacao(
            novaVisualizacao
        );

        setStatus("");
    }

    const total =
        producoes.length;

    const emAndamento =
        contarStatus(
            producoes,
            "EM_ANDAMENTO"
        );

    const aguardandoAvaliacao =
        contarStatus(
            producoes,
            "AGUARDANDO_AVALIACAO"
        );

    const emRetrabalho =
        contarStatus(
            producoes,
            "EM_RETRABALHO"
        );

    const concluidas =
        contarStatus(
            producoes,
            "CONCLUIDA"
        );

    function selecionarProducao(
        producao
    ) {
        setProducaoSelecionadaId(
            producao.id
        );
    }

    function abrirNovaProducao() {
        setIsFormOpen(true);
    }

    async function cadastrarProducao(
        payload
    ) {
        try {
            setSubmitLoading(true);

            const novaProducao =
                await producaoService.cadastrar(
                    payload
                );

            setProducoes((anteriores) => [
                novaProducao,
                ...anteriores,
            ]);

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

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="w-full p-4 md:p-6">
                <PageHeader
                    title="Controle de Produções"
                    description="Gerencie ordens, itens, impressão e retrabalho"
                >
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                            type="button"
                            onClick={() =>
                                carregarProducoes(true)
                            }
                            disabled={loading}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw
                                size={17}
                                className={
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Atualizar
                        </button>

                        <button
                            type="button"
                            onClick={
                                abrirNovaProducao
                            }
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            <Plus size={17} />
                            Nova produção
                        </button>
                    </div>
                </PageHeader>

                <section className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
                    <SummaryCard
                        title="Total"
                        value={total}
                        subtitle="Ordens cadastradas"
                        icon={
                            <ClipboardList
                                size={26}
                                className="text-blue-600"
                            />
                        }
                        className="border-blue-200 bg-blue-50"
                    />

                    <SummaryCard
                        title="Em andamento"
                        value={emAndamento}
                        subtitle="Produções em execução"
                        icon={
                            <Clock3
                                size={26}
                                className="text-violet-600"
                            />
                        }
                        className="border-violet-200 bg-violet-50"
                    />

                    <SummaryCard
                        title="Em avaliação"
                        value={aguardandoAvaliacao}
                        subtitle="Aguardando validação"
                        icon={
                            <ClipboardList
                                size={26}
                                className="text-amber-600"
                            />
                        }
                        className="border-amber-200 bg-amber-50"
                    />

                    <SummaryCard
                        title="Em retrabalho"
                        value={emRetrabalho}
                        subtitle="Itens para reimpressão"
                        icon={
                            <Wrench
                                size={26}
                                className="text-orange-600"
                            />
                        }
                        className="border-orange-200 bg-orange-50"
                    />

                    <SummaryCard
                        title="Concluídas"
                        value={concluidas}
                        subtitle="Produções finalizadas"
                        icon={
                            <CheckCircle2
                                size={26}
                                className="text-green-600"
                            />
                        }
                        className="border-green-200 bg-green-50"
                    />
                </section>

                <ContentCard
                    title="Ordens de Produção"
                    subtitle={`${producoesFiltradas.length} registro(s) encontrado(s)`}
                >
                    {/* ====================================== */}
                    {/* SELETOR: EM ANDAMENTO / HISTÓRICO     */}
                    {/* ====================================== */}

                    <div className="mb-5 flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                                Visualização
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Alterne entre produções atuais e histórico.
                            </p>
                        </div>

                        <div className="inline-flex w-full rounded-xl border border-slate-200 bg-slate-100 p-1 sm:w-fit">
                            <button
                                type="button"
                                onClick={() =>
                                    alterarVisualizacao(
                                        "ATIVAS"
                                    )
                                }
                                className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none${
                                    visualizacao === "ATIVAS"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                    }
                                `}
                            >
                                Em andamento
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    alterarVisualizacao(
                                        "HISTORICO"
                                    )
                                }
                                className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none ${
                                    visualizacao === "HISTORICO"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                    }
                                `}
                            >
                                Concluídas e canceladas
                            </button>
                        </div>
                    </div>

                    {/* ====================================== */}
                    {/* FILTROS                                */}
                    {/* ====================================== */}

                    <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_16rem]">
                        <div className="flex h-11 min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white">
                            <Search
                                size={17}
                                className="shrink-0 text-slate-400"
                            />

                            <input
                                type="search"
                                value={busca}
                                onChange={(event) =>
                                    setBusca(
                                        event.target.value
                                    )
                                }
                                placeholder="Buscar por ordem, linha ou equipamento..."
                                className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target.value
                                )
                            }
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500"
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
                    </div>

                    {/* ====================================== */}
                    {/* TABELA                                 */}
                    {/* ====================================== */}

                    <ProducoesTable
                        producoes={producoesFiltradas}
                        loading={loading}
                        onSelect={selecionarProducao}
                    />
                </ContentCard>
            </main>

            <ProducaoFormModal
                isOpen={isFormOpen}
                onClose={() => {
                    if (!submitLoading) {
                        setIsFormOpen(false);
                    }
                }}
                onSubmit={cadastrarProducao}
                submitLoading={submitLoading}
            />

            <ProducaoDetalhesModal
                isOpen={
                    producaoSelecionadaId !== null
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
                    carregarProducoes(false)
                }
            />
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