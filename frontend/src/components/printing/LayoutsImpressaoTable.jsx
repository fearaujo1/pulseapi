import { Pencil, Trash2 } from "lucide-react";

import StatusBadge from "../common/StatusBadge";
import TableSkeleton from "../common/TableSkeleton";

const strategyMap = {
    DELIMITADO: {
        label: "Delimitador",
        className: "bg-blue-50 text-blue-700",
    },
    OFFSET_FIXO: {
        label: "Offset fixo",
        className: "bg-violet-50 text-violet-700",
    },
};

const layoutStatusMap = {
    ATIVO: {
        label: "Ativo",
        className: "bg-green-50 text-green-700",
    },
    INATIVO: {
        label: "Inativo",
        className: "bg-slate-100 text-slate-600",
    },
};

function TableHeader({ children }) {
    return (
        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            {children}
        </th>
    );
}

function TableCell({ children }) {
    return (
        <td className="px-5 py-4 text-[13.5px] text-slate-600">
            {children}
        </td>
    );
}

function LayoutImpressaoTable({
                                  layouts = [],
                                  loading = false,
                                  canManage = false,
                                  onEdit,
                                  onDelete,
                                  deleteLoading = false,
                              }) {
    if (loading) {
        return (
            <TableSkeleton
                rows={5}
                columns={7}
                minWidth="1000px"
            />
        );
    }

    return (
        <div className="overflow-x-auto rounded-3xl border border-slate-200">
            <table className="w-full min-w-[1000px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                    <TableHeader>Nome</TableHeader>
                    <TableHeader>Nome na impressora</TableHeader>
                    <TableHeader>Equipamento</TableHeader>
                    <TableHeader>Estratégia</TableHeader>
                    <TableHeader>Campos</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Ações</TableHeader>
                </tr>
                </thead>

                <tbody>
                {layouts.length === 0 ? (
                    <tr>
                        <td
                            colSpan={7}
                            className="py-12 text-center text-slate-500"
                        >
                            Nenhum layout encontrado.
                        </td>
                    </tr>
                ) : (
                    layouts.map((layout) => (
                        <tr
                            key={layout.id}
                            className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                        >
                            <TableCell>
                                <p className="font-semibold text-slate-800">
                                    {layout.nome || "-"}
                                </p>
                            </TableCell>

                            <TableCell>
                                <code className="text-xs">
                                    {layout.nomeNaImpressora || "-"}
                                </code>
                            </TableCell>

                            <TableCell>
                                {layout.equipamentoNome || "-"}
                            </TableCell>

                            <TableCell>
                                <StatusBadge
                                    status={layout.estrategiaMontagem}
                                    statusMap={strategyMap}
                                />
                            </TableCell>

                            <TableCell>
                                {layout.campos?.length ?? 0}
                            </TableCell>

                            <TableCell>
                                <StatusBadge
                                    status={
                                        layout.ativo
                                            ? "ATIVO"
                                            : "INATIVO"
                                    }
                                    statusMap={layoutStatusMap}
                                />
                            </TableCell>

                            <TableCell>
                                {canManage ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onEdit(layout)}
                                            className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-100"
                                            title="Editar layout"
                                            aria-label={`Editar ${layout.nome}`}
                                        >
                                            <Pencil size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onDelete(layout)}
                                            disabled={deleteLoading}
                                            className="rounded-xl border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                            title="Excluir layout"
                                            aria-label={`Excluir ${layout.nome}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400">
                                            Somente visualização
                                        </span>
                                )}
                            </TableCell>
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
}

export default LayoutImpressaoTable;