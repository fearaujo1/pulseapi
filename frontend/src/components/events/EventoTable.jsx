import {
    Eye,
    Factory,
    Pencil,
    Trash2,
} from "lucide-react";

import StatusBadge from "../common/StatusBadge.jsx";
import TableSkeleton from "../common/TableSkeleton.jsx";
import {
    eventoStatusMap,
    eventoTipoMap,
} from "./eventoMaps";

function EventoTable({
    eventos = [],
    loading = false,
    onView,
    onEdit,
    onDelete,
    canManage = false,
}) {
    if (loading) {
        return (
            <TableSkeleton
                rows={5}
                columns={6}
                minWidth="1000px"
            />
        );
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                    <thead className="border-b border-slate-200 bg-slate-50">
                        <tr className="text-left">
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                                Título
                            </th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                                Tipo
                            </th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                                Equipamento
                            </th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                                Status
                            </th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                                Ações
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {eventos.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-10 text-center text-slate-500"
                                >
                                    Nenhum evento encontrado.
                                </td>
                            </tr>
                        ) : (
                            eventos.map((evento) => (
                                <tr
                                    key={evento.id}
                                    className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                                >
                                    <td className="px-6 py-5 text-[13.5px] text-slate-600">
                                        {evento.titulo || "-"}
                                    </td>
                                    <td className="px-6 py-5">
                                        <StatusBadge
                                            status={evento.tipo}
                                            statusMap={eventoTipoMap}
                                        />
                                    </td>
                                    <td className="px-6 py-5 text-slate-600 text-[13.5px]">
                                        <div className="flex items-center gap-2">
                                            <Factory
                                                size={15}
                                                className="shrink-0"
                                            />

                                            <span>
                                                {evento.equipamentoNome} - {evento.equipamentoCodigo
                                                                                    ? `(${evento.equipamentoCodigo})`
                                                                                    : ""}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5">
                                        <StatusBadge
                                            status={evento.status}
                                            statusMap={eventoStatusMap}
                                        />
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onView(evento)}
                                                className="rounded-xl border border-blue-200 p-2 text-blue-600 transition hover:bg-blue-50"
                                                title="Visualizar detalhes"
                                                aria-label={`Visualizar ${evento.titulo}`}
                                            >
                                                <Eye size={16} />
                                            </button>

                                            {canManage && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => onEdit(evento)}
                                                        className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-100"
                                                        title="Editar"
                                                        aria-label={`Editar ${evento.titulo}`}
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => onDelete(evento)}
                                                        className="rounded-xl border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                                                        title="Excluir"
                                                        aria-label={`Excluir ${evento.titulo}`}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
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

export default EventoTable;

