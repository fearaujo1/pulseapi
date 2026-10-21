import { Factory, FileText, X } from "lucide-react";
import StatusBadge from "../common/StatusBadge.jsx";
import { eventoStatusMap, eventoTipoMap } from "../../config/statusMaps.js";
import { Button, IconButton } from "../common/Button.jsx";

function EventoDetailsModal({ evento, onClose }) {
    if (!evento) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
            onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        >
            <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* HEADER DO MODAL */}
                <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FileText size={19} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Detalhes da ocorrência</h2>
                            <p className="mt-0.5 text-xs text-slate-500">Registro #{evento.id}</p>
                        </div>
                    </div>
                    <IconButton
                        icon={X}
                        title="Fechar modal"
                        onClick={onClose}
                    />
                </header>

                {/* CORPO DOS DETALHES */}
                <div className="space-y-5 p-6">
                    <DetailField label="Título">
                        <p className="text-base font-bold text-slate-900">
                            {evento.titulo || "-"}
                        </p>
                    </DetailField>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <DetailField label="Tipo">
                            <StatusBadge status={evento.tipo} statusMap={eventoTipoMap} />
                        </DetailField>

                        <DetailField label="Status">
                            <StatusBadge status={evento.status} statusMap={eventoStatusMap} />
                        </DetailField>

                        <DetailField label="Equipamento" className="sm:col-span-2">
                            <div className="flex items-center gap-2 text-xs text-slate-700">
                                <Factory size={15} className="text-slate-400" />
                                <span>
                  {evento.equipamentoNome || "-"}
                                    {evento.equipamentoCodigo ? ` (${evento.equipamentoCodigo})` : ""}
                </span>
                            </div>
                        </DetailField>
                    </div>

                    <DetailField label="Descrição">
                        <div className="min-h-20 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700">
                            {evento.descricao || "Nenhuma descrição informada."}
                        </div>
                    </DetailField>
                </div>

                {/* FOOTER DO MODAL */}
                <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
                    <Button onClick={onClose}>
                        Fechar
                    </Button>
                </footer>

            </div>
        </div>
    );
}

{/* COMPONENTE AUXILIAR */}
function DetailField({ label, children, className = "" }) {
    return (
        <div className={className}>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {label}
            </p>
            {children ?? "-"}
        </div>
    );
}

export default EventoDetailsModal;
