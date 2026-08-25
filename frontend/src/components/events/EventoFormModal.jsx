import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";


const DESCRICAO_MAX_LENGTH = 255;

function EventoFormModal({
                             isOpen,
                             onClose,
                             onSubmit,
                             loading = false,
                             mode = "create",
                             initialData = null,
                             equipamentos = [],
                         }) {
    const [formData, setFormData] = useState(() =>
        criarFormInicial(initialData)
    );

    const isEditMode = mode === "edit";

    if (!isOpen) return null;

    function handleChange(e) {
        const { name, value } = e.target;

        if (name === "descricao" && value.length > DESCRICAO_MAX_LENGTH) {
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: name === "equipamentoId" ? Number(value) : value,
        }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        onSubmit(formData);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-3xl rounded-[28px] bg-white shadow-2xl">
                <div className="flex items-start justify-between px-8 pt-8">
                    <div>
                        <h2 className="text-[20px] font-bold text-slate-900">
                            {isEditMode ? "Editar Ocorrência" : "Nova Ocorrência"}
                        </h2>
                        <p className="mt-2 text-[13px] text-slate-500">
                            {isEditMode
                                ? "Atualize os dados da ocorrência registrada"
                                : "Registre uma ocorrência ou parada de produção"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-70"
                    >
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pb-8 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field label="Título *">
                            <input
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                placeholder="Ex: Falha na impressora"
                                required
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-blue-500 text-[13px]"
                            />
                        </Field>

                        <Field label="Tipo *">
                            <select
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                required
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-blue-500 text-[13px]"
                            >
                                <option value="FALHA_EQUIPAMENTO">Falha de equipamento</option>
                                <option value="PARADA_LINHA">Parada de linha</option>
                                <option value="MANUTENCAO">Manutenção</option>
                                <option value="OUTRO">Outro</option>
                            </select>
                        </Field>

                        <Field label="Equipamento *">
                            <select
                                name="equipamentoId"
                                value={formData.equipamentoId}
                                onChange={handleChange}
                                required
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-blue-500 text-[13px]"
                            >
                                <option value="">Selecione um equipamento</option>

                                {equipamentos.map((equipamento) => (
                                    <option key={equipamento.id} value={equipamento.id}>
                                        {equipamento.codigo} - {equipamento.nome}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        {isEditMode && (
                            <Field label="Status *">
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-blue-500 text-[13px]"
                                >
                                    <option value="ABERTA">Aberta</option>
                                    <option value="EM_ANALISE">Em análise</option>
                                    <option value="EM_ATENDIMENTO">Em atendimento</option>
                                    <option value="RESOLVIDA">Resolvida</option>
                                    <option value="CANCELADA">Cancelada</option>
                                </select>
                            </Field>
                        )}

                        <Field label="Descrição">
                            <div>
                                <textarea
                                    name="descricao"
                                    value={formData.descricao}
                                    onChange={handleChange}
                                    maxLength={DESCRICAO_MAX_LENGTH}
                                    placeholder="Descreva o que aconteceu..."
                                    className="min-h-[110px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 text-[13px]"
                                />

                                <div className="mt-1 flex justify-end">
                                    <span
                                        className={`text-[12px] ${
                                        DESCRICAO_MAX_LENGTH - formData.descricao.length <= 20
                                            ? "text-red-500"
                                            : "text-slate-400"
                                        }`}
                                    >
                                        {DESCRICAO_MAX_LENGTH - formData.descricao.length} caracteres restantes
                                    </span>
                                </div>
                            </div>
                        </Field>
                    </div>

                    <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                        <div className="flex gap-3">
                            <AlertTriangle className="mt-0.5 text-blue-600" size={20} />

                            <div>
                                <p className="text-[14.5px] font-semibold text-blue-700">
                                    Gestão de ocorrências
                                </p>
                                <p className="mt-1 text-[12.5px] text-blue-700/90">
                                    Essas informações serão exibidas no histórico de eventos do sistema.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="h-10 rounded-xl border border-slate-200 bg-white px-6 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-70 text-[13.5px]"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="h-10 rounded-xl bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 text-[13.5px]"
                        >
                            {loading
                                ? "Salvando..."
                                : isEditMode
                                    ? "Salvar Alterações"
                                    : "Criar Ocorrência"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="mb-2 block text-[13.5px] font-semibold text-slate-900">
                {label}
            </label>
            {children}
        </div>
    );
}

function criarFormInicial(initialData) {
    return {
        titulo: initialData?.titulo || "",
        descricao: initialData?.descricao || "",
        tipo: initialData?.tipo || "FALHA_EQUIPAMENTO",
        equipamentoId: initialData?.equipamentoId
            ? String(initialData.equipamentoId)
            : "",
        status: initialData?.status || "ABERTA",
    };
}

export default EventoFormModal;