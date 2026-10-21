import {
    FileText,
    Pencil,
    Trash2,
} from "lucide-react";

import StatusBadge from "../common/StatusBadge.jsx";

import {
    layoutStatusMap,
    layoutStrategyMap,
} from "../../config/statusMaps.js";

import {
    DataTable,
    TableActionButton,
    TableActions,
    TablePrimaryText,
    TableText,
} from "../common/table/index.js";

function LayoutImpressaoTable({
                                  layouts = [],
                                  loading = false,
                                  canManage = false,
                                  onEdit,
                                  onDelete,
                                  deleteLoading = false,
                              }) {
    const columns = [
        {
            key: "layout",
            header: "Layout",
            width: "15rem",
            render: (layout) => (
                <TablePrimaryText
                    title={
                        layout.nome ||
                        "Sem nome"
                    }
                >
                    {layout.nome ||
                        "Sem nome"}
                </TablePrimaryText>
            ),
        },
        {
            key: "nomeNaImpressora",
            header: "Nome na impressora",
            width: "14rem",
            render: (layout) => (
                <code
                    title={
                        layout.nomeNaImpressora ||
                        "Não informado"
                    }
                    className="
                        inline-block max-w-48 truncate
                        rounded-md bg-slate-100
                        px-2 py-1 font-mono
                        text-[10px] text-slate-700
                    "
                >
                    {layout.nomeNaImpressora ||
                        "Não informado"}
                </code>
            ),
        },
        {
            key: "equipamento",
            header: "Equipamento",
            width: "15rem",
            render: (layout) => (
                <TableText
                    title={
                        layout.equipamentoNome ||
                        "Sem equipamento"
                    }
                    className="font-medium text-slate-700"
                >
                    {layout.equipamentoNome ||
                        "Sem equipamento"}
                </TableText>
            ),
        },
        {
            key: "estrategia",
            header: "Estratégia",
            width: "10rem",
            render: (layout) => (
                <StatusBadge
                    status={
                        layout.estrategiaMontagem
                    }
                    statusMap={
                        layoutStrategyMap
                    }
                />
            ),
        },
        {
            key: "campos",
            header: "Campos",
            align: "center",
            width: "6rem",
            render: (layout) => (
                <span
                    className="
                        inline-flex min-w-7
                        items-center justify-center
                        rounded-md bg-slate-100
                        px-2 py-1 text-[10px]
                        font-semibold text-slate-700
                    "
                >
                    {layout.campos?.length ?? 0}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            width: "8rem",
            render: (layout) => (
                <StatusBadge
                    status={
                        layout.ativo
                            ? "ATIVO"
                            : "INATIVO"
                    }
                    statusMap={
                        layoutStatusMap
                    }
                    showDot
                />
            ),
        },
    ];

    if (canManage) {
        columns.push({
            key: "actions",
            header: "Ações",
            type: "actions",
            align: "right",
            width: "6rem",
            render: (layout) => (
                <TableActions>
                    <TableActionButton
                        title={`Editar layout ${layout.nome}`}
                        onClick={() =>
                            onEdit?.(layout)
                        }
                    >
                        <Pencil size={14} />
                    </TableActionButton>

                    <TableActionButton
                        variant="danger"
                        title={`Excluir layout ${layout.nome}`}
                        disabled={deleteLoading}
                        onClick={() =>
                            onDelete?.(layout)
                        }
                    >
                        <Trash2 size={14} />
                    </TableActionButton>
                </TableActions>
            ),
        });
    }

    return (
        <DataTable
            columns={columns}
            data={layouts}
            loading={loading}
            skeletonRows={5}
            minWidth="62rem"
            emptyTitle="Nenhum layout encontrado"
            emptyDescription="Ajuste os filtros ou cadastre um novo layout."
            emptyIcon={FileText}
        />
    );
}

export default LayoutImpressaoTable;