import {
    ChevronRight,
    Factory,
    Pencil,
    Trash2,
} from "lucide-react";

import StatusBadge from "../common/StatusBadge.jsx";

import {
    estruturaStatusMap,
} from "../../config/statusMaps.js";

import {
    DataTable,
    TableActionButton,
    TableActions,
    TablePrimaryText,
    TableSecondaryText,
} from "../common/table/index.js";

function PlantaTable({
                         plantas = [],
                         plantaSelecionada,
                         onSelect,
                         onEdit,
                         onDelete,
                         canEdit = false,
                         canDelete = false,
                         canManage = false,
                         loading = false,
                     }) {
    const permiteEditar =
        canEdit || canManage;

    const permiteExcluir =
        canDelete || canManage;

    const possuiAcoes =
        permiteEditar || permiteExcluir;

    const columns = [
        {
            key: "planta",
            header: "Planta",
            width: "16rem",
            render: (planta) => {
                const selecionada =
                    plantaSelecionada?.id ===
                    planta.id;

                return (
                    <div className="flex min-w-0 items-center gap-2.5">
                        <span
                            className={`
                                flex h-7 w-7 shrink-0 items-center
                                justify-center rounded-lg transition
                                ${
                                selecionada
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-400"
                            }
                            `}
                        >
                            <ChevronRight size={14} />
                        </span>

                        <div className="min-w-0">
                            <TablePrimaryText
                                title={planta.nome}
                            >
                                {planta.nome || "—"}
                            </TablePrimaryText>

                            <TableSecondaryText>
                                {planta.codigo ||
                                    "Sem código"}
                            </TableSecondaryText>
                        </div>
                    </div>
                );
            },
        },
        {
            key: "localizacao",
            header: "Localização",
            width: "14rem",
            render: (planta) => (
                <div className="min-w-0">
                    <TablePrimaryText
                        title={planta.cidade}
                    >
                        {planta.cidade ||
                            "Cidade não informada"}
                    </TablePrimaryText>

                    <TableSecondaryText>
                        {planta.estado ||
                            "Estado não informado"}
                    </TableSecondaryText>
                </div>
            ),
        },
        {
            key: "status",
            header: "Status",
            width: "8rem",
            render: (planta) => (
                <StatusBadge
                    status={planta.status}
                    statusMap={estruturaStatusMap}
                    showDot
                />
            ),
        },
    ];

    if (possuiAcoes) {
        columns.push({
            key: "acoes",
            header: "Ações",
            align: "right",
            width: "7rem",
            render: (planta) => (
                <TableActions>
                    {permiteEditar && (
                        <TableActionButton
                            title="Editar planta"
                            aria-label={`Editar ${
                                planta.nome || "planta"
                            }`}
                            onClick={(event) => {
                                event.stopPropagation();
                                onEdit?.(planta);
                            }}
                        >
                            <Pencil size={14} />
                        </TableActionButton>
                    )}

                    {permiteExcluir && (
                        <TableActionButton
                            title="Excluir planta"
                            aria-label={`Excluir ${
                                planta.nome || "planta"
                            }`}
                            variant="danger"
                            onClick={(event) => {
                                event.stopPropagation();
                                onDelete?.(planta);
                            }}
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
            data={plantas}
            loading={loading}
            skeletonRows={4}
            minWidth="38rem"
            rowKey={(planta) => planta.id}
            onRowClick={onSelect}
            rowClassName={(planta) =>
                plantaSelecionada?.id === planta.id
                    ? "bg-blue-50/80 hover:bg-blue-50"
                    : ""
            }
            emptyIcon={Factory}
            emptyTitle="Nenhuma planta cadastrada"
            emptyDescription="Cadastre o primeiro centro de produção."
        />
    );
}

export default PlantaTable;