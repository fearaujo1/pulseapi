import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Cable,
    Cpu,
    Pencil,
    Trash2,
} from "lucide-react";

import StatusBadge from "../common/StatusBadge.jsx";

import {
    conexaoStatusMap,
    equipamentoStatusMap,
} from "../../config/statusMaps.js";

import {
    DataTable,
    TableActionButton,
    TableActions,
    TablePrimaryText,
    TableSecondaryText,
    TableText,
} from "../common/table/index.js";

function EquipmentTable({
                            equipamentos = [],
                            loading = false,
                            onEdit,
                            onDelete,
                            onIntegracao,
                            onSort,
                            sortField,
                            sortDirection,
                            canEdit = false,
                            canDelete = false,
                            canIntegrate = false,
                        }) {
    const possuiAcoes =
        canIntegrate ||
        canEdit ||
        canDelete;

    const columns = [
        {
            key: "equipamento",
            header: (
                <SortableHeader
                    label="Equipamento"
                    field="nome"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={onSort}
                />
            ),
            width: "18rem",
            render: (equipamento) => (
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Cpu size={15} />
                    </div>

                    <div className="min-w-0">
                        <TablePrimaryText
                            title={
                                equipamento.nome ||
                                "Sem nome"
                            }
                        >
                            {equipamento.nome ||
                                "Sem nome"}
                        </TablePrimaryText>

                        <TableSecondaryText>
                            {equipamento.codigo ||
                                "Sem código"}
                        </TableSecondaryText>
                    </div>
                </div>
            ),
        },
        {
            key: "tipo",
            header: "Tipo",
            width: "9rem",
            render: (equipamento) => (
                <TableText
                    title={equipamento.tipo}
                >
                    {equipamento.tipo || "-"}
                </TableText>
            ),
        },
        {
            key: "localizacao",
            header: "Localização",
            width: "14rem",
            render: (equipamento) => (
                <div className="min-w-0">
                    <TablePrimaryText
                        title={
                            equipamento.linhaNome ||
                            "Sem linha"
                        }
                    >
                        {equipamento.linhaNome ||
                            "Sem linha"}
                    </TablePrimaryText>

                    <TableSecondaryText
                        title={
                            equipamento.plantaNome ||
                            "Sem planta"
                        }
                    >
                        {equipamento.plantaNome ||
                            "Sem planta"}
                    </TableSecondaryText>
                </div>
            ),
        },
        {
            key: "rede",
            header: "Rede",
            width: "11rem",
            render: (equipamento) => (
                <div className="min-w-0">
                    <TablePrimaryText>
                        {equipamento.ip ||
                            "Sem IP"}
                    </TablePrimaryText>

                    <TableSecondaryText>
                        {equipamento.porta
                            ? `Porta ${equipamento.porta}`
                            : "Sem porta"}
                    </TableSecondaryText>
                </div>
            ),
        },
        {
            key: "status",
            header: "Status",
            width: "9rem",
            render: (equipamento) => (
                <StatusBadge
                    status={equipamento.status}
                    statusMap={
                        equipamentoStatusMap
                    }
                />
            ),
        },
        {
            key: "conexao",
            header: "Conexão",
            width: "10rem",
            render: (equipamento) => (
                <StatusBadge
                    status={
                        equipamento.statusConexao ||
                        "SEM_CONEXAO"
                    }
                    statusMap={
                        conexaoStatusMap
                    }
                    showDot
                />
            ),
        },
    ];

    if (possuiAcoes) {
        columns.push({
            key: "actions",
            header: "Ações",
            type: "actions",
            align: "right",
            width: "8rem",
            render: (equipamento) => (
                <TableActions>
                    {canIntegrate && (
                        <TableActionButton
                            variant="primary"
                            title={`Abrir integração do equipamento ${equipamento.nome}`}
                            onClick={() =>
                                onIntegracao?.(
                                    equipamento
                                )
                            }
                        >
                            <Cable size={14} />
                        </TableActionButton>
                    )}

                    {canEdit && (
                        <TableActionButton
                            title={`Editar equipamento ${equipamento.nome}`}
                            onClick={() =>
                                onEdit?.(
                                    equipamento
                                )
                            }
                        >
                            <Pencil size={14} />
                        </TableActionButton>
                    )}

                    {canDelete && (
                        <TableActionButton
                            variant="danger"
                            title={`Excluir equipamento ${equipamento.nome}`}
                            onClick={() =>
                                onDelete?.(
                                    equipamento
                                )
                            }
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
            data={equipamentos}
            loading={loading}
            skeletonRows={5}
            minWidth="70rem"
            emptyTitle="Nenhum equipamento encontrado"
            emptyDescription="Altere os filtros ou cadastre um novo equipamento."
            emptyIcon={Cpu}
        />
    );
}

function SortableHeader({
                            label,
                            field,
                            sortField,
                            sortDirection,
                            onSort,
                        }) {
    const active =
        sortField === field;

    let Icon =
        ArrowUpDown;

    if (active) {
        Icon =
            sortDirection === "asc"
                ? ArrowUp
                : ArrowDown;
    }

    return (
        <button
            type="button"
            onClick={() =>
                onSort?.(field)
            }
            className={`
                inline-flex items-center gap-1.5
                transition
                ${
                active
                    ? "text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
            }
            `}
            title={`Ordenar por ${label}`}
        >
            {label}

            <Icon size={13} />
        </button>
    );
}

export default EquipmentTable;