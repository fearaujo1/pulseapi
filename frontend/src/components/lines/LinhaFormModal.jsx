import { X } from "lucide-react";
import { useState } from "react";

function LinhaFormModal({
                            isOpen,
                            onClose,
                            onSubmit,
                            planta,
                            initialData = null,
                            loading = false,
                        }) {
    const [formData, setFormData] = useState(() =>
        criarFormInicial(initialData)
    );

    if (!isOpen) {
        return null;
    }

    const isEditMode = Boolean(initialData?.id);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        onSubmit({
            ...formData,
            plantaId: planta.id,
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
                <div className="flex items-start justify-between px-7 pt-7">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {isEditMode
                                ? "Editar Linha"
                                : "Nova Linha"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Planta:{" "}
                            <span className="font-semibold">
                                {planta?.nome}
                            </span>
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="px-7 pb-7 pt-6"
                >
                    <div className="space-y-5">
                        <Campo
                            label="Nome da linha"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            placeholder="Ex: Linha de Codificação 01"
                            required
                        />

                        <Campo
                            label="Código"
                            name="codigo"
                            value={formData.codigo}
                            onChange={handleChange}
                            placeholder="Ex: LIN01"
                            required
                        />

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-900">
                                Descrição
                            </label>

                            <textarea
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Descreva a finalidade da linha"
                                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-900">
                                Status *
                            </label>

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-500"
                            >
                                <option value="ATIVA">
                                    Ativa
                                </option>

                                <option value="INATIVA">
                                    Inativa
                                </option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-7 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-10 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={loading || !planta?.id}
                            className="h-10 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {loading
                                ? "Salvando..."
                                : isEditMode
                                    ? "Salvar alterações"
                                    : "Criar linha"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Campo({
                   label,
                   required = false,
                   ...inputProps
               }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
                {label}
                {required ? " *" : ""}
            </label>

            <input
                {...inputProps}
                required={required}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-500"
            />
        </div>
    );
}

function criarFormInicial(initialData) {
    return {
        nome: initialData?.nome || "",
        codigo: initialData?.codigo || "",
        descricao: initialData?.descricao || "",
        status: initialData?.status || "ATIVA",
    };
}

export default LinhaFormModal;