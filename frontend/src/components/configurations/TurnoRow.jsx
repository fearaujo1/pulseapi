import { Clock3, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "../common/StatusBadge";

const turnoStatusMap = {
    ATIVO: {
        label: "Ativo",
        className: "bg-green-50 text-green-700",
    },
    INATIVO: {
        label: "Inativo",
        className: "bg-slate-100 text-slate-500",
    },
};

function formatarHora(hora) {
    if (!hora) return "";

    return String(hora).substring(0, 5);
}

function TurnoRow({
                      turno,
                      onEdit,
                      onDelete,
                  }) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Clock3 size={20} />
                </div>

                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">
                            {turno.nome}
                        </p>

                        <StatusBadge
                            status={turno.ativo ? "ATIVO" : "INATIVO"}
                            statusMap={turnoStatusMap}
                        />
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        {formatarHora(turno.horaInicio)}
                        {" → "}
                        {formatarHora(turno.horaFim)}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onEdit}
                    className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-50"
                    title="Editar turno"
                >
                    <Pencil size={16} />
                </button>

                <button
                    type="button"
                    onClick={onDelete}
                    className="rounded-xl border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                    title="Excluir turno"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

export default TurnoRow;