import { useEffect, useState } from "react";
import {
    ChevronDown,
    FileText,
    Layers3,
    Plus,
    Settings2,
    X,
} from "lucide-react";
import {
    Button,
    IconButton,
} from "../common/Button.jsx";
import toast from "react-hot-toast";

import { layoutImpressaoService } from "../../services/layoutImpressaoService.js";
import CampoLayoutEditor from "./CampoLayoutEditor";

function LayoutImpressaoFormModal({
                                      isOpen,
                                      onClose,
                                      layout,
                                      equipamentos = [],
                                      onSuccess,
                                  }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(criarFormVazio);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setForm(layout ? criarFormEdicao(layout) : criarFormVazio());
    }, [isOpen, layout]);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        function fecharComEscape(event) {
            if (event.key === "Escape" && !loading) {
                onClose();
            }
        }

        document.addEventListener("keydown", fecharComEscape);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", fecharComEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, loading, onClose]);

    if (!isOpen) {
        return null;
    }

    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setForm((anterior) => ({
            ...anterior,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    function adicionarCampo() {
        setForm((anterior) => ({
            ...anterior,
            campos: [
                ...anterior.campos,
                criarCampoVazio(anterior.campos.length + 1),
            ],
        }));
    }

    function removerCampo(index) {
        setForm((anterior) => ({
            ...anterior,
            campos: anterior.campos
                .filter((_, indice) => indice !== index)
                .map((campo, indice) => ({
                    ...campo,
                    ordem: indice + 1,
                })),
        }));
    }

    function atualizarCampo(index, nome, valor) {
        setForm((anterior) => ({
            ...anterior,
            campos: anterior.campos.map((campo, indice) =>
                indice === index
                    ? { ...campo, [nome]: valor }
                    : campo
            ),
        }));
    }

    function validar() {
        if (!form.nome.trim()) {
            toast.error("Informe o nome do layout.");
            return false;
        }

        if (!form.nomeNaImpressora.trim()) {
            toast.error("Informe o nome do layout na impressora.");
            return false;
        }

        if (!form.equipamentoId) {
            toast.error("Selecione o equipamento.");
            return false;
        }

        if (
            form.estrategiaMontagem === "DELIMITADO" &&
            !form.delimitador
        ) {
            toast.error("Informe o delimitador.");
            return false;
        }

        if (form.campos.length === 0) {
            toast.error("Adicione pelo menos um campo.");
            return false;
        }

        for (let indice = 0; indice < form.campos.length; indice += 1) {
            const campo = form.campos[indice];

            if (!campo.chave.trim()) {
                toast.error(`Informe a chave do campo ${indice + 1}.`);
                return false;
            }

            if (!campo.rotulo.trim()) {
                toast.error(`Informe o rótulo do campo ${indice + 1}.`);
                return false;
            }

            if (!campo.tipoDado) {
                toast.error(`Informe o tipo do campo ${indice + 1}.`);
                return false;
            }
        }

        return true;
    }

    function montarPayload() {
        return {
            nome: form.nome.trim(),
            nomeNaImpressora: form.nomeNaImpressora.trim(),
            equipamentoId: Number(form.equipamentoId),
            estrategiaMontagem: form.estrategiaMontagem,
            delimitador:
                form.estrategiaMontagem === "DELIMITADO"
                    ? form.delimitador
                    : null,
            ativo: Boolean(form.ativo),
            campos: form.campos.map((campo, index) => ({
                chave: campo.chave.trim().toUpperCase(),
                rotulo: campo.rotulo.trim(),
                ordem: index + 1,
                tipoDado: campo.tipoDado,
                comprimento: campo.comprimento
                    ? Number(campo.comprimento)
                    : null,
                obrigatorio: Boolean(campo.obrigatorio),
                formato: campo.formato?.trim() || null,
                offset:
                    campo.offset !== "" ? Number(campo.offset) : null,
                valorPadrao: campo.valorPadrao?.trim() || null,
            })),
        };
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!validar()) {
            return;
        }

        try {
            setLoading(true);
            const payload = montarPayload();

            if (layout?.id) {
                await layoutImpressaoService.atualizar(layout.id, payload);
                toast.success("Layout atualizado com sucesso.");
            } else {
                await layoutImpressaoService.criar(payload);
                toast.success("Layout criado com sucesso.");
            }

            await onSuccess?.();
        } catch (error) {
            console.error("Erro ao salvar layout:", error);
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-5 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !loading) {
                    onClose();
                }
            }}
        >
            <div className="flex max-h-[calc(100vh-2.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
                <header className="flex shrink-0 items-start justify-between border-b border-slate-100 px-6 py-5 md:px-7">
                    <div className="flex items-start gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Layers3 size={20} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                {layout ? "Editar layout" : "Novo layout"}
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Configure a identificação, montagem e os campos enviados à impressora.
                            </p>
                        </div>
                    </div>

                    <IconButton
                        icon={X}
                        onClick={onClose}
                        disabled={loading}
                        title="Fechar modal"
                    />
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5 md:px-7">
                        <FormSection
                            icon={Settings2}
                            title="Configuração geral"
                            description="Identifique o layout e defina como o conteúdo será montado."
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Field
                                    label="Nome do layout"
                                    name="nome"
                                    value={form.nome}
                                    onChange={handleChange}
                                    placeholder="Ex.: Teste FIFO"
                                    required
                                />

                                <Field
                                    label="Nome na impressora"
                                    name="nomeNaImpressora"
                                    value={form.nomeNaImpressora}
                                    onChange={handleChange}
                                    placeholder="Ex.: TESTE_FIFO"
                                    required
                                />

                                <SelectField
                                    label="Equipamento"
                                    name="equipamentoId"
                                    value={form.equipamentoId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Selecione o equipamento</option>
                                    {equipamentos.map((equipamento) => (
                                        <option
                                            key={equipamento.id}
                                            value={equipamento.id}
                                        >
                                            {equipamento.nome}
                                        </option>
                                    ))}
                                </SelectField>

                                <SelectField
                                    label="Estratégia de montagem"
                                    name="estrategiaMontagem"
                                    value={form.estrategiaMontagem}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="DELIMITADO">Delimitado</option>
                                    <option value="OFFSET_FIXO">Offset fixo</option>
                                </SelectField>

                                {form.estrategiaMontagem === "DELIMITADO" && (
                                    <Field
                                        label="Delimitador"
                                        name="delimitador"
                                        value={form.delimitador}
                                        onChange={handleChange}
                                        maxLength={5}
                                        placeholder="|"
                                        required
                                    />
                                )}

                                <div className="flex items-end">
                                    <label className="flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3">
                                        <span>
                                            <span className="block text-xs font-semibold text-slate-700">
                                                Layout ativo
                                            </span>
                                            <span className="block text-[10px] text-slate-500">
                                                Disponível para novas produções
                                            </span>
                                        </span>

                                        <input
                                            type="checkbox"
                                            name="ativo"
                                            checked={form.ativo}
                                            onChange={handleChange}
                                            className="h-4 w-4 accent-blue-600"
                                        />
                                    </label>
                                </div>
                            </div>
                        </FormSection>

                        <section className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                        <FileText size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900">
                                            Campos do layout
                                        </h3>
                                        <p className="mt-0.5 text-[11px] text-slate-500">
                                            A ordem abaixo será usada na montagem do conteúdo.
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    variant="softPrimary"
                                    size="small"
                                    icon={Plus}
                                    onClick={adicionarCampo}
                                >
                                    Adicionar campo
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {form.campos.map((campo, index) => (
                                    <CampoLayoutEditor
                                        key={`${index}-${campo.ordem}`}
                                        campo={campo}
                                        index={index}
                                        estrategia={form.estrategiaMontagem}
                                        onChange={atualizarCampo}
                                        onRemove={() => removerCampo(index)}
                                        podeRemover={form.campos.length > 1}
                                    />
                                ))}
                            </div>
                        </section>
                    </div>

                    <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 md:px-7">
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
                            className="min-w-32"
                        >
                            {layout
                                ? "Salvar alterações"
                                : "Criar layout"}
                        </Button>
                    </footer>
                </form>
            </div>
        </div>
    );
}

function FormSection({ icon: Icon, title, description, children }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Icon size={16} />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                        {title}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                        {description}
                    </p>
                </div>
            </div>
            {children}
        </section>
    );
}

function Field({ label, required = false, ...inputProps }) {
    return (
        <label className="block min-w-0">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </span>
            <input
                {...inputProps}
                required={required}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
            />
        </label>
    );
}

function SelectField({ label, required = false, children, ...selectProps }) {
    return (
        <label className="block min-w-0">
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </span>
            <div className="relative">
                <select
                    {...selectProps}
                    required={required}
                    className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 pr-9 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                >
                    {children}
                </select>
                <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
            </div>
        </label>
    );
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

function criarFormVazio() {
    return {
        nome: "",
        nomeNaImpressora: "",
        equipamentoId: "",
        estrategiaMontagem: "DELIMITADO",
        delimitador: "|",
        ativo: true,
        campos: [criarCampoVazio(1)],
    };
}

function criarFormEdicao(layout) {
    return {
        nome: layout.nome || "",
        nomeNaImpressora: layout.nomeNaImpressora || "",
        equipamentoId: layout.equipamentoId || "",
        estrategiaMontagem: layout.estrategiaMontagem || "DELIMITADO",
        delimitador: layout.delimitador ?? "|",
        ativo: layout.ativo ?? true,
        campos: Array.isArray(layout.campos)
            ? layout.campos.map((campo, index) => ({
                chave: campo.chave || "",
                rotulo: campo.rotulo || "",
                ordem: campo.ordem || index + 1,
                tipoDado: campo.tipoDado || "TEXTO",
                comprimento: campo.comprimento ?? "",
                obrigatorio: campo.obrigatorio ?? true,
                formato: campo.formato || "",
                offset: campo.offset ?? "",
                valorPadrao: campo.valorPadrao || "",
            }))
            : [criarCampoVazio(1)],
    };
}

export default LayoutImpressaoFormModal;
