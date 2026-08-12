import { useEffect, useMemo, useState } from "react";
import {
    CheckCircle2,
    Clock3,
    CircleAlert,
    Printer,
    Search,
    XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import Topbar from "../components/layout/Topbar";
import SummaryCard from "../components/equipment/SummaryCard";
import { filaImpressaoService } from "../services/filaImpressaoService";
import { equipamentosService } from "../services/equipamentosService";
import { useAuth } from "../contexts/AuthContext.jsx";
import FilaImpressaoDetalhesModal from "../components/fila/FilaImpressaoDetalhesModal.jsx";

function FilaImpressaoPage() {
    const { usuario } = useAuth();

    const podeCancelar = ["ADMIN", "GESTOR", "SUPERVISOR"].includes(
        usuario?.perfil
    );

    const [selectedItem, setSelectedItem] = useState(null);

    const [fila, setFila] = useState([]);
    const [equipamentos, setEquipamentos] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [equipamentoFilter, setEquipamentoFilter] = useState("");

    async function carregarDados(showLoading = false) {
        try {
            if (showLoading) {
                setLoading(true);
            }

            const [filaData, equipamentosData] = await Promise.all([
                filaImpressaoService.listar(),
                equipamentosService.listar(),
            ]);

            setFila(
                Array.isArray(filaData)
                    ? filaData
                    : []
            );

            setEquipamentos(
                Array.isArray(equipamentosData)
                    ? equipamentosData
                    : []
            );

        } catch (error) {
            console.error(
                "Erro ao carregar fila de impressão:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                "Erro ao carregar fila de impressão."
            );

        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        carregarDados(true);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            carregarDados(false);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const filaFiltrada = useMemo(() => {
        const searchLower =
            search.trim().toLowerCase();

        return fila.filter((item) => {
            const matchSearch =
                !searchLower ||
                item.equipamentoNome
                    ?.toLowerCase()
                    .includes(searchLower) ||
                item.layoutNome
                    ?.toLowerCase()
                    .includes(searchLower) ||
                item.payloadMontado
                    ?.toLowerCase()
                    .includes(searchLower);

            const matchStatus =
                !statusFilter ||
                item.status === statusFilter;

            const matchEquipamento =
                !equipamentoFilter ||
                String(item.equipamentoId) ===
                equipamentoFilter;

            return (
                matchSearch &&
                matchStatus &&
                matchEquipamento
            );
        });

    }, [
        fila,
        search,
        statusFilter,
        equipamentoFilter,
    ]);

    const total = fila.length;

    const pendentes = fila.filter(
        (item) =>
            item.status === "PENDENTE"
    ).length;

    const emProcessamento = fila.filter(
        (item) =>
            item.status === "ENVIANDO" ||
            item.status === "ENVIADO_FIFO" ||
            item.status === "PRONTO_IMPRESSAO"
    ).length;

    const impressos = fila.filter(
        (item) =>
            item.status === "IMPRESSO"
    ).length;

    const erros = fila.filter(
        (item) =>
            item.status === "ERRO"
    ).length;

    async function handleCancelar(item) {
        try {
            await filaImpressaoService.cancelar(
                item.id
            );

            toast.success(
                "Item cancelado com sucesso."
            );

            await carregarDados(false);

        } catch (error) {
            console.error(
                "Erro ao cancelar item:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                "Não foi possível cancelar o item."
            );
        }
    }

    function formatarData(data) {
        if (!data) return "-";

        return new Intl.DateTimeFormat(
            "pt-BR",
            {
                dateStyle: "short",
                timeStyle: "medium",
            }
        ).format(new Date(data));
    }

    function podeCancelarItem(item) {
        return (
            podeCancelar &&
            ["PENDENTE", "ERRO"].includes(
                item.status
            )
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="p-4 md:p-6">
                <section className="mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-950">
                        Fila de Impressão
                    </h1>

                    <p className="mt-1 text-[16px] text-slate-600">
                        Acompanhamento dos dados enviados às codificadoras
                    </p>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-6">
                    <SummaryCard
                        title="Total"
                        value={total}
                        subtitle="Registros da fila"
                        icon={
                            <Printer
                                size={26}
                                className="text-blue-600"
                            />
                        }
                        className="border-blue-200 bg-blue-50"
                    />

                    <SummaryCard
                        title="Pendentes"
                        value={pendentes}
                        subtitle="Aguardando envio"
                        icon={
                            <Clock3
                                size={26}
                                className="text-amber-600"
                            />
                        }
                        className="border-amber-200 bg-amber-50"
                    />

                    <SummaryCard
                        title="Em Processamento"
                        value={emProcessamento}
                        subtitle="Na esteira de impressão"
                        icon={
                            <Printer
                                size={26}
                                className="text-violet-600"
                            />
                        }
                        className="border-violet-200 bg-violet-50"
                    />

                    <SummaryCard
                        title="Impressos"
                        value={impressos}
                        subtitle="Confirmados"
                        icon={
                            <CheckCircle2
                                size={26}
                                className="text-green-600"
                            />
                        }
                        className="border-green-200 bg-green-50"
                    />

                    <SummaryCard
                        title="Erros"
                        value={erros}
                        subtitle="Precisam de atenção"
                        icon={
                            <CircleAlert
                                size={26}
                                className="text-red-600"
                            />
                        }
                        className="border-red-200 bg-red-50"
                    />
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-950">
                                Registros da Fila
                            </h2>

                            <p className="text-sm text-slate-500">
                                Atualização automática a cada 3 segundos
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                        <div className="relative">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Buscar equipamento, layout ou payload..."
                                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                            />
                        </div>

                        <select
                            value={equipamentoFilter}
                            onChange={(e) =>
                                setEquipamentoFilter(
                                    e.target.value
                                )
                            }
                            className="h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
                        >
                            <option value="">
                                Todos os equipamentos
                            </option>

                            {equipamentos.map(
                                (equipamento) => (
                                    <option
                                        key={equipamento.id}
                                        value={equipamento.id}
                                    >
                                        {equipamento.nome}
                                    </option>
                                )
                            )}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                            className="h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-blue-500"
                        >
                            <option value="">
                                Todos os status
                            </option>
                            <option value="PENDENTE">
                                Pendente
                            </option>
                            <option value="ENVIANDO">
                                Enviando
                            </option>
                            <option value="ENVIADO_FIFO">
                                Enviado ao FIFO
                            </option>
                            <option value="PRONTO_IMPRESSAO">
                                Pronto para impressão
                            </option>
                            <option value="IMPRESSO">
                                Impresso
                            </option>
                            <option value="ERRO">
                                Erro
                            </option>
                            <option value="CANCELADO">
                                Cancelado
                            </option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="py-14 text-center text-slate-500">
                            Carregando fila de impressão...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1300px]">
                                <thead className="bg-slate-50 border-y border-slate-200">
                                <tr>
                                    <TableHeader>Ordem</TableHeader>
                                    <TableHeader>Equipamento</TableHeader>
                                    <TableHeader>Layout</TableHeader>
                                    <TableHeader>Dados</TableHeader>
                                    <TableHeader>Status</TableHeader>
                                    <TableHeader>Tentativas</TableHeader>
                                    <TableHeader>Criado em</TableHeader>
                                    <TableHeader>Enviado em</TableHeader>
                                    <TableHeader>Impresso em</TableHeader>
                                    <TableHeader>Ações</TableHeader>
                                </tr>
                                </thead>

                                <tbody>
                                {filaFiltrada.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="10"
                                            className="py-12 text-center text-slate-500"
                                        >
                                            Nenhum registro encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filaFiltrada.map(
                                        (item) => (
                                            <tr
                                                key={item.id}
                                                onClick={() => setSelectedItem(item)}
                                                className="border-b border-slate-100 hover:bg-slate-50"
                                            >
                                                <TableCell>
                                                    #{item.ordemFila}
                                                </TableCell>

                                                <TableCell>
                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            {item.equipamentoNome}
                                                        </p>

                                                        <p className="text-xs text-slate-400">
                                                            ID {item.equipamentoId}
                                                        </p>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    {item.layoutNome || "-"}
                                                </TableCell>

                                                <TableCell>
                                                    <div className="max-w-[300px]">
                                                        <code className="text-xs text-slate-600 break-all">
                                                            {item.payloadMontado || "-"}
                                                        </code>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <FilaStatusBadge
                                                        status={item.status}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    {item.tentativas ?? 0}
                                                </TableCell>

                                                <TableCell>
                                                    {formatarData(
                                                        item.criadoEm
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {formatarData(
                                                        item.enviadoEm
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {formatarData(
                                                        item.impressoEm
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {podeCancelarItem(item) ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCancelar(item);
                                                            }}
                                                            className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                                                            title="Cancelar"
                                                        >
                                                            <XCircle
                                                                size={16}
                                                            />
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-300">
                                                                -
                                                            </span>
                                                    )}
                                                </TableCell>
                                            </tr>
                                        )
                                    )
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
            {selectedItem && (
                <FilaImpressaoDetalhesModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </div>
    );
}

function TableHeader({ children }) {
    return (
        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            {children}
        </th>
    );
}

function TableCell({ children }) {
    return (
        <td className="px-5 py-4 text-[13.5px] text-slate-600">
            {children}
        </td>
    );
}

function FilaStatusBadge({ status }) {
    const styles = {
        PENDENTE:
            "bg-amber-50 text-amber-700",

        ENVIANDO:
            "bg-blue-50 text-blue-700",

        ENVIADO_FIFO:
            "bg-violet-50 text-violet-700",

        PRONTO_IMPRESSAO:
            "bg-indigo-50 text-indigo-700",

        IMPRESSO:
            "bg-green-50 text-green-700",

        ERRO:
            "bg-red-50 text-red-700",

        CANCELADO:
            "bg-slate-100 text-slate-600",
    };

    const labels = {
        PENDENTE:
            "Pendente",

        ENVIANDO:
            "Enviando",

        ENVIADO_FIFO:
            "Enviado ao FIFO",

        PRONTO_IMPRESSAO:
            "Pronto para impressão",

        IMPRESSO:
            "Impresso",

        ERRO:
            "Erro",

        CANCELADO:
            "Cancelado",
    };

    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                styles[status] ||
                "bg-slate-100 text-slate-600"
            }`}
        >
            {labels[status] || status || "-"}
        </span>
    );
}

export default FilaImpressaoPage;
