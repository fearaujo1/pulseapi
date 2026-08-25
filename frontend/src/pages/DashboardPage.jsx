import {
    AlertTriangle,
    Box,
    CheckCircle2,
    Clock,
    Factory,
    PackageCheck,
    Target,
    TrendingDown,
    TrendingUp,
    Wrench,
    ChevronRight,
    Plus,
} from "lucide-react";

import Topbar from "../components/layout/Topbar";
import SummaryCard from "../components/common/SummaryCard.jsx";
import { useNavigate } from "react-router-dom";

const linhas = [
    {
        id: 1,
        nome: "Linha 01 - Embalagem",
        status: "RODANDO",
        op: "OP #10452",
        produto: "Produto X",
        lote: "23A",
        produzido: 2340,
        meta: 5000,
        tempo: "Rodando há 2h 15m",
        estacoes: ["Seladora", "Rotuladora", "Balança"],
    },
    {
        id: 2,
        nome: "Linha 02 - Montagem",
        status: "PARADA",
        op: "OP #10453",
        produto: "Produto Y",
        lote: "24B",
        produzido: 890,
        meta: 3000,
        tempo: "Parada há 12m",
        estacoes: ["Esteira", "Sensor", "Mesa final"],
    },
    {
        id: 3,
        nome: "Linha 03 - Inspeção",
        status: "FALHA",
        op: "OP #10454",
        produto: "Produto Z",
        lote: "25C",
        produzido: 1525,
        meta: 4000,
        tempo: "Falha há 5m",
        estacoes: ["Câmera", "Rejeitador", "Conferência"],
    },
];

function DashboardPage() {
    const produzidoHoje = 4755;
    const metaDia = 10000;
    const refugos = 123;
    const linhasRodando = linhas.filter((l) => l.status === "RODANDO").length;

    const navigate = useNavigate();


    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="p-4 md:p-6">
                <section className="mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-950">
                        Dashboard de Produção
                    </h1>
                    <p className="mt-1 text-[16px] text-slate-600">
                        Visão geral em tempo real das linhas e operações
                    </p>
                </section>

                <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <AlertTriangle size={26} className="text-red-600" />
                            <div>
                                <h2 className="font-bold text-red-700">
                                    Falha ativa na Linha 03
                                </h2>
                                <p className="text-sm text-red-600">
                                    Cabine 1 - Falha no compressor há 5 minutos
                                </p>
                            </div>
                        </div>

                        <button className="text-sm font-semibold text-red-600 hover:underline">
                            Dispensar
                        </button>
                    </div>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                    <SummaryCard
                        title="Produzido Hoje"
                        value={produzidoHoje.toLocaleString("pt-BR")}
                        subtitle="Última atualização: 10s"
                        icon={<PackageCheck size={28} className="text-green-600" />}
                        className="border-green-200 bg-green-50"
                    />

                    <SummaryCard
                        title="Meta do Dia"
                        value={metaDia.toLocaleString("pt-BR")}
                        subtitle={`${Math.round((produzidoHoje / metaDia) * 100)}% atingido`}
                        icon={<Target size={28} className="text-blue-600" />}
                        className="border-blue-200 bg-blue-50"
                    />

                    <SummaryCard
                        title="Refugo Hoje"
                        value={refugos}
                        subtitle="2.59% do total produzido"
                        icon={<TrendingDown size={28} className="text-red-600" />}
                        className="border-red-200 bg-red-50"
                    />

                    <SummaryCard
                        title="Linhas em Operação"
                        value={`${linhasRodando}/${linhas.length}`}
                        subtitle={`${linhas.length - linhasRodando} linha(s) parada(s)`}
                        icon={<Factory size={28} className="text-slate-600" />}
                        className="border-slate-200 bg-white"
                    />
                </section>

                <section className="mb-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                        <h2 className="text-xl font-bold text-slate-950 mb-5">
                            Eficiência Geral
                        </h2>

                        <div className="space-y-5">
                            <Metric label="OEE estimado" value="78.4%" percentage={78.4} />
                            <Metric label="Disponibilidade" value="84.1%" percentage={84.1} />
                            <Metric label="Performance" value="81.3%" percentage={81.3} />
                            <Metric label="Qualidade" value="96.2%" percentage={96.2} />
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-950 mb-5">
                            Alertas Recentes
                        </h2>

                        <div className="space-y-4">
                            <AlertItem
                                type="danger"
                                title="Falha no compressor"
                                description="Linha 03 • há 5 min"
                            />
                            <AlertItem
                                type="warning"
                                title="Linha parada"
                                description="Linha 02 • há 12 min"
                            />
                            <AlertItem
                                type="success"
                                title="OP finalizada"
                                description="Linha 01 • há 35 min"
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-[24px] md:text-xl font-bold text-slate-950 mb-5">
                        Status das Linhas
                    </h2>

                    <div className="space-y-5">
                        {linhas.map((linha) => (
                            <LineCard key={linha.id} linha={linha} />
                        ))}
                    </div>
                </section>

                <button
                    onClick={() => navigate("/registrar-parada")}
                    className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition"
                    title="Registrar ocorrência"
                >
                    <Plus size={28} />
                </button>
            </main>
        </div>
    );
}

function Metric({ label, value, percentage }) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-600">{label}</span>
                <span className="font-bold text-slate-900">{value}</span>
            </div>

            <div className="h-2 rounded-full bg-slate-200">
                <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

function AlertItem({ type, title, description }) {
    const styles = {
        danger: "bg-red-50 text-red-600",
        warning: "bg-amber-50 text-amber-600",
        success: "bg-green-50 text-green-600",
    };

    const icons = {
        danger: <AlertTriangle size={18} />,
        warning: <Wrench size={18} />,
        success: <CheckCircle2 size={18} />,
    };

    return (
        <div className="flex items-start gap-3">
            <div className={`rounded-xl p-2 ${styles[type]}`}>
                {icons[type]}
            </div>

            <div>
                <p className="text-sm font-semibold text-slate-800">{title}</p>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
        </div>
    );
}

function LineCard({ linha }) {
    const percentual = Math.round((linha.produzido / linha.meta) * 100);

    const statusConfig = {
        RODANDO: {
            label: "Rodando",
            border: "border-green-200",
            badge: "bg-green-50 text-green-600",
            dot: "bg-green-500",
        },
        PARADA: {
            label: "Parada",
            border: "border-amber-200",
            badge: "bg-amber-50 text-amber-600",
            dot: "bg-amber-500",
        },
        FALHA: {
            label: "Falha",
            border: "border-red-200",
            badge: "bg-red-50 text-red-600",
            dot: "bg-red-500",
        },
    };

    const config = statusConfig[linha.status];

    return (
        <div className={`rounded-[28px] border ${config.border} bg-white p-6 shadow-sm`}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-slate-950">{linha.nome}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}>
              {config.label}
            </span>
                    </div>

                    <p className="mt-3 text-sm text-slate-600">
                        {linha.op} • {linha.produto} • Lote {linha.lote}
                    </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock size={16} />
                    {linha.tempo}
                </div>
            </div>

            <div className="mt-8">
                <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700">
            {linha.produzido.toLocaleString("pt-BR")} /{" "}
              {linha.meta.toLocaleString("pt-BR")}
          </span>
                    <span className="font-semibold text-slate-700">{percentual}%</span>
                </div>

                <div className="h-3 rounded-full bg-slate-200">
                    <div
                        className="h-3 rounded-full bg-slate-950"
                        style={{ width: `${percentual}%` }}
                    />
                </div>
            </div>

            <div className="mt-8">
                <p className="mb-3 text-sm font-medium text-slate-600">Estações:</p>

                <div className="flex flex-wrap gap-3">
                    {linha.estacoes.map((estacao) => (
                        <span
                            key={estacao}
                            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${config.badge} ${config.border}`}
                        >
              <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                            {estacao}
            </span>
                    ))}
                </div>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-5">
                <button className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
                    Ver detalhes da linha
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}

export default DashboardPage;