import {
    ArrowRight,
    ClipboardList,
    Factory,
} from "lucide-react";

import StatusBadge from "../common/StatusBadge.jsx";

import {
    producaoStatusMap,
} from "../../config/statusMaps.js";

import {
    DataTable,
    TableActionButton,
    TableActions,
    TablePrimaryText,
    TableSecondaryText,
    TableText,
} from "../common/table/index.js";

function ProducoesTable({
                            producoes = [],
                            loading = false,
                            onSelect,
                        }) {
    const columns = [
        {
            key: "ordem",
            header: "Ordem",
            width: "14rem",
            render: (producao) => (
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <ClipboardList size={15} />
                    </div>

                    <TablePrimaryText
                        title={producao.codigoOrdem}
                    >
                        {producao.codigoOrdem || "Sem código"}
                    </TablePrimaryText>
                </div>
            ),
        },
        {
            key: "linha",
            header: "Linha",
            width: "13rem",
            render: (producao) => (
                <div className="flex min-w-0 items-center gap-2">
                    <Factory
                        size={14}
                        className="shrink-0 text-slate-400"
                    />

                    <TableText
                        className="font-medium"
                        title={producao.linhaNome}
                    >
                        {producao.linhaNome ||
                            `Linha #${producao.linhaId}`}
                    </TableText>
                </div>
            ),
        },
        {
            key: "equipamento",
            header: "Equipamento",
            width: "16rem",
            render: (producao) => (
                <div className="min-w-0">
                    <TablePrimaryText
                        title={
                            producao.equipamentoPrincipalNome
                        }
                    >
                        {producao.equipamentoPrincipalNome ||
                            "Não informado"}
                    </TablePrimaryText>

                    {producao.equipamentoRetrabalhoNome && (
                        <TableSecondaryText
                            title={
                                producao
                                    .equipamentoRetrabalhoNome
                            }
                        >
                            Retrabalho:{" "}
                            {
                                producao
                                    .equipamentoRetrabalhoNome
                            }
                        </TableSecondaryText>
                    )}
                </div>
            ),
        },
        {
            key: "quantidade",
            header: "Itens",
            align: "right",
            width: "6rem",
            render: (producao) => (
                <span className="text-sm font-bold tabular-nums text-slate-900">
                    {producao.quantidadeTotal ?? "—"}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            width: "11rem",
            render: (producao) => (
                <StatusBadge
                    status={producao.status}
                    statusMap={producaoStatusMap}
                    showDot
                />
            ),
        },
        {
            key: "cadastro",
            header: "Cadastro",
            width: "9rem",
            render: (producao) => (
                <div className="whitespace-nowrap">
                    <TablePrimaryText>
                        {formatarData(producao.criadoEm)}
                    </TablePrimaryText>

                    <TableSecondaryText>
                        {formatarHora(producao.criadoEm)}
                    </TableSecondaryText>
                </div>
            ),
        },
        {
            key: "acoes",
            header: "Ações",
            align: "right",
            width: "5rem",
            render: (producao) => (
                <TableActions>
                    <TableActionButton
                        title="Abrir produção"
                        aria-label={`Abrir produção ${
                            producao.codigoOrdem || producao.id
                        }`}
                        variant="primary"
                        onClick={() => onSelect?.(producao)}
                    >
                        <ArrowRight size={14} />
                    </TableActionButton>
                </TableActions>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={producoes}
            loading={loading}
            skeletonRows={5}
            minWidth="62rem"
            rowKey={(producao) => producao.id}
            emptyIcon={ClipboardList}
            emptyTitle="Nenhuma produção encontrada"
            emptyDescription="Altere os filtros ou cadastre uma nova ordem de produção."
        />
    );
}

function formatarData(valor) {
    const data = criarDataValida(valor);

    if (!data) {
        return "—";
    }

    return data.toLocaleDateString("pt-BR");
}

function formatarHora(valor) {
    const data = criarDataValida(valor);

    if (!data) {
        return "";
    }

    return data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function criarDataValida(valor) {
    if (!valor) {
        return null;
    }

    const data = new Date(valor);

    return Number.isNaN(data.getTime())
        ? null
        : data;
}

export default ProducoesTable;