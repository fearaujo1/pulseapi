import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    CircleAlert,
    ClipboardList,
    Plus,
    Wrench,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import Topbar from "../components/layout/Topbar";
import { equipamentosService } from "../services/equipamentosService";
import { ocorrenciaService } from "../services/ocorrenciaService.js";

import EventoFilters from "../components/events/EventoFilters.jsx"
import EventoFormModal from "../components/events/EventoFormModal";
import EventoTable from "../components/events/EventoTable.jsx";
import EventoDetailsModal from "../components/events/EventoDetailsModal";

import Pagination from "../components/common/Pagination.jsx"
import SummaryCard from "../components/common/SummaryCard.jsx";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal.jsx";
import PageHeader from "../components/common/PageHeader";
import ContentCard from "../components/common/ContentCard";

function EventosPage() {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [tipoFilter, setTipoFilter] = useState("");

    const [equipamentos, setEquipamentos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvento, setSelectedEvento] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [eventoToDelete, setEventoToDelete] = useState(null);

    // PAGINAÇÃO
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // MODAL SOBRE INFO DE OCORRÊNCIAS
    const [selectedEventoDetails, setSelectedEventoDetails] = useState(null);

    const [statusFilter, setStatusFilter] = useState("");

    const { usuario } = useAuth();

    const podeGerenciarEventos = ["ADMIN", "GESTOR", "SUPERVISOR"].includes(
        usuario?.perfil
    );

    async function carregarEquipamentos() {
        try {
            const data = await equipamentosService.listar();
            setEquipamentos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao carregar equipamentos:", error);
            console.error("Resposta:", error.response?.data);
            toast.error("Erro ao carregar equipamentos.");
            setEquipamentos([]);
        }
    }

    async function carregarEventos() {
        try {
            setLoading(true);

            const data = await ocorrenciaService.listar();
            setEventos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao carregar eventos:", error);
            console.error("Resposta:", error.response?.data);
            toast.error("Erro ao carregar eventos.");
            setEventos([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        carregarEventos();
        carregarEquipamentos()
    }, []);

    function handleNovoEvento() {
        setSelectedEvento(null);
        setIsModalOpen(true);
    }

    function handleEditEvento(evento) {
        setSelectedEvento(evento);
        setIsModalOpen(true);
    }

    async function handleCreateEvento(formData) {
        try {
            setSubmitLoading(true);

            const payload = {
                titulo: formData.titulo,
                descricao: formData.descricao,
                tipo: formData.tipo,
                equipamentoId: Number(formData.equipamentoId),
                status: "ABERTA",
            };

            await ocorrenciaService.criar(payload);

            setIsModalOpen(false);
            await carregarEventos();

            toast.success("Ocorrência criada com sucesso!");
        } catch (error) {
            console.error("Erro ao criar ocorrência:", error);
            console.error("Resposta:", error.response?.data);

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Erro ao criar ocorrência."
            );
        } finally {
            setSubmitLoading(false);
        }
    }

    async function handleUpdateEvento(formData) {
        try {
            setSubmitLoading(true);

            const payload = {
                titulo: formData.titulo,
                descricao: formData.descricao,
                tipo: formData.tipo,
                equipamentoId: Number(formData.equipamentoId),
            };

            await ocorrenciaService.atualizar(selectedEvento.id, payload);

            if (formData.status && formData.status !== selectedEvento.status) {
                await ocorrenciaService.atualizarStatus(selectedEvento.id, formData.status);
            }

            setIsModalOpen(false);
            setSelectedEvento(null);

            await carregarEventos();

            toast.success("Ocorrência atualizada com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar ocorrência:", error);
            console.error("Resposta:", error.response?.data);

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Erro ao atualizar ocorrência."
            );
        } finally {
            setSubmitLoading(false);
        }
    }

    function handleDeleteEvento(evento) {
        setEventoToDelete(evento);
        setIsDeleteModalOpen(true);
    }

    async function handleConfirmDeleteEvento() {
        if (!eventoToDelete?.id) return;

        try {
            setDeleteLoading(true);

            await ocorrenciaService.deletar(eventoToDelete.id);

            setEventos((prev) =>
                prev.filter((evento) => evento.id !== eventoToDelete.id)
            );

            setIsDeleteModalOpen(false);
            setEventoToDelete(null);

            toast.success("Ocorrência excluída com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir ocorrência:", error);
            console.error("Resposta:", error.response?.data);

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Erro ao excluir ocorrência."
            );
        } finally {
            setDeleteLoading(false);
        }
    }

    const eventosFiltrados = useMemo(() => {
        const searchLower = search.trim().toLowerCase();

        return eventos.filter((evento) => {
            const matchSearch =
                !searchLower ||
                evento.titulo?.toLowerCase().includes(searchLower) ||
                evento.descricao?.toLowerCase().includes(searchLower) ||
                evento.equipamentoNome?.toLowerCase().includes(searchLower) ||
                evento.equipamentoCodigo?.toLowerCase().includes(searchLower);

            const matchTipo = !tipoFilter || evento.tipo === tipoFilter;
            const matchStatus = !statusFilter || evento.status === statusFilter;

            return matchSearch && matchTipo && matchStatus;
        });
    }, [eventos, search, tipoFilter, statusFilter]);

    const totalPages = Math.ceil(
        eventosFiltrados.length / itemsPerPage
    );

    const eventosPaginados = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        return eventosFiltrados.slice(startIndex, endIndex);
    }, [eventosFiltrados, currentPage]);

    // Força o retorno a primeira página quando os filtros mudarem
    useEffect(() => {
       setCurrentPage(1);
    }, [search, tipoFilter, statusFilter]);

    // Proteção para exclusões
    useEffect(() => {
        if (totalPages === 0) {
            setCurrentPage(1);
            return;
        }

        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const total = eventos.length;
    const falhas = eventos.filter((e) => e.tipo === "FALHA_EQUIPAMENTO").length;
    const paradas = eventos.filter((e) => e.tipo === "PARADA_LINHA").length;
    const manutencoes = eventos.filter((e) => e.tipo === "MANUTENCAO").length;

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="p-4 md:p-6">
                <PageHeader
                    title="Eventos e Ocorrências"
                    description="Registro e acompanhamento de ocorrências, falhas e paradas de produção"
                >
                    {podeGerenciarEventos && (
                        <button
                            type="button"
                            onClick={handleNovoEvento}
                            className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-[15px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            <Plus size={15} />
                            Nova Ocorrência
                        </button>
                    )}
                </PageHeader>

                <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                    <SummaryCard
                        title="Total de Eventos"
                        value={total}
                        subtitle="Ocorrências registradas"
                        icon={<ClipboardList size={28} className="text-blue-600" />}
                        className="border-blue-200 bg-blue-50"
                    />

                    <SummaryCard
                        title="Falhas de Equipamento"
                        value={falhas}
                        subtitle="Falhas registradas"
                        icon={<AlertTriangle size={28} className="text-red-600" />}
                        className="border-red-200 bg-red-50"
                    />

                    <SummaryCard
                        title="Paradas de Linha"
                        value={paradas}
                        subtitle="Paradas operacionais"
                        icon={<CircleAlert size={28} className="text-amber-600" />}
                        className="border-amber-200 bg-amber-50"
                    />

                    <SummaryCard
                        title="Manutenções"
                        value={manutencoes}
                        subtitle="Eventos de manutenção"
                        icon={<Wrench size={28} className="text-slate-600" />}
                        className="border-slate-200 bg-white"
                    />
                </section>

                <ContentCard title={`Lista de Eventos (${eventosFiltrados.length})`}>
                    <div className="mb-6">
                        <EventoFilters
                            search={search}
                            onSearchChange={setSearch}
                            tipoFilter={tipoFilter}
                            onTipoChange={setTipoFilter}
                            statusFilter={statusFilter}
                            onStatusChange={setStatusFilter}
                        />
                    </div>

                    <EventoTable
                        eventos={eventosPaginados}
                        loading={loading}
                        onView={setSelectedEventoDetails}
                        onEdit={handleEditEvento}
                        onDelete={handleDeleteEvento}
                        canManage={podeGerenciarEventos}
                    />

                    {!loading && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </ContentCard>
            </main>
            {isModalOpen && (
                <EventoFormModal
                    key={selectedEvento?.id ?? "novo-evento"}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedEvento(null);
                    }}
                    onSubmit={
                        selectedEvento
                            ? handleUpdateEvento
                            : handleCreateEvento
                    }
                    loading={submitLoading}
                    mode={selectedEvento ? "edit" : "create"}
                    initialData={selectedEvento}
                    equipamentos={equipamentos}
                />
            )}
            
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setEventoToDelete(null);
                }}
                onConfirm={handleConfirmDeleteEvento}
                loading={deleteLoading}
                title="Excluir Ocorrência"
                description="Confirme a exclusão desta ocorrência."
                warningMessage="A ocorrência será removida do histórico de eventos."
                itemLabel="Ocorrência selecionada"
                itemName={eventoToDelete?.titulo}
                details={[
                    {
                        label: "Equipamento",
                        value: eventoToDelete?.equipamentoNome,
                    },
                    {
                        label: "Tipo",
                        value: eventoToDelete?.tipo,
                    },
                ]}
                confirmText="Excluir Ocorrência"
            />

            <EventoDetailsModal
                evento={selectedEventoDetails}
                onClose={() => setSelectedEventoDetails(null)}
            />
        </div>

    );
}
export default EventosPage;