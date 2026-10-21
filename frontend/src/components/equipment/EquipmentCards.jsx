import {
    Cpu,
    MapPin,
    Network,
    Pencil,
    Trash2,
} from "lucide-react";

import StatusBadge from "../common/StatusBadge.jsx";

function EquipmentCards({
                            equipamentos = [],
                            onEdit,
                            onDelete,
                            canEdit = false,
                            canDelete = false,
                        }) {
    if (equipamentos.length === 0) {
        return (
            <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                    <Cpu size={19} />
                </div>

                <h3 className="mt-3 text-sm font-semibold text-slate-800">
                    Nenhum equipamento encontrado
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                    Altere os filtros ou cadastre um novo equipamento.
                </p>
            </div>
        );
    }

    const possuiAcoes =
        canEdit || canDelete;

    return (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {equipamentos.map((equipamento) => (
                <article
                    key={equipamento.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
                >
                    <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Cpu size={18} />
                            </div>

                            <div className="min-w-0">
                                <h3 className="truncate text-sm font-bold text-slate-900">
                                    {equipamento.nome || "Sem nome"}
                                </h3>

                                <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                    {equipamento.codigo || "Sem código"}
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <StatusBadge status={equipamento.status} />
                            <StatusBadge
                                status={equipamento.statusConexao || "SEM_CONEXAO"}
                            />
                        </div>
                    </header>

                    <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4 sm:divide-y-0">
                        <Info
                            icon={MapPin}
                            label="Planta"
                            value={equipamento.plantaNome}
                        />

                        <Info
                            icon={MapPin}
                            label="Linha"
                            value={equipamento.linhaNome}
                        />

                        <Info
                            icon={Network}
                            label="Endereço"
                            value={formatarEndereco(equipamento)}
                        />

                        <Info
                            icon={Cpu}
                            label="Modelo"
                            value={formatarModelo(equipamento)}
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3 bg-slate-50/70 px-4 py-3">
                        <div className="min-w-0 text-[10px] text-slate-500">
                            <span className="font-semibold text-slate-600">
                                {equipamento.tipo || "Tipo não informado"}
                            </span>

                            {equipamento.protocolo && (
                                <>
                                    <span className="px-1.5 text-slate-300">•</span>
                                    {equipamento.protocolo}
                                </>
                            )}
                        </div>

                        {possuiAcoes && (
                            <div className="flex shrink-0 items-center gap-1">
                                {canEdit && (
                                    <ActionButton
                                        icon={Pencil}
                                        label="Editar"
                                        onClick={() => onEdit?.(equipamento)}
                                        className="hover:bg-slate-200 hover:text-slate-700"
                                    />
                                )}

                                {canDelete && (
                                    <ActionButton
                                        icon={Trash2}
                                        label="Excluir"
                                        onClick={() => onDelete?.(equipamento)}
                                        className="hover:bg-red-100 hover:text-red-600"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </article>
            ))}
        </div>
    );
}

function Info({ icon: Icon, label, value }) {
    return (
        <div className="min-w-0 px-3 py-3">
            <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                <Icon size={11} />
                {label}
            </div>

            <p className="mt-1 truncate text-[11px] font-semibold text-slate-700">
                {value || "—"}
            </p>
        </div>
    );
}

function ActionButton({ icon: Icon, label, onClick, className }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition ${className}`}
            title={label}
            aria-label={label}
        >
            <Icon size={15} />
        </button>
    );
}

function formatarEndereco(equipamento) {
    if (!equipamento.ip) {
        return "Sem IP";
    }

    return equipamento.porta
        ? `${equipamento.ip}:${equipamento.porta}`
        : equipamento.ip;
}

function formatarModelo(equipamento) {
    const partes = [
        equipamento.fabricante,
        equipamento.modelo,
    ].filter(Boolean);

    return partes.length > 0
        ? partes.join(" ")
        : "Não informado";
}

export default EquipmentCards;
