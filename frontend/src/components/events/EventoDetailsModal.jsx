import {
    Factory,
    FileText,
    X,
} from "lucide-react";

import StatusBadge from "../common/StatusBadge";
import {
    eventoStatusMap,
    eventoTipoMap,
} from "./eventoMaps";

function DetailField({
                         label,
                         children,
                     }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <div className="mt-2 text-[14px] font-medium text-slate-700">
                {children ?? "-"}
            </div>
        </div>
    );
}

function EventoDetailsModal({
                                evento,
                                onClose,
                            }) {
    if (!evento) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl rounded-[28px] bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between border-b border-slate-200 p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <FileText size={21} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-950">
                                Detalhes da Ocorrência
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Registro #{evento.id}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                        aria-label="Fechar modal"
                    >
                        <X size={21} />
                    </button>
                </div>

                <div className="space-y-6 p-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Título
                        </p>

                        <p className="mt-2 text-lg font-bold text-slate-900">
                            {evento.titulo || "-"}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <DetailField label="Tipo">
                            <StatusBadge
                                status={evento.tipo}
                                statusMap={eventoTipoMap}
                            />
                        </DetailField>

                        <DetailField label="Status">
                            <StatusBadge
                                status={evento.status}
                                statusMap={eventoStatusMap}
                            />
                        </DetailField>

                        <DetailField label="Equipamento">
                            <div className="flex items-center gap-2">
                                <Factory size={16} />

                                <span>
                                    {evento.equipamentoNome || "-"}

                                    {evento.equipamentoCodigo && (
                                        <>
                                            {" "}
                                            ({evento.equipamentoCodigo})
                                        </>
                                    )}
                                </span>
                            </div>
                        </DetailField>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Descrição
                        </p>

                        <div className="mt-2 min-h-24 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[14px] leading-6 text-slate-700">
                            {evento.descricao || "Nenhuma descrição informada."}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end border-t border-slate-200 px-6 py-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EventoDetailsModal;