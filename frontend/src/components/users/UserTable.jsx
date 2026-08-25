import {
    KeyRound,
    Pencil,
    Trash2,
} from "lucide-react";

import StatusBadge from "../common/StatusBadge.jsx"
import TableSkeleton from "../common/TableSkeleton.jsx"

const perfilMap = {
    ADMIN: {
        label: "Administrador",
        className: "bg-red-50 text-red-600",
    },
    GESTOR: {
        label: "Gestor",
        className: "bg-purple-50 text-purple-600",
    },
    SUPERVISOR: {
        label: "Supervisor",
        className: "bg-green-50 text-green-600",
    },
    OPERADOR: {
        label: "Operador",
        className: "bg-blue-50 text-blue-600",
    },
}

const usuarioStatusMap = {
    ATIVO: {
        label: "Ativo",
        className: "bg-green-50 text-green-600",
    },
    INATIVO: {
        label: "Inativo",
        className: "bg-slate-100 text-slate-500",
    },
};

function getInitials(nome = "") {
    if (!nome.trim()) return "?";

    return nome
        .trim()
        .split(/\s+/)
        .map((parte) => parte[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function formatarData(data) {
    if (!data) return "-";

    const dataFormatada = new Date(data);

    if (Number.isNaN(dataFormatada.getTime())) {
        return "-";
    }

    return dataFormatada.toLocaleDateString("pt-BR");
}

function formatarDataHora(data) {
    if (!data) return "-";

    const dataFormatada = new Date(data);

    if (Number.isNaN(dataFormatada.getTime())) {
        return "-";
    }

    return dataFormatada.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

function UserTable({
                       usuarios = [],
                       loading = false,
                       onEdit,
                       onToggleStatus,
                       onDelete
                   }) {
    if (loading) {
        return (
            <TableSkeleton
                rows={5}
                columns={8}
                minWidth="1250px"
            />
        );
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1250px]">
                    <thead className="border-b border-slate-200 bg-slate-50">
                    <tr className="text-left">
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                            Usuário
                        </th>

                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                            Contato
                        </th>

                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                            Perfil
                        </th>

                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                            Turnos
                        </th>

                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                            Status
                        </th>

                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                            Última atualização
                        </th>

                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                            Cadastro
                        </th>

                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                            Ações
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {usuarios.length === 0 ? (
                        <tr>
                            <td
                                colSpan={8}
                                className="px-6 py-10 text-center text-slate-500"
                            >
                                Nenhum usuário encontrado.
                            </td>
                        </tr>
                    ) : (
                        usuarios.map((usuario) => (
                            <tr
                                key={usuario.id}
                                className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                            >
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                                            {getInitials(usuario.nome)}
                                        </div>

                                        <p className="text-sm font-medium text-slate-800">
                                            {usuario.nome || "-"}
                                        </p>
                                    </div>
                                </td>

                                <td className="px-6 py-5 text-[13.5px] text-slate-600">
                                    <p>{usuario.email || "-"}</p>

                                    <p className="text-xs text-slate-500">
                                        {usuario.telefone || "-"}
                                    </p>
                                </td>

                                <td className="px-6 py-5">
                                    <StatusBadge
                                        status={usuario.perfil}
                                        statusMap={perfilMap}
                                    />
                                </td>

                                <td className="px-6 py-5">
                                    {usuario.perfil === "OPERADOR" ? (
                                        usuario.turnos?.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {usuario.turnos.map((turno) => (
                                                    <span
                                                        key={turno.id}
                                                        className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700"
                                                    >
                                                            {turno.nome}
                                                        </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-amber-600">
                                                    Sem turno
                                                </span>
                                        )
                                    ) : (
                                        <span className="text-xs text-slate-400">
                                                Não se aplica
                                            </span>
                                    )}
                                </td>

                                <td className="px-6 py-5">
                                    <StatusBadge
                                        status={usuario.status}
                                        statusMap={usuarioStatusMap}
                                    />
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
                                            type="button"
                                            onClick={() => onEdit(usuario)}
                                            className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-100"
                                            title="Editar usuário"
                                            aria-label={`Editar ${usuario.nome}`}
                                        >
                                            <Pencil size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onToggleStatus(usuario)}
                                            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                                            title={
                                                usuario.status === "ATIVO"
                                                    ? "Inativar usuário"
                                                    : "Ativar usuário"
                                            }
                                            aria-label={
                                                usuario.status === "ATIVO"
                                                    ? `Inativar ${usuario.nome}`
                                                    : `Ativar ${usuario.nome}`
                                            }
                                        >
                                            <KeyRound size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onDelete(usuario)}
                                            className="rounded-xl border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                                            title="Excluir usuário"
                                            aria-label={`Excluir ${usuario.nome}`}
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
    );
}

export default UserTable;