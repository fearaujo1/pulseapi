import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import FormField from "../common/FormField.jsx";
import { inputClass } from "../common/formStyles.js";
import { Button, IconButton } from "../common/Button.jsx";

const DESCRICAO_MAX_LENGTH = 255;

function EventoFormModal({
                             isOpen,
                             onClose,
                             onSubmit,
                             loading = false,
                             mode = "create",
                             initialData = null,
                             equipamentos = [],
                             canChangeStatus = false,
                         }) {
    const [formData, setFormData] = useState(() => criarFormInicial(initialData));
    const isEditMode = mode === "edit";

    // Reinicializa o formulário ao abrir ou mudar os dados iniciais
    useEffect(() => {
        if (isOpen) setFormData(criarFormInicial(initialData));
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    function handleChange(event) {
        const { name, value } = event.target;
        if (name === "descricao" && value.length > DESCRICAO_MAX_LENGTH) return;
        setFormData((previous) => ({ ...previous, [name]: value }));
    }

    function handleSubmit(event) {
        event.preventDefault();
        onSubmit(formData);
    }

    const restantes = DESCRICAO_MAX_LENGTH - formData.descricao.length;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !loading) onClose();
            }}
        >
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* HEADER */}
                <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            {isEditMode ? "Editar ocorrência" : "Nova ocorrência"}
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            {isEditMode
                                ? "Atualize os dados e o andamento do registro."
                                : "Registre uma falha, parada ou manutenção."}
                        </p>
                    </div>

                    <IconButton
                        icon={X}
                        onClick={onClose}
                        disabled={loading}
                        title="Fechar modal"
                    />
                </header>

                {/* FORMULÁRIO */}
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-6">

                        {/* Input: Título */}
                        <FormField label="Título" required>
                            <input
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                placeholder="Ex.: Falha na impressora"
                                required
                                disabled={loading}
                                className={inputClass}
                            />
                        </FormField>

                        {/* Input: Tipo */}
                        <FormField label="Tipo" required>
                            <select
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className={inputClass}
                            >
                                <option value="FALHA_EQUIPAMENTO">Falha de equipamento</option>
                                <option value="PARADA_LINHA">Parada de linha</option>
                                <option value="MANUTENCAO">Manutenção</option>
                                <option value="OUTRO">Outro</option>
                            </select>
                        </FormField>

                        {/* Input: Equipamento */}
                        <FormField label="Equipamento" required>
                            <select
                                name="equipamentoId"
                                value={formData.equipamentoId}
                                onChange={handleChange}
                                required
                                disabled={loading}
                                className={inputClass}
                            >
                                <option value="">Selecione um equipamento</option>
                                {equipamentos.map((equipamento) => (
                                    <option key={equipamento.id} value={equipamento.id}>
                                        {equipamento.codigo} - {equipamento.nome}
                                    </option>
                                ))}
                            </select>
                        </FormField>

                        {/* Input: Status (Apenas no Modo Edição) */}
                        {isEditMode && (
                            <FormField label="Status" required>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                    disabled={loading || !canChangeStatus}
                                    className={inputClass}
                                    title={
                                        !canChangeStatus
                                            ? "Você não possui permissão para alterar o status."
                                            : undefined
                                    }
                                >
                                    <option value="ABERTA">Aberta</option>
                                    <option value="EM_ANALISE">Em análise</option>
                                    <option value="EM_ATENDIMENTO">Em atendimento</option>
                                    <option value="RESOLVIDA">Resolvida</option>
                                    <option value="CANCELADA">Cancelada</option>
                                </select>
                            </FormField>
                        )}

                        {/* Input: Descrição */}
                        <FormField label="Descrição" className="md:col-span-2">
                            <textarea
                              name="descricao"
                              value={formData.descricao}
                              onChange={handleChange}
                              maxLength={DESCRICAO_MAX_LENGTH}
                              placeholder="Descreva o que aconteceu..."
                              disabled={loading}
                              className="min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            />
                            <p
                                className={`mt-1 text-right text-[10px] ${
                                    restantes <= 20 ? "text-red-500" : "text-slate-400"
                                }`}
                            >
                                {restantes} caracteres restantes
                            </p>
                        </FormField>
                    </div>

                    {/* ALERTA DE REGISTRO */}
                    <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                        <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-600" />
                        <div>
                            <p className="text-xs font-semibold text-amber-800">Registro operational</p>
                            <p className="mt-0.5 text-[11px] leading-5 text-amber-700">
                                A ocorrência ficará disponível no histórico e nos relatórios do sistema.
                            </p>
                        </div>
                    </div>

                    <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            loading={loading}
                            loadingText="Salvando..."
                            className="min-w-36"
                        >
                            {isEditMode
                                ? "Salvar alterações"
                                : "Criar ocorrência"}
                        </Button>
                    </footer>
                </form>
            </div>
        </div>
    );
}

// Função auxiliar de estado inicial
function criarFormInicial(initialData) {
    return {
        titulo: initialData?.titulo || "",
        descricao: initialData?.descricao || "",
        tipo: initialData?.tipo || "FALHA_EQUIPAMENTO",
        equipamentoId: initialData?.equipamentoId ? String(initialData.equipamentoId) : "",
        status: initialData?.status || "ABERTA",
    };
}

export default EventoFormModal;
