import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import toast from "react-hot-toast";

import { layoutImpressaoService } from "../../services/layoutImpressaoService.js";
import { inputClass } from "../common/formStyles";
import FormField from "../common/FormField";
import CampoLayoutEditor from "./CampoLayoutEditor";

function LayoutImpressaoFormModal({
                                      isOpen,
                                      onClose,
                                      layout,
                                      equipamentos = [],
                                      onSuccess,
                                  }) {
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        nome: "",
        nomeNaImpressora: "",
        equipamentoId: "",
        estrategiaMontagem: "DELIMITADO",
        delimitador: "|",
        ativo: true,
        campos: [],
    });

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (layout) {
            setForm({
                nome: layout.nome || "",
                nomeNaImpressora:
                    layout.nomeNaImpressora || "",
                equipamentoId:
                    layout.equipamentoId || "",
                estrategiaMontagem:
                    layout.estrategiaMontagem ||
                    "DELIMITADO",
                delimitador:
                    layout.delimitador ?? "|",
                ativo:
                    layout.ativo ?? true,
                campos:
                    Array.isArray(layout.campos)
                        ? layout.campos.map(
                            (campo) => ({
                                chave:
                                    campo.chave || "",
                                rotulo:
                                    campo.rotulo || "",
                                ordem:
                                    campo.ordem || 1,
                                tipoDado:
                                    campo.tipoDado ||
                                    "TEXTO",
                                comprimento:
                                    campo.comprimento ??
                                    "",
                                obrigatorio:
                                    campo.obrigatorio ??
                                    true,
                                formato:
                                    campo.formato || "",
                                offset:
                                    campo.offset ?? "",
                                valorPadrao:
                                    campo.valorPadrao ||
                                    "",
                            })
                        )
                        : [],
            });

        } else {
            setForm({
                nome: "",
                nomeNaImpressora: "",
                equipamentoId: "",
                estrategiaMontagem:
                    "DELIMITADO",
                delimitador: "|",
                ativo: true,
                campos: [
                    criarCampoVazio(1),
                ],
            });
        }
    }, [isOpen, layout]);

    if (!isOpen) {
        return null;
    }

    function criarCampoVazio(ordem) {
        return {
            chave: "",
            rotulo: "",
            ordem,
            tipoDado: "TEXTO",
            comprimento: "",
            obrigatorio: true,
            formato: "",
            offset: "",
            valorPadrao: "",
        };
    }

    function handleChange(event) {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    }

    function adicionarCampo() {
        setForm((prev) => ({
            ...prev,
            campos: [
                ...prev.campos,
                criarCampoVazio(
                    prev.campos.length + 1
                ),
            ],
        }));
    }

    function removerCampo(index) {
        setForm((prev) => {
            const novosCampos =
                prev.campos.filter(
                    (_, i) => i !== index
                );

            return {
                ...prev,
                campos: novosCampos.map(
                    (campo, i) => ({
                        ...campo,
                        ordem: i + 1,
                    })
                ),
            };
        });
    }

    function atualizarCampo(
        index,
        nome,
        valor
    ) {
        setForm((prev) => ({
            ...prev,

            campos: prev.campos.map(
                (campo, i) =>
                    i === index
                        ? {
                            ...campo,
                            [nome]: valor,
                        }
                        : campo
            ),
        }));
    }

    function montarPayload() {
        return {
            nome:
                form.nome.trim(),

            nomeNaImpressora:
                form.nomeNaImpressora.trim(),

            equipamentoId:
                Number(form.equipamentoId),

            estrategiaMontagem:
            form.estrategiaMontagem,

            delimitador:
                form.estrategiaMontagem ===
                "DELIMITADO"
                    ? form.delimitador
                    : null,

            ativo:
                Boolean(form.ativo),

            campos:
                form.campos.map(
                    (campo, index) => ({
                        chave:
                            campo.chave
                                .trim()
                                .toUpperCase(),

                        rotulo:
                            campo.rotulo.trim(),

                        ordem:
                            index + 1,

                        tipoDado:
                        campo.tipoDado,

                        comprimento:
                            campo.comprimento
                                ? Number(
                                    campo.comprimento
                                )
                                : null,

                        obrigatorio:
                            Boolean(
                                campo.obrigatorio
                            ),

                        formato:
                            campo.formato
                                ?.trim() ||
                            null,

                        offset:
                            campo.offset !== ""
                                ? Number(
                                    campo.offset
                                )
                                : null,

                        valorPadrao:
                            campo.valorPadrao
                                ?.trim() ||
                            null,
                    })
                ),
        };
    }

    function validar() {
        if (!form.nome.trim()) {
            toast.error(
                "Informe o nome do layout."
            );
            return false;
        }

        if (
            !form.nomeNaImpressora.trim()
        ) {
            toast.error(
                "Informe o nome do layout na impressora."
            );
            return false;
        }

        if (!form.equipamentoId) {
            toast.error(
                "Selecione o equipamento."
            );
            return false;
        }

        if (
            form.estrategiaMontagem ===
            "DELIMITADO" &&
            !form.delimitador
        ) {
            toast.error(
                "Informe o delimitador."
            );
            return false;
        }

        if (
            form.campos.length === 0
        ) {
            toast.error(
                "Adicione pelo menos um campo."
            );
            return false;
        }

        for (
            let i = 0;
            i < form.campos.length;
            i++
        ) {
            const campo =
                form.campos[i];

            if (!campo.chave.trim()) {
                toast.error(
                    `Informe a chave do campo ${
                        i + 1
                    }.`
                );
                return false;
            }

            if (!campo.rotulo.trim()) {
                toast.error(
                    `Informe o rótulo do campo ${
                        i + 1
                    }.`
                );
                return false;
            }

            if (!campo.tipoDado) {
                toast.error(
                    `Informe o tipo do campo ${
                        i + 1
                    }.`
                );
                return false;
            }
        }

        return true;
    }

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        if (!validar()) {
            return;
        }

        const payload =
            montarPayload();

        try {
            setLoading(true);

            if (layout?.id) {
                await layoutImpressaoService
                    .atualizar(
                        layout.id,
                        payload
                    );

                toast.success(
                    "Layout atualizado com sucesso."
                );

            } else {
                await layoutImpressaoService
                    .criar(payload);

                toast.success(
                    "Layout criado com sucesso."
                );
            }

            await onSuccess?.();

        } catch (error) {
            console.error(
                "Erro ao salvar layout:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Não foi possível salvar o layout."
            );

        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-[28px] bg-white shadow-xl"
                onClick={(e) =>
                    e.stopPropagation()
                }
            >
                <div className="sticky top-0 z-10 bg-white p-6 border-b border-slate-200 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-950">
                            {layout
                                ? "Editar Layout"
                                : "Novo Layout"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Configure o layout e os campos enviados à codificadora.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-8"
                >
                    {/* DADOS GERAIS */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            Dados Gerais
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            <FormField
                                label="Nome do Layout"
                            >
                                <input
                                    name="nome"
                                    value={form.nome}
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Ex: Shampoo 1L"
                                    className={inputClass}
                                />
                            </FormField>

                            <FormField
                                label="Nome na Impressora"
                            >
                                <input
                                    name="nomeNaImpressora"
                                    value={
                                        form.nomeNaImpressora
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Ex: SHAMPOO_1L"
                                    className={inputClass}
                                />
                            </FormField>

                            <FormField
                                label="Equipamento"
                            >
                                <select
                                    name="equipamentoId"
                                    value={
                                        form.equipamentoId
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={inputClass}
                                >
                                    <option value="">
                                        Selecione o equipamento
                                    </option>

                                    {equipamentos.map(
                                        (
                                            equipamento
                                        ) => (
                                            <option
                                                key={
                                                    equipamento.id
                                                }
                                                value={
                                                    equipamento.id
                                                }
                                            >
                                                {
                                                    equipamento.nome
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </FormField>

                            <FormField
                                label="Estratégia de Montagem"
                            >
                                <select
                                    name="estrategiaMontagem"
                                    value={
                                        form.estrategiaMontagem
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={inputClass}
                                >
                                    <option value="DELIMITADO">
                                        Delimitador
                                    </option>

                                    <option value="OFFSET_FIXO">
                                        Offset Fixo
                                    </option>
                                </select>
                            </FormField>

                            {form.estrategiaMontagem ===
                                "DELIMITADO" && (
                                    <FormField
                                        label="Delimitador"
                                    >
                                        <input
                                            name="delimitador"
                                            value={
                                                form.delimitador
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            maxLength={5}
                                            placeholder="|"
                                            className={
                                                inputClass
                                            }
                                        />
                                    </FormField>
                                )}

                            <div className="flex items-center pt-6">
                                <label className="inline-flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="ativo"
                                        checked={
                                            form.ativo
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="h-4 w-4"
                                    />

                                    <span className="text-sm font-semibold text-slate-700">
                                        Layout ativo
                                    </span>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* CAMPOS */}
                    <section>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Campos do Layout
                                </h3>

                                <p className="text-sm text-slate-500">
                                    Configure as variáveis que serão enviadas para a impressora.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    adicionarCampo
                                }
                                className="h-10 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm flex items-center justify-center gap-2 transition"
                            >
                                <Plus size={15} />
                                Adicionar Campo
                            </button>
                        </div>

                        <div className="space-y-4">
                            {form.campos.map(
                                (
                                    campo,
                                    index
                                ) => (
                                    <CampoLayoutEditor
                                        key={index}
                                        campo={
                                            campo
                                        }
                                        index={
                                            index
                                        }
                                        estrategia={
                                            form.estrategiaMontagem
                                        }
                                        onChange={
                                            atualizarCampo
                                        }
                                        onRemove={() =>
                                            removerCampo(
                                                index
                                            )
                                        }
                                        podeRemover={
                                            form
                                                .campos
                                                .length >
                                            1
                                        }
                                    />
                                )
                            )}
                        </div>
                    </section>

                    {/* AÇÕES */}
                    <div className="border-t border-slate-200 pt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="h-11 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold shadow-sm"
                        >
                            {loading
                                ? "Salvando..."
                                : layout
                                    ? "Salvar Alterações"
                                    : "Criar Layout"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LayoutImpressaoFormModal;