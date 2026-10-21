import { BarChart3, Download } from "lucide-react";

import FormField from "../common/FormField.jsx";
import { inputClass } from "../common/formStyles.js";

const TIPOS_RELATORIO = [
    { value: "GERAL", label: "Relatório geral" },
    { value: "IMPRESSOES", label: "Impressões" },
    { value: "OCORRENCIAS", label: "Ocorrências" },
    { value: "EQUIPAMENTOS", label: "Equipamentos" },
];

function RelatorioFilters({
                              filtros,
                              equipamentos = [],
                              layouts = [],
                              hoje,
                              loading = false,
                              exportLoading = false,
                              onChange,
                              onGerar,
                              onExportar,
                          }) {
    const carregando = loading || exportLoading;
    const mostraPeriodo = filtros.tipoRelatorio !== "EQUIPAMENTOS";
    const mostraEquipamento = ["IMPRESSOES", "OCORRENCIAS"].includes(
        filtros.tipoRelatorio
    );

    return (
        <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <FormField label="Tipo de relatório">
                    <select
                        value={filtros.tipoRelatorio}
                        onChange={(event) =>
                            onChange("tipoRelatorio", event.target.value)
                        }
                        disabled={carregando}
                        className={inputClass}
                    >
                        {TIPOS_RELATORIO.map((tipo) => (
                            <option key={tipo.value} value={tipo.value}>
                                {tipo.label}
                            </option>
                        ))}
                    </select>
                </FormField>

                {mostraPeriodo && (
                    <>
                        <FormField label="Data inicial">
                            <input
                                type="date"
                                value={filtros.dataInicial}
                                max={filtros.dataFinal || undefined}
                                onChange={(event) =>
                                    onChange("dataInicial", event.target.value)
                                }
                                disabled={carregando}
                                className={inputClass}
                            />
                        </FormField>

                        <FormField label="Data final">
                            <input
                                type="date"
                                value={filtros.dataFinal}
                                min={filtros.dataInicial || undefined}
                                max={hoje}
                                onChange={(event) =>
                                    onChange("dataFinal", event.target.value)
                                }
                                disabled={carregando}
                                className={inputClass}
                            />
                        </FormField>
                    </>
                )}

                {mostraEquipamento && (
                    <FormField label="Equipamento">
                        <select
                            value={filtros.equipamentoId}
                            onChange={(event) =>
                                onChange("equipamentoId", event.target.value)
                            }
                            disabled={carregando}
                            className={inputClass}
                        >
                            <option value="">Todos os equipamentos</option>
                            {equipamentos.map((equipamento) => (
                                <option key={equipamento.id} value={equipamento.id}>
                                    {equipamento.nome}
                                </option>
                            ))}
                        </select>
                    </FormField>
                )}

                {filtros.tipoRelatorio === "IMPRESSOES" && (
                    <FiltrosImpressoes
                        filtros={filtros}
                        layouts={layouts}
                        carregando={carregando}
                        onChange={onChange}
                    />
                )}

                {filtros.tipoRelatorio === "OCORRENCIAS" && (
                    <FiltrosOcorrencias
                        filtros={filtros}
                        carregando={carregando}
                        onChange={onChange}
                    />
                )}
            </div>

            <div className="mt-5 flex flex-col justify-end gap-2 border-t border-slate-100 pt-5 sm:flex-row">
                <button
                    type="button"
                    onClick={onExportar}
                    disabled={carregando}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Download size={15} />
                    {exportLoading ? "Exportando..." : "Exportar PDF"}
                </button>

                <button
                    type="button"
                    onClick={onGerar}
                    disabled={carregando}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <BarChart3 size={15} />
                    {loading ? "Gerando..." : "Gerar relatório"}
                </button>
            </div>
        </>
    );
}

function FiltrosImpressoes({ filtros, layouts, carregando, onChange }) {
    return (
        <>
            <FormField label="Status">
                <select
                    value={filtros.status}
                    onChange={(event) => onChange("status", event.target.value)}
                    disabled={carregando}
                    className={inputClass}
                >
                    <option value="">Todos os status</option>
                    <option value="PENDENTE">Pendente</option>
                    <option value="ENVIANDO">Enviando</option>
                    <option value="ENVIADO_FIFO">Enviado ao FIFO</option>
                    <option value="PRONTO_IMPRESSAO">Pronto para impressão</option>
                    <option value="IMPRESSO">Impresso</option>
                    <option value="ERRO">Erro</option>
                    <option value="CANCELADO">Cancelado</option>
                </select>
            </FormField>

            <FormField label="Layout">
                <select
                    value={filtros.layoutId}
                    onChange={(event) => onChange("layoutId", event.target.value)}
                    disabled={carregando}
                    className={inputClass}
                >
                    <option value="">Todos os layouts</option>
                    {layouts.map((layout) => (
                        <option key={layout.id} value={layout.id}>
                            {layout.nome}
                            {layout.nomeNaImpressora
                                ? ` - ${layout.nomeNaImpressora}`
                                : ""}
                        </option>
                    ))}
                </select>

                {filtros.equipamentoId && layouts.length === 0 && (
                    <span className="mt-1 block text-[10px] text-amber-600">
                        O equipamento não possui layouts ativos.
                    </span>
                )}
            </FormField>
        </>
    );
}

function FiltrosOcorrencias({ filtros, carregando, onChange }) {
    return (
        <>
            <FormField label="Tipo">
                <select
                    value={filtros.tipoOcorrencia}
                    onChange={(event) =>
                        onChange("tipoOcorrencia", event.target.value)
                    }
                    disabled={carregando}
                    className={inputClass}
                >
                    <option value="">Todos os tipos</option>
                    <option value="FALHA_EQUIPAMENTO">Falha de equipamento</option>
                    <option value="PARADA_LINHA">Parada de linha</option>
                    <option value="MANUTENCAO">Manutenção</option>
                    <option value="OUTRO">Outro</option>
                </select>
            </FormField>

            <FormField label="Status">
                <select
                    value={filtros.status}
                    onChange={(event) => onChange("status", event.target.value)}
                    disabled={carregando}
                    className={inputClass}
                >
                    <option value="">Todos os status</option>
                    <option value="ABERTA">Aberta</option>
                    <option value="EM_ANALISE">Em análise</option>
                    <option value="EM_ATENDIMENTO">Em atendimento</option>
                    <option value="RESOLVIDA">Resolvida</option>
                    <option value="CANCELADA">Cancelada</option>
                </select>
            </FormField>
        </>
    );
}

export default RelatorioFilters;
