import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Cpu, FileText, Layers3, Plus } from "lucide-react";
import toast from "react-hot-toast";
import Topbar from "../components/layout/Topbar";
import { useAuth } from "../contexts/AuthContext.jsx";
import { layoutImpressaoService } from "../services/layoutImpressaoService";
import { equipamentosService } from "../services/equipamentosService";
import PageHeader from "../components/common/PageHeader";
import ContentCard from "../components/common/ContentCard";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal";
import LayoutImpressaoTable from "../components/printing/LayoutsImpressaoTable";
import LayoutImpressaoFormModal from "../components/printing/LayoutImpressaoFormModal";
import Pagination from "../components/common/Pagination.jsx";
import usePagination from "../hooks/usePagination.js";
import LayoutsImpressaoFilters from "../components/printing/LayoutsImpressaoFilters";

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

    const carregarDados = useCallback(async (showLoading = false) => {
        try {
            if (showLoading) {
                setLoading(true);
            }

            const [layoutsData, equipamentosData] = await Promise.all([
                layoutImpressaoService.listar(),
                equipamentosService.listar(),
            ]);

            setLayouts(Array.isArray(layoutsData) ? layoutsData : []);
            setEquipamentos(
                Array.isArray(equipamentosData) ? equipamentosData : []
            );
        } catch (error) {
            console.error("Erro ao carregar layouts:", error);
            toast.error(
                error.response?.data?.detail ||
                "Erro ao carregar layouts de impressão."
            );
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        carregarDados(true);
    }, [carregarDados]);

    const layoutsFiltrados = useMemo(() => {
        const termo = search.trim().toLowerCase();

        return layouts.filter((layout) => {
            const correspondeBusca =
                !termo ||
                layout.nome?.toLowerCase().includes(termo) ||
                layout.nomeNaImpressora?.toLowerCase().includes(termo) ||
                layout.equipamentoNome?.toLowerCase().includes(termo);

            const correspondeEquipamento =
                !equipamentoFilter ||
                String(layout.equipamentoId) === equipamentoFilter;

            const correspondeStatus =
                !statusFilter || String(layout.ativo) === statusFilter;

            return (
                correspondeBusca &&
                correspondeEquipamento &&
                correspondeStatus
            );
        });
    }, [layouts, search, equipamentoFilter, statusFilter]);

    const {
        currentPage,
        totalPages,
        paginatedItems: layoutsPaginados,
        setCurrentPage,
        resetPage,
    } = usePagination(layoutsFiltrados, 8);

    const total = layouts.length;
    const ativos = layouts.filter((layout) => layout.ativo).length;
    const equipamentosComLayout = new Set(
        layouts.map((layout) => layout.equipamentoId)
    ).size;
    const totalCampos = layouts.reduce(
        (soma, layout) => soma + (layout.campos?.length ?? 0),
        0
    );

    function handleNovo() {
        setSelectedLayout(null);
        setIsModalOpen(true);
    }

    function handleEdit(layout) {
        setSelectedLayout(layout);
        setIsModalOpen(true);
    }

    function handleDelete(layout) {
        setLayoutToDelete(layout);
        setIsDeleteModalOpen(true);
    }

    function fecharFormulario() {
        setIsModalOpen(false);
        setSelectedLayout(null);
    }

    function fecharExclusao() {
        if (deleteLoading) {
            return;
        }

        setIsDeleteModalOpen(false);
        setLayoutToDelete(null);
    }

    function handleSearchChange(value) {
        setSearch(value);
        resetPage();
    }

    function handleEquipamentoChange(value) {
        setEquipamentoFilter(value);
        resetPage();
    }

    function handleStatusChange(value) {
        setStatusFilter(value);
        resetPage();
    }

    async function handleConfirmDelete() {
        if (!layoutToDelete?.id) {
            return;
        }

        try {
            setDeleteLoading(true);
            await layoutImpressaoService.excluir(layoutToDelete.id);

            setLayouts((anteriores) =>
                anteriores.filter((layout) => layout.id !== layoutToDelete.id)
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

            <main className="mx-auto w-full max-w-[1800px] px-4 py-5 md:px-6 lg:px-8">
                <PageHeader
                    title="Layouts de impressão"
                    description="Configure as mensagens e os campos enviados às codificadoras"
                >
                    {podeGerenciar && (
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleNovo}
                                className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
                            >
                                <Plus size={15} />
                                Novo layout
                            </button>
                        </div>
                    )}
                </PageHeader>

                <LayoutIndicators
                    total={total}
                    ativos={ativos}
                    equipamentos={equipamentosComLayout}
                    campos={totalCampos}
                />

                <ContentCard
                    title="Layouts configurados"
                    subtitle={`${layoutsFiltrados.length} registro(s) encontrado(s)`}
                >
                    <div className="mb-5">
                        <LayoutsImpressaoFilters
                            search={search}
                            onSearchChange={handleSearchChange}
                            equipamentoFilter={equipamentoFilter}
                            onEquipamentoChange={handleEquipamentoChange}
                            statusFilter={statusFilter}
                            onStatusChange={handleStatusChange}
                            equipamentos={equipamentos}
                        />
                    </div>

                    <LayoutImpressaoTable
                        layouts={layoutsPaginados}
                        loading={loading}
                        canManage={podeGerenciar}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        deleteLoading={deleteLoading}
                    />

                    {!loading && totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </ContentCard>
            </main>

            <LayoutImpressaoFormModal
                isOpen={isModalOpen}
                onClose={fecharFormulario}
                layout={selectedLayout}
                equipamentos={equipamentos}
                onSuccess={async () => {
                    fecharFormulario();
                    await carregarDados(false);
                }}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={fecharExclusao}
                onConfirm={handleConfirmDelete}
                loading={deleteLoading}
                title="Excluir layout"
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
                confirmText="Excluir layout"
            />
        </div>
    );
}

function LayoutIndicators({ total, ativos, equipamentos, campos }) {
    const indicadores = [
        {
            label: "Layouts",
            value: total,
            detail: "cadastrados",
            icon: Layers3,
            iconClass: "bg-blue-50 text-blue-600",
        },
        {
            label: "Ativos",
            value: ativos,
            detail: "disponíveis",
            icon: CheckCircle2,
            iconClass: "bg-emerald-50 text-emerald-600",
        },
        {
            label: "Equipamentos",
            value: equipamentos,
            detail: "com layout",
            icon: Cpu,
            iconClass: "bg-violet-50 text-violet-600",
        },
        {
            label: "Campos",
            value: campos,
            detail: "configurados",
            icon: FileText,
            iconClass: "bg-amber-50 text-amber-600",
        },
    ];

    return (
        <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {indicadores.map((indicador) => {
                const Icon = indicador.icon;

                return (
                    <article
                        key={indicador.label}
                        className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                    >
                        <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${indicador.iconClass}`}
                        >
                            <Icon size={17} />
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                {indicador.label}
                            </p>
                            <div className="mt-0.5 flex items-baseline gap-1.5">
                                <strong className="text-lg text-slate-900">
                                    {indicador.value}
                                </strong>
                                <span className="truncate text-[11px] text-slate-500">
                                    {indicador.detail}
                                </span>
                            </div>
                        </div>
                    </article>
                );
            })}
        </section>
    );
}

export default LayoutsImpressaoPage;
