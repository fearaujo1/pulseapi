import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import FormField from "../common/FormField";
import Toggle from "../common/Toggle";
import { inputClass } from "../common/formStyles";

function formatarHora(hora) {
    if (!hora) return "";

    return String(hora).substring(0, 5);
}

function TurnoModal({
                        turno,
                        onClose,
                        onSave,
                    }) {
    const [nome, setNome] = useState(turno?.nome || "");
    const [horaInicio, setHoraInicio] = useState(
        formatarHora(turno?.horaInicio)
    );
    const [horaFim, setHoraFim] = useState(
        formatarHora(turno?.horaFim)
    );
    const [ativo, setAtivo] = useState(turno?.ativo ?? true);
    const [saving, setSaving] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!nome.trim() || !horaInicio || !horaFim) {
            toast.error("Preencha os dados do turno.");
            return;
        }

        try {
            setSaving(true);

            await onSave({
                nome: nome.trim(),
                horaInicio,
                horaFim,
                ativo,
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-950">
                            {turno ? "Editar Turno" : "Novo Turno"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Configure o período de funcionamento
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-xl p-2 transition hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mt-6 space-y-5">
                    <FormField label="Nome" required>
                        <input
                            value={nome}
                            onChange={(event) =>
                                setNome(event.target.value)
                            }
                            placeholder="Ex.: Turno A"
                            className={inputClass}
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Início" required>
                            <input
                                type="time"
                                value={horaInicio}
                                onChange={(event) =>
                                    setHoraInicio(event.target.value)
                                }
                                className={inputClass}
                            />
                        </FormField>

                        <FormField label="Fim" required>
                            <input
                                type="time"
                                value={horaFim}
                                onChange={(event) =>
                                    setHoraFim(event.target.value)
                                }
                                className={inputClass}
                            />
                        </FormField>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                        <div>
                            <p className="font-semibold text-slate-800">
                                Turno ativo
                            </p>

                            <p className="text-xs text-slate-500">
                                Turnos inativos não liberam acesso.
                            </p>
                        </div>

                        <Toggle
                            checked={ativo}
                            onChange={setAtivo}
                            label="Ativar ou inativar turno"
                        />
                    </div>
                </div>

                <div className="mt-7 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="h-11 rounded-xl border border-slate-200 px-5 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="h-11 rounded-xl bg-blue-600 px-5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? "Salvando..." : "Salvar Turno"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default TurnoModal;