import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Shield, UserCheck, Users, UserX } from "lucide-react";
import toast from "react-hot-toast";
import Topbar from "../components/layout/Topbar";
import PageHeader from "../components/common/PageHeader";
import ContentCard from "../components/common/ContentCard";
import ConfirmDeleteModal from "../components/common/ConfirmDeleteModal.jsx";
import Pagination from "../components/common/Pagination.jsx";
import UserFormModal from "../components/users/UserFormModal";
import UserFilters from "../components/users/UserFilters";
import UserTable from "../components/users/UserTable";
import RedefinirSenhaUsuarioModal from "../components/users/RedefinirSenhaUsuarioModal.jsx";
import usePagination from "../hooks/usePagination.js";

import { usuarioService } from "../services/usuarioService";
import { configuracaoService } from "../services/configuracaoService.js";

const PERFIL_ID = {
    ADMIN: 1,
    GESTOR: 2,
    SUPERVISOR: 3,
    OPERADOR: 4,
};

function UsuariosPage() {
    const [search, setSearch] = useState("");
    const [perfilFilter, setPerfilFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [usuarios, setUsuarios] = useState([]);
    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [usuarioToDelete, setUsuarioToDelete] = useState(null);
    const [usuarioParaRedefinirSenha, setUsuarioParaRedefinirSenha] =
        useState(null);
    const [redefinindoSenha, setRedefinindoSenha] = useState(false);

    const carregarUsuarios = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) {
                setLoading(true);
            }

            const data = await usuarioService.listar();

            if (!Array.isArray(data)) {
                throw new Error("Resposta inválida da API de usuários.");
            }

            setUsuarios(data);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            setUsuarios([]);
            toast.error(
                error.response?.data?.detail || "Erro ao carregar usuários."
            );
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }, []);

    const carregarTurnos = useCallback(async () => {
        try {
            const data = await configuracaoService.listarTurnos();
            setTurnos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao carregar turnos:", error);
            setTurnos([]);
            toast.error("Erro ao carregar turnos.");
        }
    }, []);

    useEffect(() => {
        carregarUsuarios(true);
        carregarTurnos();
    }, [carregarUsuarios, carregarTurnos]);

    const usuariosFiltrados = useMemo(() => {
        const termo = search.trim().toLowerCase();

        return usuarios.filter((usuario) => {
            const correspondeBusca =
                !termo ||
                usuario.nome?.toLowerCase().includes(termo) ||
                usuario.email?.toLowerCase().includes(termo);
            const correspondePerfil =
                !perfilFilter ||
                PERFIL_ID[usuario.perfil] === Number(perfilFilter);
            const correspondeStatus =
                !statusFilter || usuario.status === statusFilter;

            return correspondeBusca && correspondePerfil && correspondeStatus;
        });
    }, [usuarios, search, perfilFilter, statusFilter]);

    const {
        currentPage,
        totalPages,
        paginatedItems: usuariosPaginados,
        setCurrentPage,
        resetPage,
    } = usePagination(usuariosFiltrados, 8);

    function handleSearchChange(value) {
        setSearch(value);
        resetPage();
    }

    function handlePerfilChange(value) {
        setPerfilFilter(value);
        resetPage();
    }

    function handleStatusChange(value) {
        setStatusFilter(value);
        resetPage();
    }

    const total = usuarios.length;
    const ativos = usuarios.filter((usuario) => usuario.status === "ATIVO").length;
    const inativos = usuarios.filter(
        (usuario) => usuario.status === "INATIVO"
    ).length;
    const perfis = new Set(usuarios.map((usuario) => usuario.perfil)).size;

    function abrirNovoUsuario() {
        setSelectedUsuario(null);
        setIsUserModalOpen(true);
    }

    function fecharFormulario() {
        if (submitLoading) {
            return;
        }

        setIsUserModalOpen(false);
        setSelectedUsuario(null);
    }

    async function handleCreateUsuario(formData) {
        try {
            setSubmitLoading(true);
            await usuarioService.criar(montarPayload(formData, true));
            setIsUserModalOpen(false);
            setSelectedUsuario(null);
            await carregarUsuarios(false);
            toast.success("Usuário criado com sucesso!");
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
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
            await usuarioService.atualizar(
                selectedUsuario.id,
                montarPayload(formData, false)
            );
            setIsUserModalOpen(false);
            setSelectedUsuario(null);
            await carregarUsuarios(false);
            toast.success("Usuário atualizado com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar usuário:", error);
            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Erro ao atualizar usuário."
            );
        } finally {
            setSubmitLoading(false);
        }
    }

    async function handleToggleStatusUsuario(usuario) {
        const novoStatus = usuario.status === "ATIVO" ? "INATIVO" : "ATIVO";

        try {
            await usuarioService.atualizarStatus(usuario.id, novoStatus);
            setUsuarios((anteriores) =>
                anteriores.map((item) =>
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
            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Erro ao atualizar o status do usuário."
            );
        }
    }

    async function handleConfirmDeleteUsuario() {
        if (!usuarioToDelete?.id) {
            return;
        }

        try {
            setDeleteLoading(true);
            await usuarioService.deletar(usuarioToDelete.id);
            setUsuarios((anteriores) =>
                anteriores.filter((usuario) => usuario.id !== usuarioToDelete.id)
            );
            setIsDeleteModalOpen(false);
            setUsuarioToDelete(null);
            toast.success("Usuário excluído com sucesso!");
        } catch (error) {
            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Erro ao excluir usuário."
            );
        } finally {
            setDeleteLoading(false);
        }
    }

    async function handleConfirmResetPassword(payload) {
        if (!usuarioParaRedefinirSenha?.id) {
            return;
        }

        try {
            setRedefinindoSenha(true);
            await usuarioService.redefinirSenha(
                usuarioParaRedefinirSenha.id,
                payload
            );
            setUsuarioParaRedefinirSenha(null);
            toast.success("Senha redefinida com sucesso.");
        } catch (error) {
            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Não foi possível redefinir a senha."
            );
        } finally {
            setRedefinindoSenha(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="mx-auto w-full max-w-[1800px] px-4 py-5 md:px-6 lg:px-8">
                <PageHeader
                    title="Usuários e permissões"
                    description="Gerencie contas, perfis de acesso e turnos operacionais"
                >
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={abrirNovoUsuario}
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
                        >
                            <Plus size={15} />
                            Novo usuário
                        </button>
                    </div>
                </PageHeader>

                <UserIndicators
                    total={total}
                    ativos={ativos}
                    inativos={inativos}
                    perfis={perfis}
                />

                <ContentCard
                    title="Usuários cadastrados"
                    subtitle={`${usuariosFiltrados.length} registro(s) encontrado(s)`}
                >
                    <div className="mb-5">
                        <UserFilters
                            search={search}
                            onSearchChange={handleSearchChange}
                            perfilFilter={perfilFilter}
                            onPerfilChange={handlePerfilChange}
                            statusFilter={statusFilter}
                            onStatusChange={handleStatusChange}
                        />
                    </div>

                    <UserTable
                        usuarios={usuariosPaginados}
                        loading={loading}
                        onEdit={(usuario) => {
                            setSelectedUsuario(usuario);
                            setIsUserModalOpen(true);
                        }}
                        onResetPassword={setUsuarioParaRedefinirSenha}
                        onToggleStatus={handleToggleStatusUsuario}
                        onDelete={(usuario) => {
                            setUsuarioToDelete(usuario);
                            setIsDeleteModalOpen(true);
                        }}
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

            {isUserModalOpen && (
                <UserFormModal
                    key={selectedUsuario?.id ?? "novo-usuario"}
                    isOpen={isUserModalOpen}
                    onClose={fecharFormulario}
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
                    if (!deleteLoading) {
                        setIsDeleteModalOpen(false);
                        setUsuarioToDelete(null);
                    }
                }}
                onConfirm={handleConfirmDeleteUsuario}
                loading={deleteLoading}
                title="Excluir usuário"
                description="Confirme a exclusão deste usuário do sistema."
                warningMessage="O usuário será removido permanentemente do sistema."
                itemLabel="Usuário selecionado"
                itemName={usuarioToDelete?.nome}
                details={[
                    { label: "E-mail", value: usuarioToDelete?.email },
                    { label: "Perfil", value: usuarioToDelete?.perfil },
                ]}
                confirmText="Excluir usuário"
            />

            <RedefinirSenhaUsuarioModal
                isOpen={Boolean(usuarioParaRedefinirSenha)}
                usuario={usuarioParaRedefinirSenha}
                loading={redefinindoSenha}
                onClose={() => {
                    if (!redefinindoSenha) {
                        setUsuarioParaRedefinirSenha(null);
                    }
                }}
                onSubmit={handleConfirmResetPassword}
            />
        </div>
    );
}

function UserIndicators({ total, ativos, inativos, perfis }) {
    const indicadores = [
        { label: "Usuários", value: total, detail: "cadastrados", icon: Users, color: "bg-blue-50 text-blue-600" },
        { label: "Ativos", value: ativos, detail: "com acesso", icon: UserCheck, color: "bg-emerald-50 text-emerald-600" },
        { label: "Inativos", value: inativos, detail: "sem acesso", icon: UserX, color: "bg-slate-100 text-slate-600" },
        { label: "Perfis", value: perfis, detail: "em uso", icon: Shield, color: "bg-violet-50 text-violet-600" },
    ];

    return (
        <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {indicadores.map(({ label, value, detail, icon: Icon, color }) => (
                <article key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                        <Icon size={17} />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                        <div className="mt-0.5 flex items-baseline gap-1.5">
                            <strong className="text-lg text-slate-900">{value}</strong>
                            <span className="text-[11px] text-slate-500">{detail}</span>
                        </div>
                    </div>
                </article>
            ))}
        </section>
    );
}

function montarPayload(formData, incluirSenha) {
    const perfilId = Number(formData.perfilId || 4);
    const payload = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone?.trim() || null,
        perfilId,
        turnoIds: perfilId === 4 ? formData.turnoIds || [] : [],
    };

    if (incluirSenha) {
        payload.senha = formData.senha;
    }

    return payload;
}

export default UsuariosPage;
