import {
    Cable,
    Pencil,
    Trash2,
} from "lucide-react";

import StatusBadge from "../common/StatusBadge.jsx";

function EquipmentCards({
                            equipamentos = [],
                            onEdit,
                            onDelete,
                            onIntegracao,
                            canEdit = false,
                            canDelete = false,
                            canIntegrate = false,
                        }) {
    if (equipamentos.length === 0) {
        return (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                Nenhum equipamento encontrado.
            </div>
        );
    }

    const possuiAcoes =
        canIntegrate ||
        canEdit ||
        canDelete;

    return (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {equipamentos.map((equipamento) => (
                <div
                    key={equipamento.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm text-slate-500">
                                {equipamento.codigo || "-"}
                            </p>

                            <h3 className="mt-1 text-xl font-bold text-slate-900">
                                {equipamento.nome || "-"}
                            </h3>
                        </div>

                        <div className="flex items-start gap-4">
                            <div>
                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Status
                                </p>

                                <StatusBadge
                                    status={equipamento.status}
                                />
                            </div>

                            <div>
                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Conexão
                                </p>

                                <StatusBadge
                                    status={
                                        equipamento.statusConexao ||
                                        "SEM_CONEXAO"
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <InfoCard
                            label="Planta"
                            value={equipamento.plantaNome}
                        />

                        <InfoCard
                            label="Linha"
                            value={equipamento.linhaNome}
                        />

                        <InfoCard
                            label="Tipo"
                            value={equipamento.tipo}
                        />

                        <InfoCard
                            label="IP"
                            value={equipamento.ip}
                        />

                        <InfoCard
                            label="Porta"
                            value={equipamento.porta}
                        />

                        <InfoCard
                            label="Protocolo"
                            value={equipamento.protocolo}
                        />

                        <InfoCard
                            label="Fabricante"
                            value={equipamento.fabricante}
                        />

                        <InfoCard
                            label="Modelo"
                            value={equipamento.modelo}
                        />
                    </div>

                    {possuiAcoes && (
                        <div className="mt-6 flex items-center justify-end gap-2">
                            {canIntegrate && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onIntegracao?.(
                                            equipamento
                                        )
                                    }
                                    className="rounded-xl border border-blue-200 p-2 text-blue-600 transition hover:bg-blue-50"
                                    title="Integração"
                                    aria-label={`Abrir integração do equipamento ${equipamento.nome}`}
                                >
                                    <Cable size={16} />
                                </button>
                            )}

                            {canEdit && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onEdit?.(
                                            equipamento
                                        )
                                    }
                                    className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                                    title="Editar"
                                    aria-label={`Editar equipamento ${equipamento.nome}`}
                                >
                                    <Pencil size={16} />
                                </button>
                            )}

                            {canDelete && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onDelete?.(
                                            equipamento
                                        )
                                    }
                                    className="rounded-xl border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                                    title="Excluir"
                                    aria-label={`Excluir equipamento ${equipamento.nome}`}
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function InfoCard({
                      label,
                      value,
                  }) {
    return (
        <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
                {label}
            </p>

            <p className="mt-1 text-[13.5px] text-slate-800">
                {value ?? "-"}
            </p>
        </div>
    );
}

export default EquipmentCards;