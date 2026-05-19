import { useEffect ,useMemo, useState } from "react";
import {
    Users,
    UserCheck,
    UserX,
    Shield,
    Plus,
    Search,
    Mail,
    Phone,
    Clock,
    Calendar,
    Pencil,
    KeyRound,
    Trash2,
    Filter,
} from "lucide-react";
import UserFormModal from "../components/users/UserFormModal";

import Topbar from "../components/layout/Topbar";
import SummaryCard from "../components/equipment/SummaryCard";
import CustomFilterSelect from "../components/equipment/CustomFilterSelect";
import { usuarioService } from "../services/usuarioService";
import toast from "react-hot-toast";
import UserDeleteModal from "../components/users/UserDeleteModal";

const perfilOptions = [
    { value: "", label: "Todos os perfis" },
    { value: "1", label: "Administrador" },
    { value: "2", label: "Gestor" },
    { value: "3", label: "Supervisor" },
    { value: "4", label: "Operador" },
];

const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "ATIVO", label: "Ativo" },
    { value: "INATIVO", label: "Inativo" },
];

function getInitials(nome) {
    return nome
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function perfilLabel(perfil) {
    const labels = {
        ADMIN: "Administrador",
        GESTOR: "Gestor",
        SUPERVISOR: "Supervisor",
        OPERADOR: "Operador",
    };

    return labels[perfil] || perfil;
}

function perfilClass(perfil) {
    const classes = {
        ADMIN: "bg-red-50 text-red-600",
        GESTOR: "bg-purple-50 text-purple-600",
        SUPERVISOR: "bg-green-50 text-green-600",
        OPERADOR: "bg-blue-50 text-blue-600",
    };

    return classes[perfil] || "bg-slate-100 text-slate-600";
}

function perfilIdToPerfil(perfilId) {
    const map = {
        1: "ADMIN",
        2: "GESTOR",
        3: "SUPERVISOR",
        4: "OPERADOR",
    };

    return map[Number(perfilId)] || "OPERADOR";
}

function perfilToPerfilId(perfil) {
    const map = {
        ADMIN: 1,
        GESTOR: 2,
        SUPERVISOR: 3,
        OPERADOR: 4,
    };

    return map[perfil] || 4;
}

function statusClass(status) {
    return status === "ATIVO"
        ? "bg-green-50 text-green-600"
        : "bg-slate-100 text-slate-500";
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

    const total = usuarios.length;
    const ativos = usuarios.filter((u) => u.status === "ATIVO").length;
    const inativos = usuarios.filter((u) => u.status === "INATIVO").length;
    const perfis = new Set(usuarios.map((u) => u.perfil)).size;

    function formatarData(data) {
        if (!data) return "-";

        return new Date(data).toLocaleDateString("pt-BR");
    }

    function formatarDataHora(data) {
        if (!data) return "-";

        return new Date(data).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
        });
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="p-4 md:p-6">
                <section className="mb-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-950">
                            Usuários e Permissões
                        </h1>
                        <p className="mt-1 text-[16px] text-slate-600">
                            Gerencie usuários, perfis e controle de acesso
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button className="h-12 px-6 rounded-2xl border border-blue-200 bg-white text-blue-600 font-semibold flex items-center gap-3">
                            <Shield size={20} />
                            Novo Perfil
                        </button>

                        <button
                            onClick={() => {
                                setSelectedUsuario(null);
                                setIsUserModalOpen(true);
                            }}
                            className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-3 shadow-sm"
                        >
                            <Plus size={20} />
                            Novo Usuário
                        </button>
                    </div>
                </section>

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
                        subtitle={`${Math.round((ativos / total) * 100)}% do total`}
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
                    <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 md:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                            <h2 className="text-[24px] md:text-xl font-bold text-slate-950">
                                Lista de Usuários
                            </h2>
                        </div>

                        <div className="mb-6">
                            <div className="flex flex-col xl:flex-row gap-4">
                                <div className="flex items-center gap-3 flex-1 h-12 rounded-2xl bg-slate-50 border border-slate-200 px-4 transition-all duration-200 focus-within:border-blue-500 focus-within:bg-white">
                                    <Search size={18} className="text-slate-400" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Buscar por nome ou e-mail..."
                                        className="w-full bg-transparent outline-none text-[13.5px] placeholder:text-slate-400"
                                    />
                                </div>

                                <div className="flex gap-4 flex-wrap">
                                    <CustomFilterSelect
                                        value={perfilFilter}
                                        onChange={setPerfilFilter}
                                        options={perfilOptions}
                                        placeholder="Todos os perfis"
                                    />

                                    <CustomFilterSelect
                                        value={statusFilter}
                                        onChange={setStatusFilter}
                                        options={statusOptions}
                                        placeholder="Todos os status"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1100px]">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr className="text-left">
                                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Usuário</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Contato</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Perfil</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Última Atualização</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Cadastro</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">Ações</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                                                Carregando usuários...
                                            </td>
                                        </tr>
                                    ) : usuariosFiltrados.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                                                Nenhum usuário encontrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        usuariosFiltrados.map((usuario) => (
                                            <tr
                                                key={usuario.id}
                                                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center text-xs">
                                                            {getInitials(usuario.nome)}
                                                        </div>

                                                        <div className="leading-tight">
                                                            <p className="font-medium text-slate-800 text-sm">
                                                                {usuario.nome}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-[13.5px] text-slate-600">
                                                    <p>{usuario.email}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {usuario.telefone || "-"}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${perfilClass(usuario.perfil)}`}>
                                                        {perfilLabel(usuario.perfil)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusClass(usuario.status)}`}>
                                                        {usuario.status === "ATIVO" ? "Ativo" : "Inativo"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-slate-600">
                                                    {formatarDataHora(usuario.ultimaAtualizacao)}
                                                </td>
                                                <td className="px-6 py-5 text-sm text-slate-600">
                                                    {formatarData(usuario.dataCadastro)}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEditUsuario(usuario)}
                                                            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>

                                                        <button
                                                            onClick={() => handleToggleStatusUsuario(usuario)}
                                                            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                                                            title={usuario.status === "ATIVO" ? "Inativar usuário" : "Ativar usuário"}
                                                        >
                                                            <KeyRound size={16} />
                                                        </button>

                                                        <button
                                                            onClick={() => handleDeleteUsuario(usuario)}
                                                            className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === "perfis" && (
                    <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-8">
                        <h2 className="text-[24px] font-bold text-slate-950">
                            Perfis e Permissões
                        </h2>
                        <p className="mt-2 text-slate-500">
                            Próxima etapa: montar cards de perfis e matriz de permissões.
                        </p>
                    </section>
                )}
            </main>
            <UserFormModal
                isOpen={isUserModalOpen}
                onClose={() => {
                    setIsUserModalOpen(false);
                    setSelectedUsuario(null);
                }}
                onSubmit={selectedUsuario ? handleUpdateUsuario : handleCreateUsuario}
                loading={submitLoading}
                mode={selectedUsuario ? "edit" : "create"}
                initialData={selectedUsuario}
            />
            <UserDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setUsuarioToDelete(null);
                }}
                onConfirm={handleConfirmDeleteUsuario}
                loading={deleteLoading}
                usuario={usuarioToDelete}
            />
        </div>
    );
}

export default UsuariosPage;