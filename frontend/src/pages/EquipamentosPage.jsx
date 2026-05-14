import { useEffect, useMemo, useState } from "react";
import { Plus, Cpu, CheckCircle2, Wrench, Factory } from "lucide-react";
import Topbar from "../components/layout/Topbar";
import SummaryCard from "../components/equipment/SummaryCard";
import EquipmentFilters from "../components/equipment/EquipmentFilters";
import EquipmentTable from "../components/equipment/EquipmentTable";
import { equipamentosService } from "../services/equipamentosService";
import EquipmentFormModal from "../components/equipment/EquipmentFormModal";
import ConfirmDeleteModal from "../components/equipment/ConfirmDeleteModal";
import toast from "react-hot-toast";
import Pagination from "../components/equipment/Pagination.jsx";
import EquipmentTableSkeleton from "../components/equipment/EquipmentTableSkeleton";
import EquipmentCards from "../components/equipment/EquipmentCards.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

function EquipamentosPage() {

    const { usuario } = useAuth();

    const podeCriar = ["ADMIN", "GESTOR", "SUPERVISOR"].includes(usuario?.perfil)
    const podeEditar = ["ADMIN", "GESTOR", "SUPERVISOR"].includes(usuario?.perfil)
    const podeExcluir = ["ADMIN", "GESTOR", "SUPERVISOR"].includes(usuario?.perfil)


    const [equipamentos, setEquipamentos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [selectedEquipamento, setSelectedEquipamento] = useState(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [equipamentoToDelete, setEquipamentoToDelete] = useState(null);

    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc")

    const [initialLoading, setInitialLoading] = useState(true);

    const [viewMode, setViewMode] = useState("table");

    async function carregarEquipamentos(showLoading = false) {
        try {
            if (showLoading) {
                setLoading(true);
            }

            const data = await equipamentosService.listar();
            setEquipamentos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao carregar equipamentos:", error);
            console.error("Resposta:", error.response);
            setEquipamentos([]);
            toast.error("Erro ao carregar equipamentos.");
        } finally {
            if (showLoading) {
                setLoading(false);
                setInitialLoading(false);
            }
        }
    }

    useEffect(() => {
        carregarEquipamentos(true);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            carregarEquipamentos(false);
        }, 10000); // 10 segundos

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, statusFilter, typeFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const equipamentosFiltrados = useMemo(() => {
        if (!Array.isArray(equipamentos)) return [];

        const searchLower = debouncedSearch.trim().toLowerCase();

        return equipamentos.filter((item) => {
            const matchSearch =
                !searchLower ||
                item.nome?.toLowerCase().includes(searchLower) ||
                item.codigo?.toLowerCase().includes(searchLower);

            const matchStatus = !statusFilter || item.status === statusFilter;
            const matchType = !typeFilter || item.tipo === typeFilter;

            return matchSearch && matchStatus && matchType;
        });
    }, [equipamentos, debouncedSearch, statusFilter, typeFilter]);

    const equipamentosOrdenados = useMemo(() => {
        if (!Array.isArray(equipamentosFiltrados)) return [];

        if (!sortField) return equipamentosFiltrados;

        return [...equipamentosFiltrados].sort((a, b) => {
            const aValue = a[sortField]?.toLowerCase?.() || "";
            const bValue = b[sortField]?.toLowerCase?.() || "";

            if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
            if (aValue > bValue) return sortDirection === "desc" ? 1 : -1;
            return 0;
        });
    }, [equipamentosFiltrados, sortField, sortDirection]);

    const totalPages = Math.ceil(equipamentosFiltrados.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const equipamentosPaginados = equipamentosOrdenados.slice(startIndex, endIndex);

    const total = equipamentos.length;
    const ativos = equipamentos.filter((e) => e.status === "ATIVO").length;
    const manutencao = equipamentos.filter((e) => e.status === "EM_MANUTENCAO").length;
    const setores = new Set(equipamentos.map((e) => e.setor).filter(Boolean)).size;

    const tipos = useMemo(() => {
        if (!Array.isArray(equipamentos)) return [];
        return [...new Set(equipamentos.map((e) => e.tipo).filter(Boolean))];
    }, [equipamentos]);

    async function handleCreateEquipamento(formData) {
        try {
            setSubmitLoading(true);
            await  equipamentosService.criar(formData);
            setIsModalOpen(false);
            await carregarEquipamentos();
            toast.success("Criado com sucesso!");
        } catch (error) {
            console.error("Erro ao criar equipamento: ", error);
            console.error("Resposta: ", error.response?.data);
            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Erro ao criar equipamento."
            );
        } finally {
            setSubmitLoading(false);
        }
    }

    async function handleUpdateEquipamento(formData) {
        try {
            setSubmitLoading(true);

            await equipamentosService.atualizar(
                selectedEquipamento.id,
                formData,
            );
            setIsModalOpen(false);
            setSelectedEquipamento(null);
            await carregarEquipamentos();
            toast.success("Atualizado com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar equipamento: ", error);
            console.error("Resposta: ", error.response?.data);

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Erro ao atualizar equipamento."
            );
        } finally {
            setSubmitLoading(false);
        }
    }

    async function handleConfirmDelete() {
        if (!equipamentoToDelete?.id) return;

        try {
            setDeleteLoading(true);
            const idExcluido = equipamentoToDelete.id;
            const tipoExcluido = equipamentoToDelete.tipo; // Guarda o tipo antes de deletar

            await equipamentosService.deletar(idExcluido);

            const novaLista = Array.isArray(equipamentos)
                ? equipamentos.filter((e) => e.id !== idExcluido)
                : [];

            setEquipamentos(novaLista);

            if (typeFilter === tipoExcluido) {
                const tipoExisteAinda = novaLista.some(e => e.tipo === tipoExcluido);
                if (!tipoExisteAinda) {
                    setTypeFilter("");
                }
            }

            setIsDeleteModalOpen(false);
            setEquipamentoToDelete(null);

            toast.success("Removido com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir equipamento:", error);
            console.error("Resposta:", error.response?.data);

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Erro ao excluir equipamento."
            );
        } finally {
            setDeleteLoading(false);
        }
    }

    function handleNovo() {
        setIsModalOpen(true);
    }

    function handleEdit(equipamento) {
        setSelectedEquipamento(equipamento);
        setIsModalOpen(true);
    }

    function handleDelete(equipamento) {
        setEquipamentoToDelete(equipamento);
        setIsDeleteModalOpen(true);
    }

    function handleSort(field) {
        if (sortField === field) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="p-4 md:p-6">
                <section className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-950">
                            Equipamentos
                        </h1>
                        <p className="mt-1 text-[16px] text-slate-600">
                            Cadastro e gestão de equipamentos industriais
                        </p>
                    </div>

                    {podeCriar && (
                        <button
                            onClick={handleNovo}
                            className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[15px] flex items-center gap-2 shadow-sm"
                        >
                            <Plus size={15} />
                            Novo Equipamento
                        </button>
                    )}
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                    <SummaryCard
                        title="Total de Equipamentos"
                        value={total}
                        subtitle="Cadastrados no sistema"
                        icon={<Cpu size={28} className="text-blue-600" />}
                        className="border-blue-200 bg-blue-50"
                    />

                    <SummaryCard
                        title="Equipamentos Ativos"
                        value={ativos}
                        subtitle={`${total > 0 ? Math.round((ativos / total) * 100) : 0}% do total`}
                        icon={<CheckCircle2 size={28} className="text-green-600" />}
                        className="border-green-200 bg-green-50"
                    />

                    <SummaryCard
                        title="Em Manutenção"
                        value={manutencao}
                        subtitle="Equipamentos em manutenção"
                        icon={<Wrench size={28} className="text-amber-600" />}
                        className="border-slate-200 bg-white"
                    />

                    <SummaryCard
                        title="Setores Atendidos"
                        value={setores}
                        subtitle="Setores com equipamentos"
                        icon={<Factory size={28} className="text-slate-600" />}
                        className="border-slate-200 bg-white"
                    />
                </section>

                <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 md:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                        <h2 className="text-[24px] md:text-xl font-bold text-slate-950">
                            Lista de Equipamentos
                        </h2>

                        <div className="h-12 rounded-2xl border border-slate-200 p-1 flex items-center bg-white">
                            <button
                                onClick={() => setViewMode("table")}
                                className={`h-full px-4 rounded-xl text-sm ${
                                    viewMode === "table"
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-600"
                                }`}
                            >
                                Tabela
                            </button>
                            <button
                                onClick={() => setViewMode("cards")}
                                className={`h-full px-4 rounded-xl text transition ${
                                    viewMode === "cards"
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-600"
                                }`}
                            >
                                Cards
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <EquipmentFilters
                            search={search}
                            setSearch={setSearch}
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            typeFilter={typeFilter}
                            setTypeFilter={setTypeFilter}
                            tipos={tipos}
                        />
                    </div>

                    {initialLoading ? (
                        <EquipmentTableSkeleton/>
                    ) : (
                        <>
                            {viewMode === "table" ? (
                                <EquipmentTable
                                    equipamentos={equipamentosPaginados}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onSort={handleSort}
                                    sortField={sortField}
                                    sortDirection={sortDirection}
                                    canEdit={podeEditar}
                                    canDelete={podeExcluir}
                                />
                            ) : (
                                <EquipmentCards
                                    equipamentos={equipamentosPaginados}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    canEdit={podeEditar}
                                    canDelete={podeExcluir}
                                />
                            )}
                            
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </>
                    )}
                </section>
            </main>
            <EquipmentFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedEquipamento(null);
                }}
                onSubmit={
                    selectedEquipamento
                        ? handleUpdateEquipamento
                        : handleCreateEquipamento
                }
                loading={submitLoading}
                mode={selectedEquipamento ? "edit" : "create"}
                initialData={selectedEquipamento}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setEquipamentoToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                loading={deleteLoading}
                equipamento={equipamentoToDelete}
            />
        </div>
    );
}

export default EquipamentosPage;