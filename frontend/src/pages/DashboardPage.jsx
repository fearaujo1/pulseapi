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
    ArrowRight,
    CheckCircle2,
    ClipboardList,
    Droplets,
    Factory,
    Gauge,
    Loader2,
    PackageCheck,
    Plus,
    Radio,
    RefreshCw,
    Wifi,
    WifiOff,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import Topbar from "../components/layout/Topbar.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

import { dashboardService } from "../services/dashboardService.js";
import { websocketService } from "../services/websocketService.js";

import {
    producaoStatusMap,
} from "../config/statusMaps.js";

function DashboardPage() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [resumo, setResumo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [erro, setErro] = useState("");
    const [tempoRealConectado, setTempoRealConectado] =
        useState(false);

    const atualizacaoPendenteRef = useRef(null);

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
                    if (componenteAtivo) {
                        setTempoRealConectado(true);
                    }

                    console.info(
                        "Dashboard conectado às atualizações em tempo real."
                    );
                },

                onDesconectado: () => {
                    if (componenteAtivo) {
                        setTempoRealConectado(false);
                    }

                    console.warn(
                        "Dashboard desconectado das atualizações em tempo real."
                    );
                },

                onErro: (mensagem) => {
                    if (componenteAtivo) {
                        setTempoRealConectado(false);
                    }

                    console.error(
                        "Atualização em tempo real indisponível:",
                        mensagem
                    );
                },
            });

        return () => {
            componenteAtivo = false;
            setTempoRealConectado(false);

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

        return () => clearInterval(intervalo);
    }, [carregarResumo]);

    const alertas = useMemo(() => {
        if (!resumo) {
            return [];
        }

        const novosAlertas = [];

        for (const producao of resumo.producoes || []) {
            const equipamento =
                resumo.equipamentos?.find(
                    (item) =>
                        item.equipamentoId ===
                        producao.equipamentoId
                );

            if (
                producao.status === "EM_ANDAMENTO" &&
                equipamento?.statusConexao !== "CONECTADO"
            ) {
                novosAlertas.push({
                    id: `producao-${producao.producaoId}`,
                    tipo: "danger",
                    titulo:
                        "Produção em andamento sem conexão",
                    descricao:
                        `${producao.codigoOrdem} está vinculada ao equipamento ` +
                        `${producao.equipamentoNome}, que está sem conexão.`,
                });
            }
        }

        for (
            const equipamento of
        resumo.equipamentos || []
            ) {
            if (
                equipamento.consultaLiquidosDisponivel &&
                equipamento.tinta?.sensorConectado &&
                equipamento.tinta.percentualMaximo <= 24
            ) {
                novosAlertas.push({
                    id: `tinta-${equipamento.equipamentoId}`,
                    tipo: "danger",
                    titulo: "Nível de tinta baixo",
                    descricao:
                        `${equipamento.equipamentoNome}: ` +
                        `${equipamento.tinta.descricao}.`,
                });
            }

            if (
                equipamento.consultaLiquidosDisponivel &&
                equipamento.makeup?.sensorConectado &&
                equipamento.makeup.percentualMaximo <= 24
            ) {
                novosAlertas.push({
                    id: `makeup-${equipamento.equipamentoId}`,
                    tipo: "warning",
                    titulo: "Nível de make-up baixo",
                    descricao:
                        `${equipamento.equipamentoNome}: ` +
                        `${equipamento.makeup.descricao}.`,
                });
            }
        }

        return novosAlertas;
    }, [resumo]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f4f6f9]">
                <Topbar />

                <main className="flex min-h-[calc(100vh-64px)] items-center justify-center">
                    <div className="flex flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <Loader2
                                size={22}
                                className="animate-spin text-blue-600"
                            />
                        </div>

                        <p className="mt-4 text-sm font-medium text-slate-600">
                            Carregando visão operacional...
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    const producoes = resumo?.producoes || [];
    const equipamentos = resumo?.equipamentos || [];

    return (
        <div className="min-h-screen bg-[#f4f6f9]">
            <Topbar />

            <main className="mx-auto w-full max-w-[1800px] px-4 py-5 md:px-6 lg:px-8">
                <DashboardHeader
                    refreshing={refreshing}
                    tempoRealConectado={
                        tempoRealConectado
                    }
                    atualizadoEm={resumo?.atualizadoEm}
                    onRefresh={atualizarManualmente}
                />

                {erro && (
                    <ErrorMessage mensagem={erro} />
                )}

                {alertas.length > 0 && (
                    <section className="mb-5">
                        <div className="mb-3 flex items-center gap-2">
                            <AlertTriangle
                                size={16}
                                className="text-amber-500"
                            />

                            <h2 className="text-sm font-semibold text-slate-800">
                                Atenção necessária
                            </h2>

                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-[11px] font-bold text-amber-700">
                                {alertas.length}
                            </span>
                        </div>

                        <div className="grid gap-3 xl:grid-cols-2">
                            {alertas.map((alerta) => (
                                <DashboardAlert
                                    key={alerta.id}
                                    alerta={alerta}
                                />
                            ))}
                        </div>
                    </section>
                )}

                <DashboardSummary
                    resumo={resumo}
                />

                <div className="mt-5 grid items-start gap-5 2xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)]">
                    <section className="min-w-0">
                        <SectionPanel
                            title="Produções ativas"
                            description="Acompanhamento das ordens em operação"
                            icon={ClipboardList}
                            counter={producoes.length}
                            action={
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/producoes")
                                    }
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                                >
                                    Ver produções
                                    <ArrowRight size={14} />
                                </button>
                            }
                        >
                            {producoes.length === 0 ? (
                                <EmptyState
                                    icon={ClipboardList}
                                    title="Nenhuma produção ativa"
                                    description="Não existem ordens em execução neste momento."
                                />
                            ) : (
                                <div className="space-y-3">
                                    {producoes.map(
                                        (producao) => (
                                            <ProducaoRow
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
                        </SectionPanel>
                    </section>

                    <section className="min-w-0">
                        <SectionPanel
                            title="Impressoras"
                            description="Conexão e níveis de insumos"
                            icon={Factory}
                            counter={equipamentos.length}
                        >
                            {equipamentos.length === 0 ? (
                                <EmptyState
                                    icon={Factory}
                                    title="Nenhuma impressora"
                                    description="Não há equipamentos associados às produções ativas."
                                />
                            ) : (
                                <div className="space-y-3">
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
                        </SectionPanel>
                    </section>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/registrar-parada")
                    }
                    className="fixed bottom-5 right-5 z-20 flex h-12 items-center gap-2 rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                    title="Registrar ocorrência"
                >
                    <Plus size={18} />
                </button>
            </main>
        </div>
    );
}

function DashboardHeader({
                             refreshing,
                             tempoRealConectado,
                             atualizadoEm,
                             onRefresh,
                         }) {
    return (
        <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <h1 className="text-[26px] font-bold tracking-[-0.025em] text-slate-950 md:text-[30px]">
                    Dashboard de Produção
                </h1>

                <p className="mt-1 text-[13px] text-slate-500">
                    Indicadores de operação, produção e
                    disponibilidade das impressoras.
                </p>
            </div>
        </header>
    );
}

function DashboardSummary({ resumo }) {
    const percentual = limitarPercentual(
        resumo?.percentualGeralProcessado
    );

    const cards = [
        {
            title: "Produções ativas",
            value:
                resumo?.quantidadeProducoesAtivas ?? 0,
            description:
                "Ordens em operação ou avaliação",
            icon: ClipboardList,
            iconClass:
                "bg-blue-50 text-blue-600",
        },
        {
            title: "Itens processados",
            value:
                resumo?.quantidadeItensProcessados ?? 0,
            description:
                `de ${resumo?.quantidadeTotalItens ?? 0} itens importados`,
            icon: Activity,
            iconClass:
                "bg-emerald-50 text-emerald-600",
        },
        {
            title: "Impressoras conectadas",
            value:
                `${resumo?.quantidadeEquipamentosConectados ?? 0}/${resumo?.quantidadeEquipamentosRelacionados ?? 0}`,
            description:
                "Equipamentos relacionados às ordens",
            icon: Wifi,
            iconClass:
                "bg-violet-50 text-violet-600",
        },
        {
            title: "Itens concluídos",
            value:
                resumo?.quantidadeItensConcluidos ?? 0,
            description:
                "Itens aprovados e finalizados",
            icon: PackageCheck,
            iconClass:
                "bg-slate-100 text-slate-700",
        },
    ];

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
                {cards.map((card, index) => {
                    const Icon = card.icon;

                    return (
                        <article
                            key={card.title}
                            className={`
                                flex min-w-0 items-center gap-3.5
                                px-4 py-4 lg:px-5
                                ${
                                index === 2
                                    ? "sm:border-t sm:border-slate-100 xl:border-t-0"
                                    : ""
                            }
                            `}
                        >
                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconClass}`}
                            >
                                <Icon size={19} />
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                    {card.title}
                                </p>

                                <p className="mt-0.5 text-xl font-bold tracking-tight text-slate-950">
                                    {card.value}
                                </p>

                                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                                    {card.description}
                                </p>
                            </div>
                        </article>
                    );
                })}
            </div>

            <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3.5 lg:px-5">
                <div className="mb-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Radio
                            size={14}
                            className="text-blue-600"
                        />

                        <span className="text-xs font-semibold text-slate-700">
                            Progresso geral das produções
                        </span>
                    </div>

                    <span className="text-sm font-bold text-slate-950">
                        {formatarPercentual(percentual)}%
                    </span>
                </div>

                <ProgressBar
                    percentage={percentual}
                    className="bg-blue-600"
                    heightClass="h-2"
                />
            </div>
        </section>
    );
}

function SectionPanel({
                          title,
                          description,
                          icon: Icon,
                          counter,
                          action,
                          children,
                      }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-4 lg:px-5">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <Icon size={17} />
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h2 className="truncate text-sm font-bold text-slate-900">
                                {title}
                            </h2>

                            {counter !== undefined && (
                                <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-slate-100 px-1.5 text-[10px] font-bold text-slate-600">
                                    {counter}
                                </span>
                            )}
                        </div>

                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                            {description}
                        </p>
                    </div>
                </div>

                {action}
            </header>

            <div className="p-3 lg:p-4">
                {children}
            </div>
        </div>
    );
}

function ProducaoRow({ producao, onOpen }) {
    const status =
        producaoStatusMap[producao.status] || {
            label:
                formatarEnum(producao.status) ||
                "Não informado",
            badge:
                "border-slate-200 bg-slate-100 text-slate-700",
            progress: "bg-slate-500",
            dot: "bg-slate-500",
        };

    const percentual = limitarPercentual(
        producao.percentualProcessado
    );

    return (
        <article className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-bold text-slate-900">
                            {producao.codigoOrdem}
                        </h3>

                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold ${status.badge}`}
                        >
                            <span
                                className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                            />

                            {status.label}
                        </span>
                    </div>

                    <p className="mt-1 truncate text-xs text-slate-500">
                        {producao.linhaNome || "Sem linha"}
                        <span className="px-1.5 text-slate-300">
                            /
                        </span>
                        {producao.equipamentoNome ||
                            "Sem equipamento"}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onOpen}
                    className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-blue-600 opacity-100 transition hover:text-blue-700 lg:opacity-0 lg:group-hover:opacity-100"
                >
                    Detalhes
                    <ArrowRight size={13} />
                </button>
            </div>

            <div className="mt-4">
                <div className="mb-2 flex items-end justify-between gap-4">
                    <div className="flex flex-wrap gap-x-5 gap-y-1">
                        <MetricInline
                            label="Processados"
                            value={
                                producao.quantidadeProcessada
                            }
                        />

                        <MetricInline
                            label="Restantes"
                            value={
                                producao.quantidadeRestante
                            }
                        />

                        <MetricInline
                            label="Concluídos"
                            value={
                                producao.quantidadeConcluida
                            }
                        />
                    </div>

                    <span className="shrink-0 text-lg font-bold tracking-tight text-slate-950">
                        {formatarPercentual(percentual)}
                        <span className="ml-0.5 text-xs font-semibold text-slate-400">
                            %
                        </span>
                    </span>
                </div>

                <ProgressBar
                    percentage={percentual}
                    className={status.progress}
                    heightClass="h-2"
                />

                <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
                    <span>Progresso processado</span>

                    <span>
                        Total:{" "}
                        {producao.quantidadeTotal ?? 0}
                    </span>
                </div>
            </div>
        </article>
    );
}

function MetricInline({ label, value }) {
    return (
        <div>
            <span className="text-[10px] text-slate-400">
                {label}
            </span>

            <span className="ml-1.5 text-xs font-bold text-slate-700">
                {value ?? 0}
            </span>
        </div>
    );
}

function EquipamentoCard({ equipamento }) {
    const conectado =
        equipamento.statusConexao === "CONECTADO";

    return (
        <article className="rounded-xl border border-slate-200 bg-white p-4">
            <header className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div
                        className={`
                            flex h-9 w-9 shrink-0
                            items-center justify-center rounded-xl
                            ${
                            conectado
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-red-50 text-red-600"
                        }
                        `}
                    >
                        {conectado ? (
                            <Wifi size={17} />
                        ) : (
                            <WifiOff size={17} />
                        )}
                    </div>

                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-slate-900">
                            {equipamento.equipamentoNome}
                        </h3>

                        <p className="mt-0.5 truncate text-[11px] text-slate-400">
                            {equipamento.equipamentoCodigo ||
                                "Código não informado"}
                        </p>
                    </div>
                </div>

                <span
                    className={`
                        inline-flex shrink-0 items-center gap-1.5
                        rounded-full border px-2 py-1
                        text-[10px] font-semibold
                        ${
                        conectado
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                    }
                    `}
                >
                    <span
                        className={`
                            h-1.5 w-1.5 rounded-full
                            ${
                            conectado
                                ? "bg-emerald-500"
                                : "bg-red-500"
                        }
                        `}
                    />

                    {conectado
                        ? "Conectado"
                        : "Sem conexão"}
                </span>
            </header>

            {equipamento.consultaLiquidosDisponivel ? (
                <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
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
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
                    <WifiOff
                        size={16}
                        className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div>
                        <p className="text-xs font-semibold text-slate-700">
                            Níveis indisponíveis
                        </p>

                        <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                            {equipamento.mensagem ||
                                "Não foi possível consultar os níveis da impressora."}
                        </p>
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
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <AlertTriangle
                    size={15}
                    className="mt-0.5 shrink-0 text-amber-600"
                />

                <div>
                    <p className="text-xs font-semibold text-amber-800">
                        Sensor de {label.toLowerCase()}
                    </p>

                    <p className="mt-0.5 text-[11px] text-amber-700">
                        {level?.descricao ||
                            "Sensor desconectado"}
                    </p>
                </div>
            </div>
        );
    }

    const percentual = limitarPercentual(
        level.percentualEstimado
    );

    let color = defaultColor;

    if (level.percentualMaximo <= 24) {
        color = "bg-red-500";
    } else if (level.percentualMaximo <= 49) {
        color = "bg-amber-500";
    }

    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <Icon
                        size={14}
                        className="text-slate-400"
                    />

                    {label}
                </div>

                <span className="truncate text-xs font-bold text-slate-800">
                    {level.descricao}
                </span>
            </div>

            <ProgressBar
                percentage={percentual}
                className={color}
                heightClass="h-2"
            />

            <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
                <span>Nível estimado</span>

                <span>
                    {formatarPercentual(percentual)}%
                </span>
            </div>
        </div>
    );
}

function DashboardAlert({ alerta }) {
    const config = {
        danger: {
            container:
                "border-red-200 bg-red-50",
            iconContainer:
                "bg-red-100 text-red-600",
            title: "text-red-800",
            text: "text-red-700",
        },

        warning: {
            container:
                "border-amber-200 bg-amber-50",
            iconContainer:
                "bg-amber-100 text-amber-600",
            title: "text-amber-800",
            text: "text-amber-700",
        },
    };

    const style =
        config[alerta.tipo] || config.warning;

    return (
        <article
            className={`flex items-start gap-3 rounded-xl border p-3.5 ${style.container}`}
        >
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.iconContainer}`}
            >
                <AlertTriangle size={16} />
            </div>

            <div className="min-w-0">
                <h3
                    className={`text-xs font-bold ${style.title}`}
                >
                    {alerta.titulo}
                </h3>

                <p
                    className={`mt-1 text-[11px] leading-4 ${style.text}`}
                >
                    {alerta.descricao}
                </p>
            </div>
        </article>
    );
}

function ErrorMessage({ mensagem }) {
    return (
        <section className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <AlertTriangle size={16} />
            </div>

            <div>
                <p className="text-xs font-bold text-red-800">
                    Falha na atualização
                </p>

                <p className="mt-1 text-xs text-red-700">
                    {mensagem}
                </p>
            </div>
        </section>
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
            className={`w-full overflow-hidden rounded-full bg-slate-200/80 ${heightClass}`}
        >
            <div
                className={`h-full rounded-full transition-[width] duration-500 ease-out ${className}`}
                style={{
                    width: `${percentual}%`,
                }}
            />
        </div>
    );
}

function EmptyState({
                        icon: Icon,
                        title,
                        description,
                    }) {
    return (
        <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                <Icon size={19} />
            </div>

            <h3 className="mt-3 text-sm font-semibold text-slate-800">
                {title}
            </h3>

            <p className="mt-1 max-w-sm text-xs text-slate-500">
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
    return limitarPercentual(valor).toLocaleString(
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

    return data.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "medium",
    });
}

function formatarEnum(valor) {
    if (!valor) {
        return "";
    }

    return valor
        .toLowerCase()
        .split("_")
        .map(
            (palavra) =>
                palavra.charAt(0).toUpperCase() +
                palavra.slice(1)
        )
        .join(" ");
}

export default DashboardPage;