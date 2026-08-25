import { useEffect ,useMemo, useState } from "react";
import {
    Users,
    UserCheck,
    UserX,
    Shield,
    Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import Topbar from "../components/layout/Topbar";
import { usuarioService } from "../services/usuarioService";
import { configuracaoService} from "../services/configuracaoService.js";
import UserFormModal from "../components/users/UserFormModal";
import UserFilters from "../components/users/UserFilters";
import UserTable from "../components/users/UserTable";

import SummaryCard from "../components/common/SummaryCard.jsx";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal.jsx";
import Pagination from "../components/common/Pagination.jsx";
import PageHeader from "../components/common/PageHeader";
import ContentCard from "../components/common/ContentCard";

function perfilToPerfilId(perfil) {
    const map = {
        ADMIN: 1,
        GESTOR: 2,
        SUPERVISOR: 3,
        OPERADOR: 4,
    };

    return map[perfil] || 4;
}


function UsuariosPage() {
    const [activeTab, setActiveTab] = useState("usuarios");
    const [search, setSearch] = useState("");
    const [perfilFilter, setPerfilFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal para criar um novo usuário
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    //Modal para atualizar um usuário
    const [selectedUsuario, setSelectedUsuario] = useState(null);

    //Modal para deletar um usuário
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [usuarioToDelete, setUsuarioToDelete] = useState(null);

    // PAGINAÇÃO
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Tratamento de turnos
    const [turnos, setTurnos] = useState([]);

    async function carregarUsuarios() {
        try {
            setLoading(true);

            const data = await usuarioService.listar();

            if (!Array.isArray(data)) {
                throw new Error("Resposta inválida da API de usuários.")
            }

            setUsuarios(data);
        } catch (error) {
            console.error("Erro ao carregar usuários: ", error);
            console.error("Resposta: ", error.response?.data);
            toast.error("Erro ao carregar usuários: ", error);
            setUsuarios([]);
        } finally {
            setLoading(false);
        }
    }
    async function handleCreateUsuario(formData) {
        try {
            setSubmitLoading(true);

            const payload = {
                nome: formData.nome,
                email: formData.email,
                senhaTemporaria: formData.senhaTemporaria,
                telefone: formData.telefone || null,
                perfilId: Number(formData.perfilId || 4),
                turnoIds: Number(formData.perfilId) === 4 ? formData.turnoIds || [] : [],
            };

            console.log("FORM DATA:", formData);
            console.log("PAYLOAD CREATE:", payload);

            await usuarioService.criar(payload);

            setIsUserModalOpen(false);
            await carregarUsuarios();

            toast.success("Usuário criado com sucesso!");
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
            console.error("Resposta:", error.response?.data);

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Erro ao criar usuário."
            );
        } finally {
            setSubmitLoading(false);
        }
    }
    async function handleUpdateUsuario(formData) {
        try {
            setSubmitLoading(true);

            const payload = {
                nome: formData.nome,
                email: formData.email,
                telefone: formData.telefone || null,
                perfilId: Number(formData.perfilId || selectedUsuario?.perfilId || 4),
                turnoIds: Number(formData.perfilId) === 4 ? formData.turnoIds || [] : [],
            };

            await usuarioService.atualizar(selectedUsuario.id, payload);

            setIsUserModalOpen(false);
            setSelectedUsuario(null);

            await carregarUsuarios();

            toast.success("Usuário atualizado com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar usuário:", error);
            console.error("Resposta:", error.response?.data);

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Erro ao atualizar usuário."
            );
        } finally {
            setSubmitLoading(false);
        }
    }
    function handleEditUsuario(usuario) {
        setSelectedUsuario(usuario);
        setIsUserModalOpen(true);
    }
    async function handleToggleStatusUsuario(usuario) {
        const novoStatus = usuario.status === "ATIVO" ? "INATIVO" : "ATIVO";

        try {
            await usuarioService.atualizarStatus(usuario.id, novoStatus);

            setUsuarios((prev) =>
                prev.map((item) =>
                    item.id === usuario.id
                        ? { ...item, status: novoStatus }
                        : item
                )
            );

            toast.success(
                novoStatus === "ATIVO"
                    ? "Usuário ativado com sucesso!"
                    : "Usuário inativado com sucesso!"
            );
        } catch (error) {
            console.error("Erro ao atualizar status do usuário:", error);
            console.error("Resposta:", error.response?.data);

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Erro ao atualizar status do usuário."
            );
        }
    }
    function handleDeleteUsuario(usuario) {
        setUsuarioToDelete(usuario);
        setIsDeleteModalOpen(true);
    }
    async function handleConfirmDeleteUsuario() {
        if (!usuarioToDelete?.id) return;

        try {
            setDeleteLoading(true);

            await usuarioService.deletar(usuarioToDelete.id);

            setUsuarios((prev) =>
                prev.filter((usuario) => usuario.id !== usuarioToDelete.id)
            );

            setIsDeleteModalOpen(false);
            setUsuarioToDelete(null);

            toast.success("Usuário excluído com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir usuário:", error);
            console.error("Resposta:", error.response?.data);

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Erro ao excluir usuário."
            );
        } finally {
            setDeleteLoading(false);
        }
    }

    useEffect(() => {
        carregarUsuarios();
        carregarTurnos();
    }, []);

    const usuariosFiltrados = useMemo(() => {
        const searchLower = search.trim().toLowerCase();

        return usuarios.filter((usuario) => {
            const matchSearch =
                !searchLower ||
                usuario.nome.toLowerCase().includes(searchLower) ||
                usuario.email.toLowerCase().includes(searchLower);

            const matchPerfil = !perfilFilter || perfilToPerfilId(usuario.perfil) === Number(perfilFilter);
            const matchStatus = !statusFilter || usuario.status === statusFilter;

            return matchSearch && matchPerfil && matchStatus;
        });
    }, [usuarios, search, perfilFilter, statusFilter]);

    const totalPages = Math.ceil(
        usuariosFiltrados.length / itemsPerPage
    );

    const usuariosPaginados = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        return usuariosFiltrados.slice(startIndex, endIndex);
    }, [usuariosFiltrados, currentPage]);

    // Força o retorno a primeira página quando os filtros mudarem
    useEffect(() => {
        setCurrentPage(1);
    }, [search, perfilFilter, statusFilter]);

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

    const total = usuarios.length;
    const ativos = usuarios.filter((u) => u.status === "ATIVO").length;
    const inativos = usuarios.filter((u) => u.status === "INATIVO").length;
    const perfis = new Set(usuarios.map((u) => u.perfil)).size;


    async function carregarTurnos() {
        try {
            const data = await configuracaoService.listarTurnos();

            setTurnos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao carregar turnos: ", error);

            toast.error(
                "Erro ao carregar turnos."
            );

            setTurnos([]);
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="p-4 md:p-6">
                <PageHeader
                    title="Usuários e Permissões"
                    description="Gerencie usuários, perfis e controle de acesso"
                >
                    <button
                        type="button"
                        className="flex h-12 items-center gap-3 rounded-2xl border border-blue-200 bg-white px-6 font-semibold text-blue-600 transition hover:bg-blue-50"
                    >
                        <Shield size={20} />
                        Novo Perfil
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setSelectedUsuario(null);
                            setIsUserModalOpen(true);
                        }}
                        className="flex h-12 items-center gap-3 rounded-2xl bg-blue-600 px-6 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                        <Plus size={20} />
                        Novo Usuário
                    </button>
                </PageHeader>

                <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                    <SummaryCard
                        title="Total de Usuários"
                        value={total}
                        subtitle="Cadastrados no sistema"
                        icon={<Users size={34} className="text-blue-600" />}
                        className="border-blue-200 bg-blue-50"
                    />

                    <SummaryCard
                        title="Usuários Ativos"
                        value={ativos}
                        subtitle={`${total > 0 ? Math.round((ativos / total) * 100) : 0}% do total`}
                        icon={<UserCheck size={34} className="text-green-600" />}
                        className="border-green-200 bg-green-50"
                    />

                    <SummaryCard
                        title="Usuários Inativos"
                        value={inativos}
                        subtitle="Sem acesso ao sistema"
                        icon={<UserX size={34} className="text-slate-600" />}
                        className="border-slate-200 bg-white"
                    />

                    <SummaryCard
                        title="Perfis de Acesso"
                        value={perfis}
                        subtitle="Níveis de permissão"
                        icon={<Shield size={34} className="text-slate-700" />}
                        className="border-slate-200 bg-white"
                    />
                </section>

                <section className="mb-8">
                    <div className="h-14 rounded-full bg-slate-200/70 p-1 flex items-center">
                        <button
                            onClick={() => setActiveTab("usuarios")}
                            className={`w-1/2 h-full rounded-full flex items-center justify-center gap-2 font-semibold ${
                                activeTab === "usuarios" ? "bg-white shadow-sm" : "text-slate-600"
                            }`}
                        >
                            <Users size={18} />
                            Usuários
                        </button>

                        <button
                            onClick={() => setActiveTab("perfis")}
                            className={`w-1/2 h-full rounded-full flex items-center justify-center gap-2 font-semibold ${
                                activeTab === "perfis" ? "bg-white shadow-sm" : "text-slate-600"
                            }`}
                        >
                            <Shield size={18} />
                            Perfis e Permissões
                        </button>
                    </div>
                </section>

                {activeTab === "usuarios" && (
                    <ContentCard title="Lista de Usuários">
                        <div className="mb-6">
                            <UserFilters
                                search={search}
                                onSearchChange={setSearch}
                                perfilFilter={perfilFilter}
                                onPerfilChange={setPerfilFilter}
                                statusFilter={statusFilter}
                                onStatusChange={setStatusFilter}
                            />
                        </div>

                        <UserTable
                            usuarios={usuariosPaginados}
                            loading={loading}
                            onEdit={handleEditUsuario}
                            onToggleStatus={handleToggleStatusUsuario}
                            onDelete={handleDeleteUsuario}
                        />

                        {!loading && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </ContentCard>
                )}

                {activeTab === "perfis" && (
                    <ContentCard
                        title="Perfis e Permissões"
                        subtitle="Próxima etapa: montar cards de perfis e matriz de permissões."
                    />
                )}
            </main>

            {isUserModalOpen && (
                <UserFormModal
                    key={selectedUsuario?.id ?? "novo-usuario"}
                    isOpen={isUserModalOpen}
                    onClose={() => {
                        setIsUserModalOpen(false);
                        setSelectedUsuario(null);
                    }}
                    onSubmit={
                        selectedUsuario
                            ? handleUpdateUsuario
                            : handleCreateUsuario
                    }
                    loading={submitLoading}
                    mode={selectedUsuario ? "edit" : "create"}
                    initialData={selectedUsuario}
                    turnos={turnos}
                />
            )}

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setUsuarioToDelete(null);
                }}
                onConfirm={handleConfirmDeleteUsuario}
                loading={deleteLoading}
                title="Excluir usuário"
                description="Confirme a exclusão deste usuário do sistema."
                warningMessage="O usuário será removido permanentemente do sistema."
                itemLabel="Usuário selecionado"
                itemName={usuarioToDelete?.nome}
                details={[
                    {
                        label: "E-mail",
                        value: usuarioToDelete?.email,
                    },
                    {
                        label: "Perfil",
                        value: usuarioToDelete?.perfil,
                    },
                ]}
                confirmText="Excluir Usuário"
            />
        </div>
    );
}

export default UsuariosPage;