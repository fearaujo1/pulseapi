import { useCallback, useEffect, useMemo, useState } from "react";
import {AlertTriangle, ClipboardList, OctagonX, Plus, Wrench} from "lucide-react";
import toast from "react-hot-toast";
import { ACOES, podeExecutar } from "../config/accessControl.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { equipamentosService } from "../services/equipamentosService.js";
import { ocorrenciaService } from "../services/ocorrenciaService.js";
import Topbar from "../components/layout/Topbar.jsx";
import EventoFilters from "../components/events/EventoFilters.jsx";
import EventoFormModal from "../components/events/EventoFormModal.jsx";
import EventoTable from "../components/events/EventoTable.jsx";
import EventoDetailsModal from "../components/events/EventoDetailsModal.jsx";
import Pagination from "../components/common/Pagination.jsx";
import SummaryCard from "../components/common/SummaryCard.jsx";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import ContentCard from "../components/common/ContentCard.jsx";
import usePagination from "../hooks/usePagination.js";

function EventosPage() {
    const { usuario } = useAuth();
    const perfil = usuario?.perfil;
    const podeCriar = podeExecutar(perfil, ACOES.EVENTO_CRIAR);
    const podeEditar = podeExecutar(perfil, ACOES.EVENTO_EDITAR);
    const podeAlterarStatus = podeExecutar(perfil, ACOES.EVENTO_ALTERAR_STATUS);
    const podeExcluir = podeExecutar(perfil, ACOES.EVENTO_EXCLUIR);

    const [eventos, setEventos] = useState([]);
    const [equipamentos, setEquipamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [tipoFilter, setTipoFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvento, setSelectedEvento] = useState(null);
    const [selectedEventoDetails, setSelectedEventoDetails] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [eventoToDelete, setEventoToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const carregarEventos = useCallback(async () => {
        try {
            setLoading(true);
            const data = await ocorrenciaService.listar();
            setEventos(Array.isArray(data) ? data : []);
        } catch (error) {
            mostrarErro(error, "Não foi possível carregar as ocorrências.");
            setEventos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const carregarEquipamentos = useCallback(async () => {
        try {
            const data = await equipamentosService.listar();
            setEquipamentos(Array.isArray(data) ? data : []);
        } catch (error) {
            mostrarErro(error, "Não foi possível carregar os equipamentos.");
            setEquipamentos([]);
        }
    }, []);

    useEffect(() => { carregarEventos(); carregarEquipamentos(); }, [carregarEventos, carregarEquipamentos]);

    const eventosFiltrados = useMemo(() => {
        const termo = search.trim().toLowerCase();
        return eventos.filter((evento) => {
            const correspondeBusca = !termo || evento.titulo?.toLowerCase().includes(termo) || evento.descricao?.toLowerCase().includes(termo) || evento.equipamentoNome?.toLowerCase().includes(termo) || evento.equipamentoCodigo?.toLowerCase().includes(termo);
            return correspondeBusca && (!tipoFilter || evento.tipo === tipoFilter) && (!statusFilter || evento.status === statusFilter);
        });
    }, [eventos, search, tipoFilter, statusFilter]);

    const {
        currentPage,
        totalPages,
        paginatedItems: eventosPaginados,
        setCurrentPage,
        resetPage,
    } = usePagination(eventosFiltrados, 8);

    function handleSearchChange(value) {
        setSearch(value);
        resetPage();
    }

    function handleTipoChange(value) {
        setTipoFilter(value);
        resetPage();
    }

    function handleStatusChange(value) {
        setStatusFilter(value);
        resetPage();
    }

    function negar() {
        toast.error("Você não possui permissão para realizar esta operação.");
    }

    function abrirNovoEvento() {
        if (!podeCriar) return negar();
        setSelectedEvento(null);
        setIsModalOpen(true);
    }

    function editarEvento(evento) {
        if (!podeEditar) return negar();
        setSelectedEvento(evento);
        setIsModalOpen(true);
    }

    async function criarEvento(formData) {
        if (!podeCriar) return negar();
        try {
            setSubmitLoading(true);
            await ocorrenciaService.criar({ titulo: formData.titulo, descricao: formData.descricao, tipo: formData.tipo, equipamentoId: Number(formData.equipamentoId), status: "ABERTA" });
            fecharFormulario();
            await carregarEventos();
            toast.success("Ocorrência criada com sucesso!");
        } catch (error) { mostrarErro(error, "Não foi possível criar a ocorrência."); }
        finally { setSubmitLoading(false); }
    }

    async function atualizarEvento(formData) {
        if (!podeEditar || !selectedEvento) return negar();
        const statusFoiAlterado = formData.status !== selectedEvento.status;
        if (statusFoiAlterado && !podeAlterarStatus) return negar();
        try {
            setSubmitLoading(true);
            await ocorrenciaService.atualizar(selectedEvento.id, { titulo: formData.titulo, descricao: formData.descricao, tipo: formData.tipo, equipamentoId: Number(formData.equipamentoId) });
            if (statusFoiAlterado) await ocorrenciaService.atualizarStatus(selectedEvento.id, formData.status);
            fecharFormulario();
            await carregarEventos();
            toast.success("Ocorrência atualizada com sucesso!");
        } catch (error) { mostrarErro(error, "Não foi possível atualizar a ocorrência."); }
        finally { setSubmitLoading(false); }
    }

    async function confirmarExclusao() {
        if (!podeExcluir) return negar();
        if (!eventoToDelete?.id) return;
        try {
            setDeleteLoading(true);
            await ocorrenciaService.deletar(eventoToDelete.id);
            setEventos((anteriores) => anteriores.filter((evento) => evento.id !== eventoToDelete.id));
            setEventoToDelete(null);
            toast.success("Ocorrência excluída com sucesso!");
        } catch (error) { mostrarErro(error, "Não foi possível excluir a ocorrência."); }
        finally { setDeleteLoading(false); }
    }

    function fecharFormulario() { if (submitLoading) return; setIsModalOpen(false); setSelectedEvento(null); }

    const indicadoresOcorrencias = useMemo(() => {
        const total = eventos.length;
        const falhas = contar(eventos, "tipo", "FALHA_EQUIPAMENTO");
        const paradas = contar(eventos, "tipo", "PARADA_LINHA");
        const manutencoes = contar(eventos, "tipo", "MANUTENCAO");
        // import {AlertTriangle, CheckCircle2, CircleAlert, ClipboardList, Cpu, Plus, Wrench} from "lucide-react";
        return [
            { label: "Total de Ocorrências", value: total, detail: "registradas", icon: ClipboardList, color: "bg-blue-50 text-blue-600" },
            { label: "Falhas", value: falhas, detail: "em equipmaentos", icon: AlertTriangle, color: "bg-amber-50 text-amber-600" },
            { label: "Paradas de Linha", value: paradas, detail: "críticas", icon: OctagonX, color: "bg-rose-50 text-rose-600" },
            { label: "Manutenções", value: manutencoes, detail: "em andamento", icon: Wrench, color: "bg-violet-50 text-violet-600" },
        ]
    }, [eventos]);

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />
            <main className="mx-auto w-full max-w-450 px-4 py-5 md:px-6 lg:px-8">
                <PageHeader title="Eventos e ocorrências" description="Acompanhe falhas, paradas e intervenções operacionais">
                    {podeCriar && <button type="button" onClick={abrirNovoEvento} className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"><Plus size={15} />Nova ocorrência</button>}
                </PageHeader>

                <SummaryCard
                    items={indicadoresOcorrencias}
                />

                <ContentCard title="Histórico de ocorrências" subtitle={`${eventosFiltrados.length} registro(s) encontrado(s)`}>
                    <div className="mb-5">
                        <EventoFilters
                            search={search}
                            onSearchChange={handleSearchChange}
                            tipoFilter={tipoFilter}
                            onTipoChange={handleTipoChange}
                            statusFilter={statusFilter}
                            onStatusChange={handleStatusChange}
                        />
                    </div>
                    <EventoTable
                        eventos={eventosPaginados}
                        loading={loading}
                        onView={setSelectedEvento}
                        onEdit={editarEvento}
                        onDelete={setEventoToDelete}
                        canEdit={podeEditar}
                        canDelete={podeExcluir}
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

            {(selectedEvento ? podeEditar : podeCriar) && <EventoFormModal key={selectedEvento?.id ?? "novo-evento"} isOpen={isModalOpen} onClose={fecharFormulario} onSubmit={selectedEvento ? atualizarEvento : criarEvento} loading={submitLoading} mode={selectedEvento ? "edit" : "create"} initialData={selectedEvento} equipamentos={equipamentos} canChangeStatus={podeAlterarStatus} />}
            {podeExcluir && <ConfirmDeleteModal isOpen={Boolean(eventoToDelete)} onClose={() => !deleteLoading && setEventoToDelete(null)} onConfirm={confirmarExclusao} loading={deleteLoading} title="Excluir ocorrência" description="Confirme a exclusão deste registro." warningMessage="A ocorrência será removida definitivamente do histórico." itemLabel="Ocorrência selecionada" itemName={eventoToDelete?.titulo} details={[{ label: "Equipamento", value: eventoToDelete?.equipamentoNome }, { label: "Tipo", value: eventoToDelete?.tipo }]} confirmText="Excluir ocorrência" />}
            <EventoDetailsModal evento={selectedEventoDetails} onClose={() => setSelectedEventoDetails(null)} />
        </div>
    );
}

function contar(lista, campo, valor) { return lista.filter((item) => item[campo] === valor).length; }
function mostrarErro(error, fallback) { console.error(fallback, error); toast.error(error.response?.data?.detail || error.response?.data?.message || fallback); }
export default EventosPage;
