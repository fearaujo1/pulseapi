import { useState } from "react";
import { Clock3, X } from "lucide-react";
import toast from "react-hot-toast";
import { Button, IconButton } from "../common/Button.jsx";
import FormField from "../common/FormField.jsx";
import Toggle from "../common/Toggle.jsx";
import { inputClass } from "../common/formStyles.js";

function TurnoModal({ turno, onClose, onSave }) {
    const [form, setForm] = useState({
        nome: turno?.nome || "",
        horaInicio: formatarHora(turno?.horaInicio),
        horaFim: formatarHora(turno?.horaFim),
        ativo: turno?.ativo ?? true,
    });
    const [saving, setSaving] = useState(false);

    function change(field, value) {
        setForm((previous) => ({ ...previous, [field]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (!form.nome.trim() || !form.horaInicio || !form.horaFim) {
            toast.error("Preencha os dados do turno.");
            return;
        }

        try {
            setSaving(true);
            await onSave({ ...form, nome: form.nome.trim() });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4"
            onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}
        >
            <form onSubmit={handleSubmit} className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* HEADER DO MODAL */}
                <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Clock3 size={19} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-950">
                                {turno ? "Editar turno" : "Novo turno"}
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Configure o período de acesso dos operadores
                            </p>
                        </div>
                    </div>
                    <IconButton
                        icon={X}
                        onClick={onClose}
                        disabled={saving}
                        title="Fechar modal"
                    />
                </header>

                {/* CORPO DO FORMULÁRIO */}
                <div className="space-y-4 px-6 py-5">
                    <FormField label="Nome" required>
                        <input
                            value={form.nome}
                            placeholder="Ex.: Turno A"
                            className={inputClass}
                            onChange={(event) => change("nome", event.target.value)}
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="Início" required>
                            <input
                                type="time"
                                value={form.horaInicio}
                                className={inputClass}
                                onChange={(event) => change("horaInicio", event.target.value)}
                            />
                        </FormField>

                        <FormField label="Fim" required>
                            <input
                                type="time"
                                value={form.horaFim}
                                className={inputClass}
                                onChange={(event) => change("horaFim", event.target.value)}
                            />
                        </FormField>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Turno ativo</p>
                            <p className="mt-0.5 text-xs text-slate-500">Turnos inativos não liberam acesso.</p>
                        </div>
                        <Toggle
                            checked={form.ativo}
                            label="Ativar turno"
                            onChange={(checked) => change("ativo", checked)}
                        />
                    </div>
                </div>

                {/* FOOTER DO MODAL */}
                <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="submit"
                        loading={saving}
                        loadingText="Salvando..."
                        className="min-w-32"
                    >
                        {turno
                            ? "Salvar alterações"
                            : "Criar turno"}
                    </Button>
                </footer>

            </form>
        </div>
    );
}

{/* FUNÇÕES AUXILIARES */}
function formatarHora(hora) {
    return hora ? String(hora).substring(0, 5) : "";
}

export default TurnoModal;
