import { Trash2 } from "lucide-react";

import FormField from "../common/FormField";
import { inputClass } from "../common/formStyles";

function CampoLayoutEditor({
                               campo,
                               index,
                               estrategia,
                               onChange,
                               onRemove,
                               podeRemover,
                           }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-bold text-slate-800">
                        Campo {index + 1}
                    </p>

                    <p className="text-xs text-slate-400">
                        Ordem {index + 1}
                    </p>
                </div>

                {podeRemover && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="rounded-xl border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                        title="Remover campo"
                        aria-label={`Remover campo ${index + 1}`}
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FormField label="Chave" required>
                    <input
                        value={campo.chave}
                        onChange={(event) =>
                            onChange(
                                index,
                                "chave",
                                event.target.value
                            )
                        }
                        placeholder="FAB"
                        className={inputClass}
                    />
                </FormField>

                <FormField label="Rótulo" required>
                    <input
                        value={campo.rotulo}
                        onChange={(event) =>
                            onChange(
                                index,
                                "rotulo",
                                event.target.value
                            )
                        }
                        placeholder="Fabricação"
                        className={inputClass}
                    />
                </FormField>

                <FormField label="Tipo">
                    <select
                        value={campo.tipoDado}
                        onChange={(event) =>
                            onChange(
                                index,
                                "tipoDado",
                                event.target.value
                            )
                        }
                        className={inputClass}
                    >
                        <option value="TEXTO">Texto</option>
                        <option value="DATA">Data</option>
                        <option value="NUMERO">Número</option>
                        <option value="HORA">Hora</option>
                    </select>
                </FormField>

                <FormField label="Comprimento">
                    <input
                        type="number"
                        min="1"
                        value={campo.comprimento}
                        onChange={(event) =>
                            onChange(
                                index,
                                "comprimento",
                                event.target.value
                            )
                        }
                        placeholder="8"
                        className={inputClass}
                    />
                </FormField>

                {["DATA", "HORA"].includes(campo.tipoDado) && (
                    <FormField label="Formato">
                        <input
                            value={campo.formato}
                            onChange={(event) =>
                                onChange(
                                    index,
                                    "formato",
                                    event.target.value
                                )
                            }
                            placeholder={
                                campo.tipoDado === "DATA"
                                    ? "dd/MM/yyyy"
                                    : "HH:mm:ss"
                            }
                            className={inputClass}
                        />
                    </FormField>
                )}

                {estrategia === "OFFSET_FIXO" && (
                    <FormField label="Offset">
                        <input
                            type="number"
                            min="0"
                            value={campo.offset}
                            onChange={(event) =>
                                onChange(
                                    index,
                                    "offset",
                                    event.target.value
                                )
                            }
                            placeholder="0"
                            className={inputClass}
                        />
                    </FormField>
                )}

                <FormField label="Valor padrão">
                    <input
                        value={campo.valorPadrao}
                        onChange={(event) =>
                            onChange(
                                index,
                                "valorPadrao",
                                event.target.value
                            )
                        }
                        placeholder="Opcional"
                        className={inputClass}
                    />
                </FormField>

                <div className="flex items-center pt-6">
                    <label className="inline-flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            checked={campo.obrigatorio}
                            onChange={(event) =>
                                onChange(
                                    index,
                                    "obrigatorio",
                                    event.target.checked
                                )
                            }
                            className="h-4 w-4"
                        />

                        <span className="text-sm font-semibold text-slate-700">
                            Obrigatório
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
}

export default CampoLayoutEditor;