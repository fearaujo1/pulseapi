import {
    AlertTriangle,
    ClipboardList,
    Send,
} from "lucide-react";

import FormField from "../common/FormField";
import { inputClass } from "../common/formStyles";

function RegistrarOcorrenciaForm({
                                     formData,
                                     onChange,
                                     onSubmit,
                                     equipamentos = [],
                                     loadingEquipamentos = false,
                                     submitLoading = false,
                                 }) {
    return (
        <form
            onSubmit={onSubmit}
            className="w-full max-w-5xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm"
        >
            <div className="mb-10 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <AlertTriangle size={30} />
                </div>

                <h2 className="text-[28px] font-bold text-slate-950">
                    Nova Ocorrência
                </h2>

                <p className="mt-1 text-[14.5px] text-slate-500">
                    Preencha os dados da ocorrência identificada no chão de
                    fábrica
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField label="Título" required>
                    <input
                        name="titulo"
                        value={formData.titulo}
                        onChange={onChange}
                        placeholder="Ex.: Falha na impressora"
                        required
                        className={inputClass}
                    />
                </FormField>

                <FormField label="Tipo" required>
                    <select
                        name="tipo"
                        value={formData.tipo}
                        onChange={onChange}
                        required
                        className={inputClass}
                    >
                        <option value="FALHA_EQUIPAMENTO">
                            Falha de equipamento
                        </option>

                        <option value="PARADA_LINHA">
                            Parada de linha
                        </option>

                        <option value="MANUTENCAO">
                            Manutenção
                        </option>

                        <option value="OUTRO">
                            Outro
                        </option>
                    </select>
                </FormField>

                <FormField label="Equipamento" required>
                    <select
                        name="equipamentoId"
                        value={formData.equipamentoId}
                        onChange={onChange}
                        required
                        disabled={loadingEquipamentos}
                        className={inputClass}
                    >
                        <option value="">
                            {loadingEquipamentos
                                ? "Carregando equipamentos..."
                                : "Selecione um equipamento"}
                        </option>

                        {equipamentos.map((equipamento) => (
                            <option
                                key={equipamento.id}
                                value={equipamento.id}
                            >
                                {equipamento.codigo} - {equipamento.nome}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField label="Descrição">
                    <textarea
                        name="descricao"
                        value={formData.descricao}
                        onChange={onChange}
                        placeholder="Descreva o que aconteceu..."
                        className="min-h-[110px] w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </FormField>
            </div>

            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex gap-3">
                    <ClipboardList
                        className="mt-0.5 shrink-0 text-blue-600"
                        size={20}
                    />

                    <div>
                        <p className="text-[14.5px] font-semibold text-blue-700">
                            Registro operacional
                        </p>

                        <p className="mt-1 text-[12.5px] text-blue-700/90">
                            As informações registradas ficarão disponíveis para
                            acompanhamento da equipe responsável.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <button
                    type="submit"
                    disabled={submitLoading || loadingEquipamentos}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    <Send size={16} />

                    {submitLoading
                        ? "Registrando..."
                        : "Registrar Ocorrência"}
                </button>
            </div>
        </form>
    );
}

export default RegistrarOcorrenciaForm;