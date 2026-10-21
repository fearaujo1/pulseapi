import {
    Network,
    Pencil,
    Trash2,
    Users,
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
    TableText,
} from "../common/table/index.js";

function LinhaTable({
                        linhas = [],
                        plantaSelecionada,
                        onEdit,
                        onDelete,
                        onManageResponsaveis,
                        canEdit = false,
                        canDelete = false,
                        canManageResponsaveis = false,
                        canManage = false,
                        loading = false,
                    }) {
    const permiteEditar =
        canEdit || canManage;

    const permiteExcluir =
        canDelete || canManage;

    const permiteResponsaveis =
        canManageResponsaveis || canManage;

    const possuiAcoes =
        permiteEditar ||
        permiteExcluir ||
        permiteResponsaveis;

    const columns = [
        {
            key: "linha",
            header: "Linha",
            width: "15rem",
            render: (linha) => (
                <div className="min-w-0">
                    <TablePrimaryText
                        title={linha.nome}
                    >
                        {linha.nome || "—"}
                    </TablePrimaryText>

                    <TableSecondaryText>
                        {linha.codigo || "Sem código"}
                    </TableSecondaryText>
                </div>
            ),
        },
        {
            key: "descricao",
            header: "Descrição",
            width: "20rem",
            render: (linha) => (
                <TableText title={linha.descricao}>
                    {linha.descricao ||
                        "Sem descrição"}
                </TableText>
            ),
        },
        {
            key: "status",
            header: "Status",
            width: "8rem",
            render: (linha) => (
                <StatusBadge
                    status={linha.status}
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
            width: "9rem",
            render: (linha) => (
                <TableActions>
                    {permiteResponsaveis && (
                        <TableActionButton
                            title="Gerenciar responsáveis"
                            aria-label={`Gerenciar responsáveis de ${
                                linha.nome || "linha"
                            }`}
                            variant="primary"
                            onClick={() =>
                                onManageResponsaveis?.(
                                    linha
                                )
                            }
                        >
                            <Users size={14} />
                        </TableActionButton>
                    )}

                    {permiteEditar && (
                        <TableActionButton
                            title="Editar linha"
                            aria-label={`Editar ${
                                linha.nome || "linha"
                            }`}
                            onClick={() =>
                                onEdit?.(linha)
                            }
                        >
                            <Pencil size={14} />
                        </TableActionButton>
                    )}

                    {permiteExcluir && (
                        <TableActionButton
                            title="Excluir linha"
                            aria-label={`Excluir ${
                                linha.nome || "linha"
                            }`}
                            variant="danger"
                            onClick={() =>
                                onDelete?.(linha)
                            }
                        >
                            <Trash2 size={14} />
                        </TableActionButton>
                    )}
                </TableActions>
            ),
        });
    }

    if (!plantaSelecionada) {
        return (
            <DataTable
                columns={columns}
                data={[]}
                minWidth="36rem"
                emptyIcon={Network}
                emptyTitle="Selecione uma planta"
                emptyDescription="As linhas da planta selecionada aparecerão aqui."
            />
        );
    }

    return (
        <DataTable
            columns={columns}
            data={linhas}
            loading={loading}
            skeletonRows={4}
            minWidth="36rem"
            rowKey={(linha) => linha.id}
            emptyIcon={Network}
            emptyTitle="Nenhuma linha cadastrada"
            emptyDescription={`Ainda não existem linhas em ${plantaSelecionada.nome}.`}
        />
    );
}

export default LinhaTable;