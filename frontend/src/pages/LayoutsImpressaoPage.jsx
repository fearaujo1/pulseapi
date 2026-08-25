import { useEffect, useMemo, useState } from "react";
import {
    CheckCircle2,
    FileText,
    Layers3,
    Plus,
    SlidersHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import Topbar from "../components/layout/Topbar";
import { useAuth } from "../contexts/AuthContext.jsx";
import { layoutImpressaoService } from "../services/layoutImpressaoService";
import { equipamentosService } from "../services/equipamentosService";

import PageHeader from "../components/common/PageHeader";
import ContentCard from "../components/common/ContentCard";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal";
import SummaryCard from "../components/common/SummaryCard.jsx";

import LayoutImpressaoFilters from "../components/printing/LayoutsImpressaoFilters";
import LayoutImpressaoTable from "../components/printing/LayoutsImpressaoTable";
import LayoutImpressaoFormModal from "../components/printing/LayoutImpressaoFormModal";

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

    const [layoutToDelete, setLayoutToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

    function handleExcluir(layout) {
        setLayoutToDelete(layout);
        setIsDeleteModalOpen(true);
    }

    async function handleConfirmDelete() {
        if (!layoutToDelete?.id) return;

        try {
            setDeleteLoading(true);

            await layoutImpressaoService.excluir(
                layoutToDelete.id
            );

            setLayouts((previous) =>
                previous.filter(
                    (layout) => layout.id !== layoutToDelete.id
                )
            );

            setIsDeleteModalOpen(false);
            setLayoutToDelete(null);

            toast.success("Layout excluído com sucesso.");
        } catch (error) {
            console.error("Erro ao excluir layout:", error);

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

                <PageHeader
                    title="Layouts de Impressão"
                    description="Configuração das mensagens e campos enviados às codificadoras"
                >
                    {podeGerenciar && (
                        <button
                            type="button"
                            onClick={handleNovo}
                            className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            <Plus size={16} />
                            Novo Layout
                        </button>
                    )}
                </PageHeader>

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

                <ContentCard
                    title="Lista de Layouts"
                    subtitle="Layouts configurados para os equipamentos"
                >
                    <div className="mb-6">
                        <LayoutImpressaoFilters
                            search={search}
                            onSearchChange={setSearch}
                            equipamentoFilter={equipamentoFilter}
                            onEquipamentoChange={setEquipamentoFilter}
                            statusFilter={statusFilter}
                            onStatusChange={setStatusFilter}
                            equipamentos={equipamentos}
                        />
                    </div>

                    <LayoutImpressaoTable
                        layouts={layoutsFiltrados}
                        loading={loading}
                        canManage={podeGerenciar}
                        onEdit={handleEditar}
                        onDelete={handleExcluir}
                        deleteLoading={deleteLoading}
                    />
                </ContentCard>

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

                <ConfirmDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setLayoutToDelete(null);
                    }}
                    onConfirm={handleConfirmDelete}
                    loading={deleteLoading}
                    title="Excluir Layout"
                    description="Confirme a exclusão deste layout de impressão."
                    warningMessage="O layout será removido permanentemente do sistema."
                    itemLabel="Layout selecionado"
                    itemName={layoutToDelete?.nome}
                    details={[
                        {
                            label: "Nome na impressora",
                            value: layoutToDelete?.nomeNaImpressora,
                        },
                        {
                            label: "Equipamento",
                            value: layoutToDelete?.equipamentoNome,
                        },
                        {
                            label: "Campos",
                            value: layoutToDelete?.campos?.length ?? 0,
                        },
                    ]}
                    confirmText="Excluir Layout"
                />

            </main>
        </div>
    );
}

export default LayoutsImpressaoPage;