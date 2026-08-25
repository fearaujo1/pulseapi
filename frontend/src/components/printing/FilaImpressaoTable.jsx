import { XCircle } from "lucide-react";

import StatusBadge from "../common/StatusBadge";
import TableSkeleton from "../common/TableSkeleton";
import { filaStatusMap } from "./filaStatusMap";

function formatarData(data) {
    if (!data) return "-";

    const dataFormatada = new Date(data);

    if (Number.isNaN(dataFormatada.getTime())) {
        return "-";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "medium",
    }).format(dataFormatada);
}

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

function FilaImpressaoTable({
                                fila = [],
                                loading = false,
                                canCancel = false,
                                onSelect,
                                onCancel,
                            }) {
    if (loading) {
        return (
            <TableSkeleton
                rows={5}
                columns={10}
                minWidth="1300px"
            />
        );
    }

    function podeCancelarItem(item) {
        return (
            canCancel &&
            ["PENDENTE", "ERRO"].includes(item.status)
        );
    }

    return (
        <div className="overflow-x-auto rounded-3xl border border-slate-200">
            <table className="w-full min-w-[1300px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                    <TableHeader>Ordem</TableHeader>
                    <TableHeader>Equipamento</TableHeader>
                    <TableHeader>Layout</TableHeader>
                    <TableHeader>Dados</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Tentativas</TableHeader>
                    <TableHeader>Criado em</TableHeader>
                    <TableHeader>Enviado em</TableHeader>
                    <TableHeader>Impresso em</TableHeader>
                    <TableHeader>Ações</TableHeader>
                </tr>
                </thead>

                <tbody>
                {fila.length === 0 ? (
                    <tr>
                        <td
                            colSpan={10}
                            className="py-12 text-center text-slate-500"
                        >
                            Nenhum registro encontrado.
                        </td>
                    </tr>
                ) : (
                    fila.map((item) => (
                        <tr
                            key={item.id}
                            onClick={() => onSelect(item)}
                            className="cursor-pointer border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                        >
                            <TableCell>
                                #{item.ordemFila ?? "-"}
                            </TableCell>

                            <TableCell>
                                <div>
                                    <p className="font-semibold text-slate-800">
                                        {item.equipamentoNome || "-"}
                                    </p>

                                    <p className="text-xs text-slate-400">
                                        ID {item.equipamentoId ?? "-"}
                                    </p>
                                </div>
                            </TableCell>

                            <TableCell>
                                {item.layoutNome || "-"}
                            </TableCell>

                            <TableCell>
                                <div className="max-w-[300px]">
                                    <code className="break-all text-xs text-slate-600">
                                        {item.payloadMontado || "-"}
                                    </code>
                                </div>
                            </TableCell>

                            <TableCell>
                                <StatusBadge
                                    status={item.status}
                                    statusMap={filaStatusMap}
                                />
                            </TableCell>

                            <TableCell>
                                {item.tentativas ?? 0}
                            </TableCell>

                            <TableCell>
                                {formatarData(item.criadoEm)}
                            </TableCell>

                            <TableCell>
                                {formatarData(item.enviadoEm)}
                            </TableCell>

                            <TableCell>
                                {formatarData(item.impressoEm)}
                            </TableCell>

                            <TableCell>
                                {podeCancelarItem(item) ? (
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onCancel(item);
                                        }}
                                        className="rounded-xl border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                                        title="Cancelar impressão"
                                        aria-label={`Cancelar impressão ${item.id}`}
                                    >
                                        <XCircle size={16} />
                                    </button>
                                ) : (
                                    <span className="text-slate-300">
                                            -
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

export default FilaImpressaoTable;