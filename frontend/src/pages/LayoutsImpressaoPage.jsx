import { useEffect, useMemo, useState } from "react";
import {
    CheckCircle2,
    FileText,
    Layers3,
    Plus,
    Search,
    SlidersHorizontal,
    Trash2,
    Pencil,
} from "lucide-react";
import toast from "react-hot-toast";

import Topbar from "../components/layout/Topbar";
import SummaryCard from "../components/equipment/SummaryCard";
import { layoutImpressaoService } from "../services/layoutImpressaoService";
import { equipamentosService } from "../services/equipamentosService";
import LayoutImpressaoFormModal from "../components/layout/LayoutImpressaoFormModal.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

function LayoutsImpressaoPage() {
    const { usuario } = useAuth();

    const podeGerenciar = ["ADMIN", "GESTOR", "SUPERVISOR"].includes(
        usuario?.perfil
    );

    const [layouts, setLayouts] = useState([]);
    const [equipamentos, setEquipamentos] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [equipamentoFilter, setEquipamentoFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLayout, setSelectedLayout] = useState(null);

    const [deleteLoading, setDeleteLoading] = useState(false);

    async function carregarDados(showLoading = false) {
        try {
            if (showLoading) {
                setLoading(true);
            }

            const [layoutsData, equipamentosData] = await Promise.all([
                layoutImpressaoService.listar(),
                equipamentosService.listar(),
            ]);

            setLayouts(
                Array.isArray(layoutsData)
                    ? layoutsData
                    : []
            );

            setEquipamentos(
                Array.isArray(equipamentosData)
                    ? equipamentosData
                    : []
            );

        } catch (error) {
            console.error(
                "Erro ao carregar layouts:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                "Erro ao carregar layouts de impressão."
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

    const layoutsFiltrados = useMemo(() => {
        const searchLower =
            search.trim().toLowerCase();

        return layouts.filter((layout) => {
            const matchSearch =
                !searchLower ||
                layout.nome
                    ?.toLowerCase()
                    .includes(searchLower) ||
                layout.nomeNaImpressora
                    ?.toLowerCase()
                    .includes(searchLower) ||
                layout.equipamentoNome
                    ?.toLowerCase()
                    .includes(searchLower);

            const matchEquipamento =
                !equipamentoFilter ||
                String(layout.equipamentoId) ===
                equipamentoFilter;

            const matchStatus =
                !statusFilter ||
                String(layout.ativo) === statusFilter;

            return (
                matchSearch &&
                matchEquipamento &&
                matchStatus
            );
        });

    }, [
        layouts,
        search,
        equipamentoFilter,
        statusFilter,
    ]);

    const total = layouts.length;

    const ativos = layouts.filter(
        (layout) => layout.ativo
    ).length;

    const equipamentosComLayout = new Set(
        layouts.map(
            (layout) => layout.equipamentoId
        )
    ).size;

    const totalCampos = layouts.reduce(
        (totalAtual, layout) =>
            totalAtual +
            (Array.isArray(layout.campos)
                ? layout.campos.length
                : 0),
        0
    );

    function handleNovo() {
        setSelectedLayout(null);
        setIsModalOpen(true);
    }

    function handleEditar(layout) {
        setSelectedLayout(layout);
        setIsModalOpen(true);
    }

    async function handleExcluir(layout) {
        const confirmou = window.confirm(
            `Deseja realmente excluir o layout "${layout.nome}"?`
        );

        if (!confirmou) {
            return;
        }

        try {
            setDeleteLoading(true);

            await layoutImpressaoService.excluir(
                layout.id
            );

            toast.success(
                "Layout excluído com sucesso."
            );

            await carregarDados(false);

        } catch (error) {
            console.error(
                "Erro ao excluir layout:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                "Não foi possível excluir o layout."
            );

        } finally {
            setDeleteLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="p-4 md:p-6">

                <section className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-950">
                            Layouts de Impressão
                        </h1>

                        <p className="mt-1 text-[16px] text-slate-600">
                            Configuração das mensagens e campos enviados às codificadoras
                        </p>
                    </div>

                    {podeGerenciar && (
                        <button
                            onClick={handleNovo}
                            className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[15px] flex items-center gap-2 shadow-sm"
                        >
                            <Plus size={16} />
                            Novo Layout
                        </button>
                    )}
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

                    <SummaryCard
                        title="Total de Layouts"
                        value={total}
                        subtitle="Cadastrados no sistema"
                        icon={
                            <Layers3
                                size={26}
                                className="text-blue-600"
                            />
                        }
                        className="border-blue-200 bg-blue-50"
                    />

                    <SummaryCard
                        title="Layouts Ativos"
                        value={ativos}
                        subtitle="Disponíveis para utilização"
                        icon={
                            <CheckCircle2
                                size={26}
                                className="text-green-600"
                            />
                        }
                        className="border-green-200 bg-green-50"
                    />

                    <SummaryCard
                        title="Equipamentos"
                        value={equipamentosComLayout}
                        subtitle="Com layouts associados"
                        icon={
                            <SlidersHorizontal
                                size={26}
                                className="text-violet-600"
                            />
                        }
                        className="border-violet-200 bg-violet-50"
                    />

                    <SummaryCard
                        title="Campos Configurados"
                        value={totalCampos}
                        subtitle="Variáveis nos layouts"
                        icon={
                            <FileText
                                size={26}
                                className="text-slate-600"
                            />
                        }
                        className="border-slate-200 bg-white"
                    />
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6">

                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-950">
                            Lista de Layouts
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Layouts configurados para os equipamentos
                        </p>
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
                                placeholder="Buscar layout..."
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

                            <option value="true">
                                Ativos
                            </option>

                            <option value="false">
                                Inativos
                            </option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="py-14 text-center text-slate-500">
                            Carregando layouts...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">

                                <thead className="bg-slate-50 border-y border-slate-200">
                                <tr>
                                    <TableHeader>
                                        Nome
                                    </TableHeader>

                                    <TableHeader>
                                        Nome na Impressora
                                    </TableHeader>

                                    <TableHeader>
                                        Equipamento
                                    </TableHeader>

                                    <TableHeader>
                                        Estratégia
                                    </TableHeader>

                                    <TableHeader>
                                        Campos
                                    </TableHeader>

                                    <TableHeader>
                                        Status
                                    </TableHeader>

                                    <TableHeader>
                                        Ações
                                    </TableHeader>
                                </tr>
                                </thead>

                                <tbody>
                                {layoutsFiltrados.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="py-12 text-center text-slate-500"
                                        >
                                            Nenhum layout encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    layoutsFiltrados.map(
                                        (layout) => (
                                            <tr
                                                key={layout.id}
                                                className="border-b border-slate-100 hover:bg-slate-50"
                                            >
                                                <TableCell>
                                                    <p className="font-semibold text-slate-800">
                                                        {layout.nome}
                                                    </p>
                                                </TableCell>

                                                <TableCell>
                                                    <code className="text-xs">
                                                        {layout.nomeNaImpressora}
                                                    </code>
                                                </TableCell>

                                                <TableCell>
                                                    {layout.equipamentoNome}
                                                </TableCell>

                                                <TableCell>
                                                    <StrategyBadge
                                                        estrategia={
                                                            layout.estrategiaMontagem
                                                        }
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    {layout.campos?.length || 0}
                                                </TableCell>

                                                <TableCell>
                                                    <StatusLayoutBadge
                                                        ativo={layout.ativo}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-2">

                                                        {podeGerenciar && (
                                                            <button
                                                                onClick={() =>
                                                                    handleEditar(
                                                                        layout
                                                                    )
                                                                }
                                                                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition"
                                                                title="Editar"
                                                            >
                                                                <Pencil
                                                                    size={16}
                                                                />
                                                            </button>
                                                        )}

                                                        {podeGerenciar && (
                                                            <button
                                                                onClick={() =>
                                                                    handleExcluir(
                                                                        layout
                                                                    )
                                                                }
                                                                disabled={deleteLoading}
                                                                className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                                                                title="Excluir"
                                                            >
                                                                <Trash2
                                                                    size={16}
                                                                />
                                                            </button>
                                                        )}
                                                    </div>
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

                <LayoutImpressaoFormModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedLayout(null);
                    }}
                    layout={selectedLayout}
                    equipamentos={equipamentos}
                    onSuccess={async () => {
                        setIsModalOpen(false);
                        setSelectedLayout(null);
                        await carregarDados(false);
                    }}
                />

            </main>
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

function StrategyBadge({ estrategia }) {
    const labels = {
        DELIMITADO: "Delimitador",
        OFFSET_FIXO: "Offset Fixo",
    };

    return (
        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {labels[estrategia] || estrategia || "-"}
        </span>
    );
}

function StatusLayoutBadge({ ativo }) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                ativo
                    ? "bg-green-50 text-green-700"
                    : "bg-slate-100 text-slate-600"
            }`}
        >
            {ativo
                ? "Ativo"
                : "Inativo"}
        </span>
    );
}

export default LayoutsImpressaoPage;