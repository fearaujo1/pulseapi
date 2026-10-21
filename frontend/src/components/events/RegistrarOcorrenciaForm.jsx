import { AlertTriangle, ClipboardList, Send } from "lucide-react";
import FormField from "../common/FormField.jsx";
import { inputClass } from "../common/formStyles.js";

function RegistrarOcorrenciaForm({ formData, onChange, onSubmit, equipamentos = [], loadingEquipamentos = false, submitLoading = false }) {
    return (
        <form onSubmit={onSubmit} className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600"><AlertTriangle size={20} /></div>
                <div><h2 className="text-lg font-bold text-slate-900">Nova ocorrência</h2><p className="mt-0.5 text-xs text-slate-500">Informe o problema identificado no chão de fábrica.</p></div>
            </header>

            <div className="p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField label="Título" required><input name="titulo" value={formData.titulo} onChange={onChange} placeholder="Ex.: Falha na impressora" required disabled={submitLoading} className={inputClass} /></FormField>
                    <FormField label="Tipo" required><select name="tipo" value={formData.tipo} onChange={onChange} required disabled={submitLoading} className={inputClass}><option value="FALHA_EQUIPAMENTO">Falha de equipamento</option><option value="PARADA_LINHA">Parada de linha</option><option value="MANUTENCAO">Manutenção</option><option value="OUTRO">Outro</option></select></FormField>
                    <FormField label="Equipamento" required className="md:col-span-2"><select name="equipamentoId" value={formData.equipamentoId} onChange={onChange} required disabled={loadingEquipamentos || submitLoading} className={inputClass}><option value="">{loadingEquipamentos ? "Carregando equipamentos..." : "Selecione um equipamento"}</option>{equipamentos.map((equipamento) => <option key={equipamento.id} value={equipamento.id}>{equipamento.codigo} - {equipamento.nome}</option>)}</select></FormField>
                    <FormField label="Descrição" className="md:col-span-2"><textarea name="descricao" value={formData.descricao} onChange={onChange} placeholder="Descreva o que aconteceu..." disabled={submitLoading} className="min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100" /></FormField>
                </div>

                <div className="mt-5 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3"><ClipboardList size={17} className="mt-0.5 shrink-0 text-blue-600" /><div><p className="text-xs font-semibold text-blue-800">Registro operacional</p><p className="mt-0.5 text-[11px] leading-5 text-blue-700">O registro ficará disponível para acompanhamento da equipe responsável.</p></div></div>

                <button type="submit" disabled={submitLoading || loadingEquipamentos} className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"><Send size={14} />{submitLoading ? "Registrando..." : "Registrar ocorrência"}</button>
            </div>
        </form>
    );
}
export default RegistrarOcorrenciaForm;
