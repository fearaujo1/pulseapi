import { Clock3, Pencil, Trash2 } from "lucide-react";
import StatusBadge from "../common/StatusBadge.jsx";

import {
    turnoStatusMap,
} from "../../config/statusMaps.js";
import { IconButton } from "../common/Button.jsx";

function TurnoRow({ turno, onEdit, onDelete }) {
    return (
        <article className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Clock3 size={17} />
                </div>

                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                            {turno.nome}
                        </h3>
                        <StatusBadge
                            status={turno.ativo ? "ATIVO" : "INATIVO"}
                            statusMap={turnoStatusMap}
                        />
                    </div>

                    <p className="mt-0.5 text-xs text-slate-500">
                        {formatarHora(turno.horaInicio)} — {formatarHora(turno.horaFim)}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <IconButton
                    icon={Pencil}
                    size="small"
                    variant="secondary"
                    title="Editar turno"
                    onClick={onEdit}
                />

                <IconButton
                    icon={Trash2}
                    size="small"
                    variant="dangerOutline"
                    title="Excluir turno"
                    onClick={onDelete}
                />
            </div>
        </article>
    );
}


function formatarHora(hora) {
    return hora ? String(hora).substring(0, 5) : "--:--";
}

export default TurnoRow;
