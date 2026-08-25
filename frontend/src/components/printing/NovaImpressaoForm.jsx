import { PlusCircle } from "lucide-react";

import FormField from "../common/FormField";
import { inputClass } from "../common/formStyles";
import CampoImpressaoDinamico from "./CampoImpressaoDinamico";

function NovaImpressaoForm({
                               equipamentos = [],
                               layouts = [],
                               equipamentoId,
                               onEquipamentoChange,
                               layoutId,
                               onLayoutChange,
                               layoutSelecionado,
                               valores,
                               onValorChange,
                               submitLoading = false,
                               onCancel,
                           }) {
    const camposOrdenados = [
        ...(layoutSelecionado?.campos || []),
    ].sort((a, b) => a.ordem - b.ordem);

    return (
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-950">
                    Configuração da Impressão
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Selecione o equipamento, o layout e preencha os campos
                </p>
            </div>

            <div className="space-y-5">
                <FormField label="Equipamento" required>
                    <select
                        value={equipamentoId}
                        onChange={(event) =>
                            onEquipamentoChange(event.target.value)
                        }
                        className={inputClass}
                    >
                        <option value="">
                            Selecione o equipamento
                        </option>

                        {equipamentos.map((equipamento) => (
                            <option
                                key={equipamento.id}
                                value={equipamento.id}
                            >
                                {equipamento.nome}
                            </option>
                        ))}
                    </select>
                </FormField>

                <FormField label="Layout" required>
                    <select
                        value={layoutId}
                        onChange={(event) =>
                            onLayoutChange(event.target.value)
                        }
                        disabled={!equipamentoId}
                        className={inputClass}
                    >
                        <option value="">
                            Selecione o layout
                        </option>

                        {layouts.map((layout) => (
                            <option
                                key={layout.id}
                                value={layout.id}
                            >
                                {layout.nome}
                            </option>
                        ))}
                    </select>
                </FormField>

                {equipamentoId && layouts.length === 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        Este equipamento não possui layouts ativos.
                    </div>
                )}
            </div>

            {layoutSelecionado && (
                <>
                    <div className="my-6 border-t border-slate-200" />

                    <div className="mb-5">
                        <h3 className="text-lg font-bold text-slate-950">
                            Dados do Layout
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            {layoutSelecionado.nomeNaImpressora}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                        {camposOrdenados.map((campo) => (
                            <CampoImpressaoDinamico
                                key={campo.id ?? campo.chave}
                                campo={campo}
                                value={valores[campo.chave] || ""}
                                onChange={onValorChange}
                            />
                        ))}
                    </div>
                </>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitLoading}
                    className="h-11 rounded-xl border border-slate-200 px-5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={submitLoading || !layoutSelecionado}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                    <PlusCircle size={17} />

                    {submitLoading
                        ? "Adicionando..."
                        : "Adicionar à Fila"}
                </button>
            </div>
        </section>
    );
}

export default NovaImpressaoForm;