import { useEffect, useMemo, useState} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import toast from "react-hot-toast";
import Topbar from "../components/layout/Topbar";
import { Plus, Cpu, CheckCircle2, Wrench, Factory } from "lucide-react";
import { equipamentosService } from "../services/equipamentosService";

import EquipmentFilters from "../components/equipment/EquipmentFilters";
import EquipmentFormModal from "../components/equipment/EquipmentFormModal";
import EquipmentTable from "../components/equipment/EquipmentTable";
import EquipmentCards from "../components/equipment/EquipmentCards.jsx";

import SummaryCard from "../components/common/SummaryCard.jsx";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal.jsx";
import TableSkeleton from "../components/common/TableSkeleton.jsx";
import Pagination from "../components/common/Pagination.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import ContentCard from "../components/common/ContentCard.jsx";

function EquipamentosPage() {

    const navigate = useNavigate();
    const { usuario } = useAuth();


    const podeCriar = ["ADMIN", "GESTOR", "SUPERVISOR"].includes(usuario?.perfil)
    const podeEditar = ["ADMIN", "GESTOR", "SUPERVISOR"].includes(usuario?.perfil)
    const podeExcluir = ["ADMIN", "GESTOR", "SUPERVISOR"].includes(usuario?.perfil)


    const [equipamentos, setEquipamentos] = useState([]);

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
                setInitialLoading(true);
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
            await  equipamentosService.cadastrar(formData);
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

    function handleIntegracao(equipamento) {
        navigate(`/equipamentos/${equipamento.id}/integracao`);
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
                <PageHeader
                    title="Equipamentos"
                    description="Cadastro e gestão de equipamentos industriais"
                >
                    {podeCriar && (
                        <button
                            type="button"
                            onClick={handleNovo}
                            className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            <Plus size={15} />
                            Novo Equipamento
                        </button>
                    )}
                </PageHeader>

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

                <ContentCard
                    title="Lista de Equipamentos"
                    headerActions={
                        <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-white p-1">
                            <button
                                type="button"
                                onClick={() => setViewMode("table")}
                                className={`h-full rounded-xl px-4 text-sm transition ${
                                    viewMode === "table"
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                Tabela
                            </button>

                            <button
                                type="button"
                                onClick={() => setViewMode("cards")}
                                className={`h-full rounded-xl px-4 text-sm transition ${
                                    viewMode === "cards"
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                Cards
                            </button>
                        </div>
                    }
                >
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
                        <TableSkeleton
                            rows={5}
                            columns={9}
                            minWidth="1200px"
                        />
                    ) : (
                        <>
                            {viewMode === "table" ? (
                                <EquipmentTable
                                    equipamentos={equipamentosPaginados}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onIntegracao={handleIntegracao}
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
                                    onIntegracao={handleIntegracao}
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
                </ContentCard>
            </main>
            {isModalOpen && (
                <EquipmentFormModal
                    key={selectedEquipamento?.id ?? "novo-equipamento"}
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
            )}

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setEquipamentoToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                loading={deleteLoading}
                title="Excluir Equipamento"
                description="Confirme a exclusão deste equipamento."
                warningMessage="O equipamento será removido permanentemente do sistema."
                itemLabel="Equipamento selecionado"
                itemName={equipamentoToDelete?.nome}
                details={[
                    {
                        label: "Código",
                        value: equipamentoToDelete?.codigo,
                    },
                    {
                        label: "Tipo",
                        value: equipamentoToDelete?.tipo,
                    },
                    {
                        label: "Setor",
                        value: equipamentoToDelete?.setor,
                    },
                    {
                        label: "IP",
                        value: equipamentoToDelete?.ip,
                    },
                    {
                        label: "Porta",
                        value: equipamentoToDelete?.porta,
                    },
                    {
                        label: "Protocolo",
                        value: equipamentoToDelete?.protocolo,
                    },
                ]}
                confirmText="Excluir Equipamento"
            />
        </div>
    );
}

export default EquipamentosPage;