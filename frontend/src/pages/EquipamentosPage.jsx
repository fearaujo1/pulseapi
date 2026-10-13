import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
    CheckCircle2,
    Cpu,
    Plus,
    Wrench,
} from "lucide-react";

import {
    useAuth,
} from "../contexts/AuthContext.jsx";

import {
    ACOES,
    podeExecutar,
} from "../config/accessControl.js";

import {
    equipamentosService,
} from "../services/equipamentosService";

import Topbar from "../components/layout/Topbar";

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

    const perfil =
        usuario?.perfil;

    const podeCriar =
        podeExecutar(
            perfil,
            ACOES.EQUIPAMENTO_CRIAR
        );

    const podeEditar =
        podeExecutar(
            perfil,
            ACOES.EQUIPAMENTO_EDITAR
        );

    const podeExcluir =
        podeExecutar(
            perfil,
            ACOES.EQUIPAMENTO_EXCLUIR
        );

    const podeIntegrar =
        podeExecutar(
            perfil,
            ACOES.EQUIPAMENTO_INTEGRAR
        );

    const [equipamentos, setEquipamentos] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("");

    const [typeFilter, setTypeFilter] =
        useState("");

    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [submitLoading, setSubmitLoading] =
        useState(false);

    const [
        selectedEquipamento,
        setSelectedEquipamento,
    ] = useState(null);

    const [
        isDeleteModalOpen,
        setIsDeleteModalOpen,
    ] = useState(false);

    const [deleteLoading, setDeleteLoading] =
        useState(false);

    const [
        equipamentoToDelete,
        setEquipamentoToDelete,
    ] = useState(null);

    const [debouncedSearch, setDebouncedSearch] =
        useState("");

    const [currentPage, setCurrentPage] =
        useState(1);

    const itemsPerPage = 5;

    const [sortField, setSortField] =
        useState(null);

    const [sortDirection, setSortDirection] =
        useState("asc");

    const [initialLoading, setInitialLoading] =
        useState(true);

    const [viewMode, setViewMode] =
        useState("table");

    const carregarEquipamentos =
        useCallback(
            async (
                showLoading = false,
                showError = true
            ) => {
                try {
                    if (showLoading) {
                        setInitialLoading(true);
                    }

                    const data =
                        await equipamentosService
                            .listar();

                    setEquipamentos(
                        Array.isArray(data)
                            ? data
                            : []
                    );
                } catch (error) {
                    console.error(
                        "Erro ao carregar equipamentos:",
                        error
                    );

                    if (showLoading) {
                        setEquipamentos([]);
                    }

                    if (showError) {
                        toast.error(
                            error.response?.data?.detail ||
                            error.response?.data?.message ||
                            "Erro ao carregar equipamentos."
                        );
                    }
                } finally {
                    if (showLoading) {
                        setInitialLoading(false);
                    }
                }
            },
            []
        );

    useEffect(() => {
        carregarEquipamentos(
            true,
            true
        );

        const intervalId =
            window.setInterval(
                () => {
                    carregarEquipamentos(
                        false,
                        false
                    );
                },
                10000
            );

        return () => {
            window.clearInterval(
                intervalId
            );
        };
    }, [carregarEquipamentos]);

    useEffect(() => {
        const timerId =
            window.setTimeout(
                () => {
                    setDebouncedSearch(
                        search
                    );
                },
                300
            );

        return () => {
            window.clearTimeout(
                timerId
            );
        };
    }, [search]);

    useEffect(() => {
        setCurrentPage(1);
    }, [
        debouncedSearch,
        statusFilter,
        typeFilter,
    ]);

    const equipamentosFiltrados =
        useMemo(() => {
            if (!Array.isArray(equipamentos)) {
                return [];
            }

            const searchLower =
                debouncedSearch
                    .trim()
                    .toLowerCase();

            return equipamentos.filter(
                (item) => {
                    const matchSearch =
                        !searchLower ||
                        item.nome
                            ?.toLowerCase()
                            .includes(
                                searchLower
                            ) ||
                        item.codigo
                            ?.toLowerCase()
                            .includes(
                                searchLower
                            ) ||
                        item.plantaNome
                            ?.toLowerCase()
                            .includes(
                                searchLower
                            ) ||
                        item.linhaNome
                            ?.toLowerCase()
                            .includes(
                                searchLower
                            );

                    const matchStatus =
                        !statusFilter ||
                        item.status ===
                        statusFilter;

                    const matchType =
                        !typeFilter ||
                        item.tipo ===
                        typeFilter;

                    return (
                        matchSearch &&
                        matchStatus &&
                        matchType
                    );
                }
            );
        }, [
            equipamentos,
            debouncedSearch,
            statusFilter,
            typeFilter,
        ]);

    const equipamentosOrdenados =
        useMemo(() => {
            if (!Array.isArray(
                equipamentosFiltrados
            )) {
                return [];
            }

            if (!sortField) {
                return equipamentosFiltrados;
            }

            return [
                ...equipamentosFiltrados,
            ].sort((a, b) => {
                const aValue =
                    String(
                        a[sortField] ?? ""
                    ).toLowerCase();

                const bValue =
                    String(
                        b[sortField] ?? ""
                    ).toLowerCase();

                const comparacao =
                    aValue.localeCompare(
                        bValue,
                        "pt-BR"
                    );

                return sortDirection ===
                "asc"
                    ? comparacao
                    : -comparacao;
            });
        }, [
            equipamentosFiltrados,
            sortField,
            sortDirection,
        ]);

    const totalPages =
        Math.ceil(
            equipamentosOrdenados.length /
            itemsPerPage
        );

    const startIndex =
        (currentPage - 1) *
        itemsPerPage;

    const endIndex =
        startIndex +
        itemsPerPage;

    const equipamentosPaginados =
        equipamentosOrdenados.slice(
            startIndex,
            endIndex
        );

    const total =
        equipamentos.length;

    const ativos =
        equipamentos.filter(
            (equipamento) =>
                equipamento.status ===
                "ATIVO"
        ).length;

    const manutencao =
        equipamentos.filter(
            (equipamento) =>
                equipamento.status ===
                "EM_MANUTENCAO"
        ).length;

    const tipos =
        useMemo(() => {
            if (!Array.isArray(equipamentos)) {
                return [];
            }

            return [
                ...new Set(
                    equipamentos
                        .map(
                            (equipamento) =>
                                equipamento.tipo
                        )
                        .filter(Boolean)
                ),
            ];
        }, [equipamentos]);

    function informarAcessoNegado() {
        toast.error(
            "Você não possui permissão para realizar esta operação."
        );
    }

    async function handleCreateEquipamento(
        formData
    ) {
        if (!podeCriar) {
            informarAcessoNegado();
            return;
        }

        try {
            setSubmitLoading(true);

            await equipamentosService
                .cadastrar(formData);

            setIsModalOpen(false);

            await carregarEquipamentos(
                false,
                true
            );

            toast.success(
                "Equipamento criado com sucesso!"
            );
        } catch (error) {
            console.error(
                "Erro ao criar equipamento:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Erro ao criar equipamento."
            );
        } finally {
            setSubmitLoading(false);
        }
    }

    async function handleUpdateEquipamento(
        formData
    ) {
        if (!podeEditar) {
            informarAcessoNegado();
            return;
        }

        if (!selectedEquipamento?.id) {
            toast.error(
                "Nenhum equipamento foi selecionado."
            );
            return;
        }

        try {
            setSubmitLoading(true);

            await equipamentosService
                .atualizar(
                    selectedEquipamento.id,
                    formData
                );

            setIsModalOpen(false);
            setSelectedEquipamento(null);

            await carregarEquipamentos(
                false,
                true
            );

            toast.success(
                "Equipamento atualizado com sucesso!"
            );
        } catch (error) {
            console.error(
                "Erro ao atualizar equipamento:",
                error
            );

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
        if (!podeExcluir) {
            informarAcessoNegado();
            return;
        }

        if (!equipamentoToDelete?.id) {
            return;
        }

        try {
            setDeleteLoading(true);

            const idExcluido =
                equipamentoToDelete.id;

            const tipoExcluido =
                equipamentoToDelete.tipo;

            await equipamentosService
                .deletar(idExcluido);

            const novaLista =
                equipamentos.filter(
                    (equipamento) =>
                        equipamento.id !==
                        idExcluido
                );

            setEquipamentos(
                novaLista
            );

            if (
                typeFilter ===
                tipoExcluido
            ) {
                const tipoExisteAinda =
                    novaLista.some(
                        (equipamento) =>
                            equipamento.tipo ===
                            tipoExcluido
                    );

                if (!tipoExisteAinda) {
                    setTypeFilter("");
                }
            }

            setIsDeleteModalOpen(false);
            setEquipamentoToDelete(null);

            toast.success(
                "Equipamento removido com sucesso!"
            );
        } catch (error) {
            console.error(
                "Erro ao excluir equipamento:",
                error
            );

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
        if (!podeCriar) {
            informarAcessoNegado();
            return;
        }

        setSelectedEquipamento(null);
        setIsModalOpen(true);
    }

    function handleEdit(equipamento) {
        if (!podeEditar) {
            informarAcessoNegado();
            return;
        }

        setSelectedEquipamento(
            equipamento
        );

        setIsModalOpen(true);
    }

    function handleDelete(equipamento) {
        if (!podeExcluir) {
            informarAcessoNegado();
            return;
        }

        setEquipamentoToDelete(
            equipamento
        );

        setIsDeleteModalOpen(true);
    }

    function handleIntegracao(equipamento) {
        if (!podeIntegrar) {
            informarAcessoNegado();
            return;
        }

        if (!equipamento?.id) {
            return;
        }

        navigate(
            `/equipamentos/${equipamento.id}/integracao`
        );
    }

    function handleSort(field) {
        if (sortField === field) {
            setSortDirection(
                (direction) =>
                    direction === "asc"
                        ? "desc"
                        : "asc"
            );

            return;
        }

        setSortField(field);
        setSortDirection("asc");
    }

    function fecharModalFormulario() {
        if (submitLoading) {
            return;
        }

        setIsModalOpen(false);
        setSelectedEquipamento(null);
    }

    function fecharModalExclusao() {
        if (deleteLoading) {
            return;
        }

        setIsDeleteModalOpen(false);
        setEquipamentoToDelete(null);
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
                            Novo equipamento
                        </button>
                    )}
                </PageHeader>

                <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <SummaryCard
                        title="Total de equipamentos"
                        value={total}
                        subtitle="Cadastrados no sistema"
                        icon={
                            <Cpu
                                size={28}
                                className="text-blue-600"
                            />
                        }
                        className="border-blue-200 bg-blue-50"
                    />

                    <SummaryCard
                        title="Equipamentos ativos"
                        value={ativos}
                        subtitle={`${
                            total > 0
                                ? Math.round(
                                    (
                                        ativos /
                                        total
                                    ) *
                                    100
                                )
                                : 0
                        }% do total`}
                        icon={
                            <CheckCircle2
                                size={28}
                                className="text-green-600"
                            />
                        }
                        className="border-green-200 bg-green-50"
                    />

                    <SummaryCard
                        title="Em manutenção"
                        value={manutencao}
                        subtitle="Equipamentos em manutenção"
                        icon={
                            <Wrench
                                size={28}
                                className="text-amber-600"
                            />
                        }
                        className="border-slate-200 bg-white"
                    />
                </section>

                <ContentCard
                    title="Lista de equipamentos"
                    headerActions={
                        <div className="flex h-12 items-center rounded-2xl border border-slate-200 bg-white p-1">
                            <button
                                type="button"
                                onClick={() =>
                                    setViewMode(
                                        "table"
                                    )
                                }
                                className={`
                                    h-full rounded-xl
                                    px-4 text-sm transition
                                    ${
                                    viewMode ===
                                    "table"
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-600 hover:bg-slate-50"
                                }
                                `}
                            >
                                Tabela
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setViewMode(
                                        "cards"
                                    )
                                }
                                className={`
                                    h-full rounded-xl
                                    px-4 text-sm transition
                                    ${
                                    viewMode ===
                                    "cards"
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-600 hover:bg-slate-50"
                                }
                                `}
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
                            statusFilter={
                                statusFilter
                            }
                            setStatusFilter={
                                setStatusFilter
                            }
                            typeFilter={
                                typeFilter
                            }
                            setTypeFilter={
                                setTypeFilter
                            }
                            tipos={tipos}
                        />
                    </div>

                    {initialLoading ? (
                        <TableSkeleton
                            rows={5}
                            columns={
                                podeEditar ||
                                podeExcluir ||
                                podeIntegrar
                                    ? 7
                                    : 6
                            }
                            minWidth="70rem"
                        />
                    ) : (
                        <>
                            {viewMode ===
                            "table" ? (
                                <EquipmentTable
                                    equipamentos={
                                        equipamentosPaginados
                                    }
                                    onEdit={
                                        handleEdit
                                    }
                                    onDelete={
                                        handleDelete
                                    }
                                    onIntegracao={
                                        handleIntegracao
                                    }
                                    onSort={
                                        handleSort
                                    }
                                    sortField={
                                        sortField
                                    }
                                    sortDirection={
                                        sortDirection
                                    }
                                    canEdit={
                                        podeEditar
                                    }
                                    canDelete={
                                        podeExcluir
                                    }
                                    canIntegrate={
                                        podeIntegrar
                                    }
                                />
                            ) : (
                                <EquipmentCards
                                    equipamentos={
                                        equipamentosPaginados
                                    }
                                    onEdit={
                                        handleEdit
                                    }
                                    onDelete={
                                        handleDelete
                                    }
                                    onIntegracao={
                                        handleIntegracao
                                    }
                                    canEdit={
                                        podeEditar
                                    }
                                    canDelete={
                                        podeExcluir
                                    }
                                    canIntegrate={
                                        podeIntegrar
                                    }
                                />
                            )}

                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={
                                        currentPage
                                    }
                                    totalPages={
                                        totalPages
                                    }
                                    onPageChange={
                                        setCurrentPage
                                    }
                                />
                            )}
                        </>
                    )}
                </ContentCard>
            </main>

            {isModalOpen &&
                (
                    selectedEquipamento
                        ? podeEditar
                        : podeCriar
                ) && (
                    <EquipmentFormModal
                        key={
                            selectedEquipamento?.id ??
                            "novo-equipamento"
                        }
                        isOpen={
                            isModalOpen
                        }
                        onClose={
                            fecharModalFormulario
                        }
                        onSubmit={
                            selectedEquipamento
                                ? handleUpdateEquipamento
                                : handleCreateEquipamento
                        }
                        loading={
                            submitLoading
                        }
                        mode={
                            selectedEquipamento
                                ? "edit"
                                : "create"
                        }
                        initialData={
                            selectedEquipamento
                        }
                    />
                )}

            {podeExcluir && (
                <ConfirmDeleteModal
                    isOpen={
                        isDeleteModalOpen
                    }
                    onClose={
                        fecharModalExclusao
                    }
                    onConfirm={
                        handleConfirmDelete
                    }
                    loading={
                        deleteLoading
                    }
                    title="Excluir equipamento"
                    description="Confirme a exclusão deste equipamento."
                    warningMessage="O equipamento será removido permanentemente do sistema."
                    itemLabel="Equipamento selecionado"
                    itemName={
                        equipamentoToDelete?.nome
                    }
                    details={[
                        {
                            label: "Código",
                            value:
                            equipamentoToDelete
                                ?.codigo,
                        },
                        {
                            label: "Planta",
                            value:
                            equipamentoToDelete
                                ?.plantaNome,
                        },
                        {
                            label: "Linha",
                            value:
                            equipamentoToDelete
                                ?.linhaNome,
                        },
                        {
                            label: "Tipo",
                            value:
                            equipamentoToDelete
                                ?.tipo,
                        },
                        {
                            label: "IP",
                            value:
                            equipamentoToDelete
                                ?.ip,
                        },
                        {
                            label: "Porta",
                            value:
                            equipamentoToDelete
                                ?.porta,
                        },
                        {
                            label: "Protocolo",
                            value:
                            equipamentoToDelete
                                ?.protocolo,
                        },
                    ]}
                    confirmText="Excluir equipamento"
                />
            )}
        </div>
    );
}

export default EquipamentosPage;