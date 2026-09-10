import StatusBadge from "../common/StatusBadge.jsx";
import {
    Pencil,
    Trash2,
    ArrowUpDown,
    Cable,
} from "lucide-react";

function EquipmentTable({
                            equipamentos = [],
                            onEdit,
                            onDelete,
                            onIntegracao,
                            onSort,
                            sortField,
                            sortDirection,
                            canEdit = true,
                            canDelete = true,
                        }) {
    function renderSortIcon(field) {
        if (sortField !== field) {
            return (
                <ArrowUpDown
                    size={14}
                    className="text-slate-400"
                />
            );
        }

        return sortDirection === "asc" ? "↑" : "↓";
    }

    const headerClass =
        "px-4 py-3 text-sm font-semibold text-slate-600";

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[70rem]">
                    <thead className="border-b border-slate-200 bg-slate-50">
                    <tr className="text-left">
                        <th
                            onClick={() => onSort("nome")}
                            className={`${headerClass} cursor-pointer select-none`}
                        >
                            <div className="flex items-center gap-2">
                                Equipamento
                                {renderSortIcon("nome")}
                            </div>
                        </th>

                        <th className={headerClass}>
                            Tipo
                        </th>

                        <th className={headerClass}>
                            Localização
                        </th>

                        <th className={headerClass}>
                            Rede
                        </th>

                        <th className={headerClass}>
                            Status
                        </th>

                        <th className={headerClass}>
                            Conexão
                        </th>

                        <th className={headerClass}>
                            Ações
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {equipamentos.length === 0 ? (
                        <tr>
                            <td
                                colSpan={7}
                                className="px-4 py-10 text-center text-slate-500"
                            >
                                Nenhum equipamento encontrado.
                            </td>
                        </tr>
                    ) : (
                        equipamentos.map(
                            (equipamento) => (
                                <tr
                                    key={equipamento.id}
                                    className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                                >
                                    <td className="px-4 py-4">
                                        <p className="text-sm font-semibold text-slate-800">
                                            {equipamento.nome ||
                                                "-"}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {equipamento.codigo ||
                                                "-"}
                                        </p>
                                    </td>

                                    <td className="px-4 py-4 text-sm text-slate-600">
                                        {equipamento.tipo ||
                                            "-"}
                                    </td>

                                    <td className="px-4 py-4">
                                        <p className="text-sm font-medium text-slate-700">
                                            {equipamento.linhaNome ||
                                                "Sem linha"}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {equipamento.plantaNome ||
                                                "Sem planta"}
                                        </p>
                                    </td>

                                    <td className="px-4 py-4">
                                        <p className="text-sm font-medium text-slate-700">
                                            {equipamento.ip || "Sem IP"}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            {equipamento.porta
                                                ? `Porta ${equipamento.porta}`
                                                : "Sem porta"}
                                        </p>
                                    </td>

                                    <td className="px-4 py-4">
                                        <StatusBadge
                                            status={
                                                equipamento.status
                                            }
                                        />
                                    </td>

                                    <td className="px-4 py-4">
                                        <StatusBadge
                                            status={
                                                equipamento.statusConexao ||
                                                "SEM_CONEXAO"
                                            }
                                        />
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onIntegracao(
                                                        equipamento
                                                    )
                                                }
                                                className="rounded-xl border border-blue-200 p-2 text-blue-600 transition hover:bg-blue-50"
                                                title="Integração"
                                            >
                                                <Cable
                                                    size={16}
                                                />
                                            </button>

                                            {canEdit && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onEdit(
                                                            equipamento
                                                        )
                                                    }
                                                    className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                                                    title="Editar"
                                                >
                                                    <Pencil
                                                        size={16}
                                                    />
                                                </button>
                                            )}

                                            {canDelete && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onDelete(
                                                            equipamento
                                                        )
                                                    }
                                                    className="rounded-xl border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                                                    title="Excluir"
                                                >
                                                    <Trash2
                                                        size={16}
                                                    />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        )
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default EquipmentTable;