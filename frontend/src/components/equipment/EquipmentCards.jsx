import { Pencil, Trash2 } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx"

function EquipmentCards({ equipamentos = [], onEdit, onDelete, canEdit = true, canDelete = true}) {
    if (equipamentos.length === 0) {
        return (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                Nenhum equipamento encontrado.
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {equipamentos.map((equipamento, index) =>
                <div
                    key={equipamento.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm text-slate-500">{equipamento.codigo || "-"}</p>
                            <h3 className="mt-1 text-
                            xl font-bold text-slate-900">
                                {equipamento.nome || "-"}
                            </h3>
                        </div>

                        <StatusBadge status={equipamento.status} />
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">Tipo</p>
                            <p className="mt-1 text-[13.5px] text-slate-800">
                                {equipamento.tipo || "-"}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">Setor</p>
                            <p className="mt-1 text-[13.5px] text-slate-800">
                                {equipamento.setor || "-"}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">IP</p>
                            <p className="mt-1 text-[13.5px] text-slate-800">
                                {equipamento.ip || "-"}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">Porta</p>
                            <p className="mt-1 text-[13.5px] text-slate-800">
                                {equipamento.porta || "-"}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">Protocolo</p>
                            <p className="mt-1 text-[13.5px] text-slate-800">
                                {equipamento.protocolo || "-"}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">Fabricante</p>
                            <p className="mt-1 text-[13.5px] text-slate-800">
                                {equipamento.fabricante || "-"}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="text-sm text-slate-500">Modelo</p>
                            <p className="mt-1 text-[13.5px] text-slate-800">
                                {equipamento.modelo || "-"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justiy-end gap-2">
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
                                className="p-2 rounded-xl border border-slate-200 text-red-600 hover:bg-red-50 transition"
                                title="Excluir"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default EquipmentCards;