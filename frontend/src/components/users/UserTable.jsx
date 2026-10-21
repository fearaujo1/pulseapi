import {
    KeyRound,
    Pencil,
    Power,
    Trash2,
    Users,
} from "lucide-react";

import StatusBadge from "../common/StatusBadge.jsx";

import {
    perfilMap,
    usuarioStatusMap,
} from "../../config/statusMaps.js";

import {
    DataTable,
    TableActionButton,
    TableActions,
    TablePrimaryText,
    TableSecondaryText,
    TableText,
} from "../common/table/index.js";

function UserTable({
                       usuarios = [],
                       loading = false,
                       onEdit,
                       onResetPassword,
                       onToggleStatus,
                       onDelete,
                       actionLoading = false,
                       canEdit = false,
                       canResetPassword = false,
                       canToggleStatus = false,
                       canDelete = false,
                   }) {
    const possuiAcoes =
        canEdit ||
        canResetPassword ||
        canToggleStatus ||
        canDelete;

    const columns = [
        {
            key: "usuario",
            header: "Usuário",
            width: "17rem",
            render: (usuario) => (
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[11px] font-bold text-blue-700">
                        {getInitials(usuario.nome)}
                    </div>

                    <div className="min-w-0">
                        <TablePrimaryText title={usuario.nome}>
                            {usuario.nome || "—"}
                        </TablePrimaryText>

                        <TableSecondaryText>
                            ID #{usuario.id}
                        </TableSecondaryText>
                    </div>
                </div>
            ),
        },
        {
            key: "contato",
            header: "Contato",
            width: "17rem",
            render: (usuario) => (
                <div className="min-w-0">
                    <TablePrimaryText title={usuario.email}>
                        {usuario.email || "—"}
                    </TablePrimaryText>

                    <TableSecondaryText>
                        {usuario.telefone || "Sem telefone"}
                    </TableSecondaryText>
                </div>
            ),
        },
        {
            key: "perfil",
            header: "Perfil",
            render: (usuario) => (
                <StatusBadge
                    status={usuario.perfil}
                    statusMap={perfilMap}
                />
            ),
        },
        {
            key: "turnos",
            header: "Turnos",
            width: "13rem",
            render: (usuario) => (
                <Turnos turnos={usuario.turnos} />
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (usuario) => (
                <StatusBadge
                    status={usuario.ativo ? "ATIVO" : "INATIVO"}
                    statusMap={usuarioStatusMap}
                    showDot
                />
            ),
        },
        {
            key: "atualizadoEm",
            header: "Atualização",
            width: "10rem",
            render: (usuario) => (
                <TableText className="whitespace-nowrap">
                    {formatarDataHora(
                        usuario.atualizadoEm ??
                        usuario.criadoEm
                    )}
                </TableText>
            ),
        },
    ];

    if (possuiAcoes) {
        columns.push({
            key: "acoes",
            header: "Ações",
            align: "right",
            width: "10rem",
            render: (usuario) => (
                <TableActions>
                    {canEdit && (
                        <TableActionButton
                            title="Editar usuário"
                            aria-label={`Editar ${usuario.nome}`}
                            disabled={actionLoading}
                            onClick={() => onEdit?.(usuario)}
                        >
                            <Pencil size={14} />
                        </TableActionButton>
                    )}

                    {canResetPassword && (
                        <TableActionButton
                            title="Redefinir senha"
                            aria-label={`Redefinir senha de ${usuario.nome}`}
                            variant="primary"
                            disabled={actionLoading}
                            onClick={() =>
                                onResetPassword?.(usuario)
                            }
                        >
                            <KeyRound size={14} />
                        </TableActionButton>
                    )}

                    {canToggleStatus && (
                        <TableActionButton
                            title={
                                usuario.ativo
                                    ? "Inativar usuário"
                                    : "Ativar usuário"
                            }
                            aria-label={
                                usuario.ativo
                                    ? `Inativar ${usuario.nome}`
                                    : `Ativar ${usuario.nome}`
                            }
                            variant="warning"
                            disabled={actionLoading}
                            onClick={() =>
                                onToggleStatus?.(usuario)
                            }
                        >
                            <Power size={14} />
                        </TableActionButton>
                    )}

                    {canDelete && (
                        <TableActionButton
                            title="Excluir usuário"
                            aria-label={`Excluir ${usuario.nome}`}
                            variant="danger"
                            disabled={actionLoading}
                            onClick={() => onDelete?.(usuario)}
                        >
                            <Trash2 size={14} />
                        </TableActionButton>
                    )}
                </TableActions>
            ),
        });
    }

    return (
        <DataTable
            columns={columns}
            data={usuarios}
            loading={loading}
            skeletonRows={5}
            minWidth="68rem"
            rowKey={(usuario) => usuario.id}
            emptyIcon={Users}
            emptyTitle="Nenhum usuário encontrado"
            emptyDescription="Ajuste os filtros ou cadastre um novo usuário."
        />
    );
}

function Turnos({ turnos = [] }) {
    if (!Array.isArray(turnos) || turnos.length === 0) {
        return (
            <TableSecondaryText>
                Nenhum turno
            </TableSecondaryText>
        );
    }

    const turnosVisiveis = turnos.slice(0, 2);
    const quantidadeRestante =
        turnos.length - turnosVisiveis.length;

    return (
        <div className="flex max-w-52 flex-wrap gap-1">
            {turnosVisiveis.map((turno) => (
                <span
                    key={turno.id ?? turno.nome}
                    className="inline-flex max-w-32 truncate rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                    title={turno.nome}
                >
                    {turno.nome || "Turno"}
                </span>
            ))}

            {quantidadeRestante > 0 && (
                <span
                    className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700"
                    title={turnos
                        .slice(2)
                        .map((turno) => turno.nome)
                        .join(", ")}
                >
                    +{quantidadeRestante}
                </span>
            )}
        </div>
    );
}

function getInitials(nome) {
    if (!nome) {
        return "?";
    }

    return nome
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((parte) => parte.charAt(0).toUpperCase())
        .join("");
}

function formatarDataHora(valor) {
    if (!valor) {
        return "—";
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(data);
}

export default UserTable;