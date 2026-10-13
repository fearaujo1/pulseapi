import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Activity,
    AlertTriangle,
    ClipboardList,
    Droplets,
    Factory,
    Gauge,
    Loader2,
    PackageCheck,
    Plus,
    RefreshCw,
    Wifi,
    WifiOff,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import Topbar from "../components/layout/Topbar.jsx";
import SummaryCard from "../components/common/SummaryCard.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

import {
    dashboardService,
} from "../services/dashboardService.js";
import { websocketService } from "../services/websocketService.js";

const producaoStatusMap = {
    EM_ANDAMENTO: {
        label: "Em andamento",
        className:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
        progressClass: "bg-emerald-500",
    },

    PAUSADA: {
        label: "Pausada",
        className:
            "border-amber-200 bg-amber-50 text-amber-700",
        progressClass: "bg-amber-500",
    },

    AGUARDANDO_AVALIACAO: {
        label: "Aguardando avaliação",
        className:
            "border-violet-200 bg-violet-50 text-violet-700",
        progressClass: "bg-violet-500",
    },

    EM_RETRABALHO: {
        label: "Em retrabalho",
        className:
            "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
        progressClass: "bg-fuchsia-500",
    },
};

function DashboardPage() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [resumo, setResumo] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [erro, setErro] =
        useState("");

    const atualizacaoPendenteRef =
        useRef(null);

    const carregarResumo = useCallback(
        async ({
                   silencioso = false,
                   mostrarErro = true,
               } = {}) => {
            try {
                if (!silencioso) {
                    setLoading(true);
                }

                const dados =
                    await dashboardService.buscarResumo();

                setResumo(dados);
                setErro("");
            } catch (error) {
                console.error(
                    "Erro ao carregar Dashboard:",
                    error
                );

                if (mostrarErro) {
                    setErro(
                        error.response?.data?.detail ||
                        error.response?.data?.message ||
                        "Não foi possível carregar o Dashboard."
                    );
                }
            } finally {
                if (!silencioso) {
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

                await carregarResumo({
                    silencioso: true,
                    mostrarErro: true,
                });
            } finally {
                setRefreshing(false);
            }
        }, [carregarResumo]);

    useEffect(() => {
        carregarResumo({
            mostrarErro: true,
        });
    }, [carregarResumo]);

    useEffect(() => {
        if (!token) {
            return undefined;
        }

        let componenteAtivo = true;

        const client =
            websocketService.conectarDashboard({
                token,

                onAtualizacao: (evento) => {
                    if (!componenteAtivo) {
                        return;
                    }

                    console.debug(
                        "Atualização recebida pelo Dashboard:",
                        evento
                    );

                    /*
                     * Um pequeno debounce impede várias consultas REST
                     * seguidas quando diversos itens são impressos
                     * em um intervalo muito curto.
                     */
                    if (atualizacaoPendenteRef.current) {
                        clearTimeout(
                            atualizacaoPendenteRef.current
                        );
                    }

                    atualizacaoPendenteRef.current =
                        setTimeout(() => {
                            if (componenteAtivo) {
                                carregarResumo({
                                    silencioso: true,
                                    mostrarErro: false,
                                });
                            }
                        }, 400);
                },

                onConectado: () => {
                    console.info(
                        "Dashboard conectado às atualizações em tempo real."
                    );
                },

                onDesconectado: () => {
                    console.warn(
                        "Dashboard desconectado das atualizações em tempo real."
                    );
                },

                onErro: (mensagem) => {
                    console.error(
                        "Atualização em tempo real indisponível:",
                        mensagem
                    );
                },
            });

        return () => {
            componenteAtivo = false;

            if (atualizacaoPendenteRef.current) {
                clearTimeout(
                    atualizacaoPendenteRef.current
                );

                atualizacaoPendenteRef.current = null;
            }

            websocketService.desconectar(client);
        };
    }, [token, carregarResumo]);

    useEffect(() => {
        const intervalo = setInterval(() => {
            carregarResumo({
                silencioso: true,
                mostrarErro: false,
            });
        }, 60000);

        return () => {
            clearInterval(intervalo);
        };
    }, [carregarResumo]);

    const alertas =
        useMemo(() => {
            if (!resumo) {
                return [];
            }

            const novosAlertas = [];

            for (
                const producao of
            resumo.producoes || []
                ) {
                const equipamento =
                    resumo.equipamentos?.find(
                        (item) =>
                            item.equipamentoId
                            === producao.equipamentoId
                    );

                if (
                    producao.status ===
                    "EM_ANDAMENTO" &&
                    equipamento?.statusConexao !==
                    "CONECTADO"
                ) {
                    novosAlertas.push({
                        id:
                            `producao-${producao.producaoId}`,
                        tipo: "danger",
                        titulo:
                            "Produção em andamento sem conexão",
                        descricao:
                            `${producao.codigoOrdem} está vinculada ao equipamento ${producao.equipamentoNome}, que está sem conexão.`,
                    });
                }
            }

            for (
                const equipamento of
            resumo.equipamentos || []
                ) {
                if (
                    equipamento
                        .consultaLiquidosDisponivel &&
                    equipamento.tinta
                        ?.sensorConectado &&
                    equipamento.tinta
                        ?.percentualMaximo <= 24
                ) {
                    novosAlertas.push({
                        id:
                            `tinta-${equipamento.equipamentoId}`,
                        tipo: "danger",
                        titulo: "Nível de tinta baixo",
                        descricao:
                            `${equipamento.equipamentoNome}: ${equipamento.tinta.descricao}.`,
                    });
                }

                if (
                    equipamento
                        .consultaLiquidosDisponivel &&
                    equipamento.makeup
                        ?.sensorConectado &&
                    equipamento.makeup
                        ?.percentualMaximo <= 24
                ) {
                    novosAlertas.push({
                        id:
                            `makeup-${equipamento.equipamentoId}`,
                        tipo: "warning",
                        titulo: "Nível de make-up baixo",
                        descricao:
                            `${equipamento.equipamentoNome}: ${equipamento.makeup.descricao}.`,
                    });
                }
            }

            return novosAlertas;
        }, [resumo]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7fb]">
                <Topbar />

                <main className="flex min-h-[70vh] items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                        <Loader2
                            size={30}
                            className="animate-spin text-blue-600"
                        />

                        <p className="text-sm font-medium">
                            Carregando dashboard...
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    const producoes =
        resumo?.producoes || [];

    const equipamentos =
        resumo?.equipamentos || [];

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="p-4 md:p-6">
                <header className="mb-7 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                            Dashboard de Produção
                        </h1>

                        <p className="mt-1 text-sm text-slate-600 md:text-base">
                            Acompanhamento das produções e equipamentos em tempo real
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={atualizarManualmente}
                        disabled={refreshing}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={17}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        {refreshing
                            ? "Atualizando..."
                            : "Atualizar"}
                    </button>
                </header>

                {erro && (
                    <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle
                                size={20}
                                className="mt-0.5 shrink-0 text-red-600"
                            />

                            <div>
                                <p className="font-semibold text-red-700">
                                    Falha na atualização
                                </p>

                                <p className="mt-1 text-sm text-red-600">
                                    {erro}
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {alertas.length > 0 && (
                    <section className="mb-7 space-y-3">
                        {alertas.map((alerta) => (
                            <DashboardAlert
                                key={alerta.id}
                                alerta={alerta}
                            />
                        ))}
                    </section>
                )}

                <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Produções Ativas"
                        value={
                            resumo
                                ?.quantidadeProducoesAtivas ??
                            0
                        }
                        subtitle="Em execução ou avaliação"
                        icon={
                            <ClipboardList
                                size={30}
                                className="text-blue-600"
                            />
                        }
                        className="border-blue-200 bg-blue-50"
                    />

                    <SummaryCard
                        title="Progresso Geral"
                        value={
                            `${formatarPercentual(
                                resumo
                                    ?.percentualGeralProcessado
                            )}%`
                        }
                        subtitle={
                            `${resumo?.quantidadeItensProcessados ?? 0} de ${resumo?.quantidadeTotalItens ?? 0} itens`
                        }
                        icon={
                            <Activity
                                size={30}
                                className="text-emerald-600"
                            />
                        }
                        className="border-emerald-200 bg-emerald-50"
                    />

                    <SummaryCard
                        title="Equipamentos Conectados"
                        value={
                            `${resumo?.quantidadeEquipamentosConectados ?? 0}/${resumo?.quantidadeEquipamentosRelacionados ?? 0}`
                        }
                        subtitle="Associados às produções ativas"
                        icon={
                            <Wifi
                                size={30}
                                className="text-violet-600"
                            />
                        }
                        className="border-violet-200 bg-violet-50"
                    />

                    <SummaryCard
                        title="Itens Concluídos"
                        value={
                            resumo
                                ?.quantidadeItensConcluidos ??
                            0
                        }
                        subtitle="Finalizados após avaliação"
                        icon={
                            <PackageCheck
                                size={30}
                                className="text-slate-700"
                            />
                        }
                        className="border-slate-200 bg-white"
                    />
                </section>

                <section className="mb-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-950">
                                Progresso geral
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Percentual processado entre todas as produções ativas
                            </p>
                        </div>

                        <span className="text-2xl font-bold text-slate-950">
                            {formatarPercentual(
                                resumo
                                    ?.percentualGeralProcessado
                            )}
                            %
                        </span>
                    </div>

                    <ProgressBar
                        percentage={
                            resumo
                                ?.percentualGeralProcessado ??
                            0
                        }
                        className="bg-blue-600"
                        heightClass="h-3"
                    />

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                        <span>
                            Total:{" "}
                            <strong className="text-slate-900">
                                {resumo
                                        ?.quantidadeTotalItens ??
                                    0}
                            </strong>
                        </span>

                        <span>
                            Processados:{" "}
                            <strong className="text-slate-900">
                                {resumo
                                        ?.quantidadeItensProcessados ??
                                    0}
                            </strong>
                        </span>

                        <span>
                            Concluídos:{" "}
                            <strong className="text-slate-900">
                                {resumo
                                        ?.quantidadeItensConcluidos ??
                                    0}
                            </strong>
                        </span>
                    </div>
                </section>

                <section className="mb-9">
                    <SectionHeader
                        title="Produções ativas"
                        description="Progresso individual das ordens em execução, pausa, avaliação ou retrabalho"
                    />

                    {producoes.length === 0 ? (
                        <EmptyState
                            icon={ClipboardList}
                            title="Nenhuma produção ativa"
                            description="Não existem produções em andamento neste momento."
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                            {producoes.map(
                                (producao) => (
                                    <ProducaoCard
                                        key={
                                            producao.producaoId
                                        }
                                        producao={
                                            producao
                                        }
                                        onOpen={() =>
                                            navigate(
                                                "/producoes"
                                            )
                                        }
                                    />
                                )
                            )}
                        </div>
                    )}
                </section>

                <section>
                    <SectionHeader
                        title="Níveis das impressoras"
                        description="Tinta e make-up dos equipamentos associados às produções ativas"
                    />

                    {equipamentos.length === 0 ? (
                        <EmptyState
                            icon={Factory}
                            title="Nenhum equipamento relacionado"
                            description="Nenhuma impressora está associada às produções ativas."
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                            {equipamentos.map(
                                (equipamento) => (
                                    <EquipamentoCard
                                        key={
                                            equipamento.equipamentoId
                                        }
                                        equipamento={
                                            equipamento
                                        }
                                    />
                                )
                            )}
                        </div>
                    )}
                </section>

                <footer className="mt-8 text-right text-xs text-slate-400">
                    Última atualização:{" "}
                    {formatarDataHora(
                        resumo?.atualizadoEm
                    )}
                </footer>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/registrar-parada"
                        )
                    }
                    className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition hover:bg-blue-700"
                    title="Registrar ocorrência"
                    aria-label="Registrar ocorrência"
                >
                    <Plus size={27} />
                </button>
            </main>
        </div>
    );
}

function DashboardAlert({ alerta }) {
    const config = {
        danger: {
            container:
                "border-red-200 bg-red-50",
            icon: "text-red-600",
            title: "text-red-800",
            text: "text-red-700",
        },

        warning: {
            container:
                "border-amber-200 bg-amber-50",
            icon: "text-amber-600",
            title: "text-amber-800",
            text: "text-amber-700",
        },
    };

    const style =
        config[alerta.tipo] ||
        config.warning;

    return (
        <article
            className={`rounded-2xl border p-4 ${style.container}`}
        >
            <div className="flex items-start gap-3">
                <AlertTriangle
                    size={21}
                    className={`mt-0.5 shrink-0 ${style.icon}`}
                />

                <div>
                    <h2
                        className={`font-semibold ${style.title}`}
                    >
                        {alerta.titulo}
                    </h2>

                    <p
                        className={`mt-1 text-sm ${style.text}`}
                    >
                        {alerta.descricao}
                    </p>
                </div>
            </div>
        </article>
    );
}

function ProducaoCard({
                          producao,
                          onOpen,
                      }) {
    const status =
        producaoStatusMap[producao.status] || {
            label:
                producao.status ||
                "Não informado",
            className:
                "border-slate-200 bg-slate-100 text-slate-700",
            progressClass: "bg-slate-500",
        };

    const percentual =
        limitarPercentual(
            producao.percentualProcessado
        );

    return (
        <article className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Ordem de produção
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-slate-950">
                        {producao.codigoOrdem}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        {producao.linhaNome}
                        {" • "}
                        {producao.equipamentoNome}
                    </p>
                </div>

                <span
                    className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                >
                    {status.label}
                </span>
            </div>

            <div className="mt-7">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">
                        Itens processados
                    </span>

                    <span className="text-sm font-bold text-slate-900">
                        {formatarPercentual(
                            percentual
                        )}
                        %
                    </span>
                </div>

                <ProgressBar
                    percentage={percentual}
                    className={
                        status.progressClass
                    }
                    heightClass="h-2.5"
                />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <ProductionMetric
                    label="Total"
                    value={producao.quantidadeTotal}
                />

                <ProductionMetric
                    label="Processados"
                    value={
                        producao
                            .quantidadeProcessada
                    }
                />

                <ProductionMetric
                    label="Restantes"
                    value={
                        producao
                            .quantidadeRestante
                    }
                />

                <ProductionMetric
                    label="Concluídos"
                    value={
                        producao
                            .quantidadeConcluida
                    }
                />
            </div>

            <button
                type="button"
                onClick={onOpen}
                className="mt-5 text-sm font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
            >
                Abrir produções
            </button>
        </article>
    );
}

function ProductionMetric({
                              label,
                              value,
                          }) {
    return (
        <div className="rounded-xl bg-slate-50 px-3 py-3">
            <p className="text-xs text-slate-500">
                {label}
            </p>

            <p className="mt-1 font-bold text-slate-900">
                {value ?? 0}
            </p>
        </div>
    );
}

function EquipamentoCard({
                             equipamento,
                         }) {
    const conectado =
        equipamento.statusConexao ===
        "CONECTADO";

    return (
        <article className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <header className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        {equipamento.equipamentoCodigo}
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-slate-950">
                        {equipamento.equipamentoNome}
                    </h3>
                </div>

                <span
                    className={`
                        inline-flex items-center gap-2
                        rounded-full border px-3 py-1
                        text-xs font-semibold
                        ${
                        conectado
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                    }
                    `}
                >
                    {conectado ? (
                        <Wifi size={14} />
                    ) : (
                        <WifiOff size={14} />
                    )}

                    {conectado
                        ? "Conectado"
                        : "Sem conexão"}
                </span>
            </header>

            {equipamento
                .consultaLiquidosDisponivel ? (
                <div className="mt-7 space-y-6">
                    <LiquidLevel
                        label="Tinta"
                        level={equipamento.tinta}
                        icon={Gauge}
                        defaultColor="bg-slate-800"
                    />

                    <LiquidLevel
                        label="Make-up"
                        level={equipamento.makeup}
                        icon={Droplets}
                        defaultColor="bg-blue-500"
                    />
                </div>
            ) : (
                <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
                    <div className="flex items-start gap-3">
                        <WifiOff
                            size={20}
                            className="mt-0.5 shrink-0 text-slate-400"
                        />

                        <div>
                            <p className="text-sm font-semibold text-slate-700">
                                Níveis indisponíveis
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                {equipamento.mensagem ||
                                    "Não foi possível consultar a impressora."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </article>
    );
}

function LiquidLevel({
                         label,
                         level,
                         icon: Icon,
                         defaultColor,
                     }) {
    if (!level?.sensorConectado) {
        return (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-3 text-amber-700">
                    <AlertTriangle size={19} />

                    <div>
                        <p className="text-sm font-semibold">
                            {label}
                        </p>

                        <p className="text-xs">
                            {level?.descricao ||
                                "Sensor desconectado"}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const percentual =
        limitarPercentual(
            level.percentualEstimado
        );

    let color = defaultColor;

    if (level.percentualMaximo <= 24) {
        color = "bg-red-500";
    } else if (
        level.percentualMaximo <= 49
    ) {
        color = "bg-amber-500";
    }

    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Icon
                        size={17}
                        className="text-slate-500"
                    />

                    {label}
                </div>

                <span className="text-sm font-bold text-slate-900">
                    {level.descricao}
                </span>
            </div>

            <ProgressBar
                percentage={percentual}
                className={color}
                heightClass="h-3"
            />

            <p className="mt-2 text-xs text-slate-400">
                Valor aproximado para representação visual:{" "}
                {formatarPercentual(
                    percentual
                )}
                %
            </p>
        </div>
    );
}

function ProgressBar({
                         percentage,
                         className,
                         heightClass,
                     }) {
    const percentual =
        limitarPercentual(percentage);

    return (
        <div
            className={`w-full overflow-hidden rounded-full bg-slate-200 ${heightClass}`}
        >
            <div
                className={`h-full rounded-full transition-all duration-500 ${className}`}
                style={{
                    width: `${percentual}%`,
                }}
            />
        </div>
    );
}

function SectionHeader({
                           title,
                           description,
                       }) {
    return (
        <header className="mb-4">
            <h2 className="text-xl font-bold text-slate-950">
                {title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
                {description}
            </p>
        </header>
    );
}

function EmptyState({
                        icon: Icon,
                        title,
                        description,
                    }) {
    return (
        <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <Icon
                size={32}
                className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-800">
                {title}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
                {description}
            </p>
        </div>
    );
}

function limitarPercentual(valor) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return 0;
    }

    return Math.min(
        100,
        Math.max(0, numero)
    );
}

function formatarPercentual(valor) {
    return limitarPercentual(valor)
        .toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
            }
        );
}

function formatarDataHora(valor) {
    if (!valor) {
        return "—";
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return "—";
    }

    return data.toLocaleString(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "medium",
        }
    );
}

export default DashboardPage;
