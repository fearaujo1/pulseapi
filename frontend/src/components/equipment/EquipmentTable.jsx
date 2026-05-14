import StatusBadge from "./StatusBadge";
import { Pencil, Trash2, ArrowUpDown } from "lucide-react";

function EquipmentTable({
                            equipamentos = [],
                            onEdit,
                            onDelete,
                            onSort,
                            sortField,
                            sortDirection,
                            canEdit = true,
                            canDelete = true
                        }) {

    function renderSortIcon(field) {
        if (sortField !== field) {
            return <ArrowUpDown size={14} className="text-slate-400" />;
        }
        return sortDirection === "asc" ? "↑" : "↓";
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-left">
                        <th
                            onClick={() => onSort("nome")}
                            className="px-6 py-4 text-sm font-semibold text-slate-600"
                        >
                            <div className="flex items-center gap-2">
                                Nome {renderSortIcon("nome")}
                            </div>
                        </th>
                        <th
                            onClick={() => onSort("codigo")}
                            className="px-6 py-4 text-sm font-semibold text-slate-600 cursor-pointer select-none"
                        >
                            <div className="flex items-center gap-2">
                                Código {renderSortIcon("codigo")}
                            </div>
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Tipo</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Setor</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">IP</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Porta</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Protocolo</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Ações</th>
                    </tr>
                    </thead>

                    <tbody>
                    {equipamentos.length === 0 ? (
                        <tr>
                            <td colSpan="10" className="px-6 py-10 text-center text-slate-500">
                                Nenhum equipamento encontrado.
                            </td>
                        </tr>
                    ) : (
                        equipamentos.map((equipamento) => (
                            <tr
                                key={equipamento.id}
                                className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                            >
                                <td className="px-6 py-5 text-[13.5px] text-slate-600">
                                    {equipamento.nome || "-"}
                                </td>

                                <td className="px-6 py-5 text-[13.5px] text-slate-600">
                                    {equipamento.codigo || "-"}
                                </td>

                                <td className="px-6 py-5 text-[13.5px] text-slate-600">
                                    {equipamento.tipo || "-"}
                                </td>

                                <td className="px-6 py-5 text-[13.5px] text-slate-600">
                                    {equipamento.setor || "-"}
                                </td>

                                <td className="px-6 py-5 text-[13.5px] text-slate-600">
                                    {equipamento.ip || "-"}
                                </td>

                                <td className="px-6 py-5 text-[13.5px] text-slate-600">
                                    {equipamento.porta || "-"}
                                </td>

                                <td className="px-6 py-5 text-[13.5px] text-slate-600">
                                    {equipamento.protocolo || "-"}
                                </td>

                                <td className="px-6 py-5">
                                    <StatusBadge status={equipamento.status} />
                                </td>

                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        {canEdit && (
                                            <button
                                                onClick={() => onEdit(equipamento)}
                                                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition"
                                                title="Editar"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        )}

                                        {canDelete && (
                                            <button
                                                onClick={() => onDelete(equipamento)}
                                                className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
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


export default EquipmentTable;