import {
    CircleAlert,
    Eye,
    Factory,
    Pencil,
    Trash2,
} from "lucide-react";

import StatusBadge from "../common/StatusBadge.jsx";

import {
    eventoStatusMap,
    eventoTipoMap,
} from "../../config/statusMaps.js";

import {
    DataTable,
    TableActionButton,
    TableActions,
    TablePrimaryText,
    TableSecondaryText,
} from "../common/table/index.js";

function EventoTable({
                         eventos = [],
                         loading = false,
                         onView,
                         onEdit,
                         onDelete,
                         canEdit = false,
                         canDelete = false,
                     }) {
    const columns = [
        {
            key: "titulo",
            header: "Título",
            width: "18rem",
            render: (evento) => (
                <div className="min-w-0">
                    <TablePrimaryText
                        title={
                            evento.titulo ||
                            "Sem título"
                        }
                    >
                        {evento.titulo ||
                            "Sem título"}
                    </TablePrimaryText>

                    <TableSecondaryText>
                        Registro #{evento.id}
                    </TableSecondaryText>
                </div>
            ),
        },
        {
            key: "tipo",
            header: "Tipo",
            width: "12rem",
            render: (evento) => (
                <StatusBadge
                    status={evento.tipo}
                    statusMap={
                        eventoTipoMap
                    }
                />
            ),
        },
        {
            key: "equipamento",
            header: "Equipamento",
            width: "16rem",
            render: (evento) => (
                <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <Factory size={14} />
                    </div>

                    <div className="min-w-0">
                        <TablePrimaryText
                            title={
                                evento
                                    .equipamentoNome ||
                                "Sem equipamento"
                            }
                        >
                            {evento
                                    .equipamentoNome ||
                                "Sem equipamento"}
                        </TablePrimaryText>

                        <TableSecondaryText>
                            {evento
                                    .equipamentoCodigo ||
                                "Sem código"}
                        </TableSecondaryText>
                    </div>
                </div>
            ),
        },
        {
            key: "status",
            header: "Status",
            width: "10rem",
            render: (evento) => (
                <StatusBadge
                    status={evento.status}
                    statusMap={
                        eventoStatusMap
                    }
                    showDot
                />
            ),
        },
        {
            key: "actions",
            header: "Ações",
            type: "actions",
            align: "right",
            width: "7rem",
            render: (evento) => (
                <TableActions>
                    <TableActionButton
                        variant="primary"
                        title={`Visualizar ocorrência ${evento.titulo}`}
                        onClick={() =>
                            onView?.(evento)
                        }
                    >
                        <Eye size={14} />
                    </TableActionButton>

                    {canEdit && (
                        <TableActionButton
                            title={`Editar ocorrência ${evento.titulo}`}
                            onClick={() =>
                                onEdit?.(evento)
                            }
                        >
                            <Pencil size={14} />
                        </TableActionButton>
                    )}

                    {canDelete && (
                        <TableActionButton
                            variant="danger"
                            title={`Excluir ocorrência ${evento.titulo}`}
                            onClick={() =>
                                onDelete?.(
                                    evento
                                )
                            }
                        >
                            <Trash2 size={14} />
                        </TableActionButton>
                    )}
                </TableActions>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={eventos}
            loading={loading}
            skeletonRows={5}
            minWidth="53rem"
            emptyTitle="Nenhuma ocorrência encontrada"
            emptyDescription="Altere os filtros ou registre uma nova ocorrência."
            emptyIcon={CircleAlert}
        />
    );
}

export default EventoTable;