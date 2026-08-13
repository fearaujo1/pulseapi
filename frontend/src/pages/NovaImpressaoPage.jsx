import { useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    Monitor,
    PlusCircle,
    RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Topbar from "../components/layout/Topbar";
import { equipamentosService } from "../services/equipamentosService";
import { layoutImpressaoService } from "../services/layoutImpressaoService";
import { filaImpressaoService } from "../services/filaImpressaoService";

function NovaImpressaoPage() {
    const navigate = useNavigate();

    const [equipamentos, setEquipamentos] = useState([]);
    const [layouts, setLayouts] = useState([]);

    const [equipamentoId, setEquipamentoId] = useState("");
    const [layoutId, setLayoutId] = useState("");

    const [valores, setValores] = useState({});

    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [preview, setPreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    useEffect(() => {
        async function carregarInicial() {
            try {
                setLoading(true);

                const equipamentosData =
                    await equipamentosService.listar();

                setEquipamentos(
                    Array.isArray(equipamentosData)
                        ? equipamentosData
                        : []
                );

            } catch (error) {
                console.error(error);

                toast.error(
                    "Erro ao carregar equipamentos."
                );

            } finally {
                setLoading(false);
            }
        }

        carregarInicial();
    }, []);

    useEffect(() => {
        async function carregarLayouts() {
            if (!equipamentoId) {
                setLayouts([]);
                setLayoutId("");
                setValores({});
                setPreview(null);
                return;
            }

            try {
                const data =
                    await layoutImpressaoService
                        .listarPorEquipamento(equipamentoId);

                const ativos = Array.isArray(data)
                    ? data.filter((layout) => layout.ativo)
                    : [];

                setLayouts(ativos);
                setLayoutId("");
                setValores({});
                setPreview(null);

            } catch (error) {
                console.error(error);

                toast.error(
                    "Erro ao carregar layouts do equipamento."
                );
            }
        }

        carregarLayouts();

    }, [equipamentoId]);

    const layoutSelecionado = useMemo(() => {
        return layouts.find(
            (layout) =>
                String(layout.id) === String(layoutId)
        );
    }, [layouts, layoutId]);

    const equipamentoSelecionado = useMemo(() => {
        return equipamentos.find(
            (equipamento) =>
                String(equipamento.id) === String(equipamentoId)
        );
    }, [equipamentos, equipamentoId]);

    useEffect(() => {
        if (!layoutSelecionado) {
            setValores({});
            setPreview(null);
            return;
        }

        const valoresIniciais = {};

        [...(layoutSelecionado.campos || [])]
            .sort((a, b) => a.ordem - b.ordem)
            .forEach((campo) => {
                valoresIniciais[campo.chave] =
                    campo.valorPadrao || "";
            });

        setValores(valoresIniciais);
        setPreview(null);

    }, [layoutSelecionado]);

    function atualizarValor(chave, valor) {
        setValores((prev) => ({
            ...prev,
            [chave]: valor,
        }));

        /*
         * A prévia anterior deixa de ser válida
         * quando qualquer campo é alterado.
         */
        setPreview(null);
    }

    function validar() {
        if (!equipamentoId) {
            toast.error(
                "Selecione um equipamento."
            );
            return false;
        }

        if (!layoutId) {
            toast.error(
                "Selecione um layout."
            );
            return false;
        }

        for (const campo of layoutSelecionado?.campos || []) {
            const valor = valores[campo.chave];

            if (
                campo.obrigatorio &&
                (!valor || String(valor).trim() === "")
            ) {
                toast.error(
                    `Preencha o campo ${campo.rotulo}.`
                );

                return false;
            }

            /*
             * Comprimento bruto é verificado apenas em TEXTO.
             *
             * DATA/HORA são formatados pelo backend antes
             * da validação final do comprimento.
             */
            if (
                campo.tipoDado === "TEXTO" &&
                campo.comprimento &&
                valor &&
                String(valor).length > campo.comprimento
            ) {
                toast.error(
                    `O campo ${campo.rotulo} deve possuir no máximo ${campo.comprimento} caracteres.`
                );

                return false;
            }
        }

        return true;
    }

    async function gerarPreview() {
        if (!validar()) {
            return;
        }

        try {
            setPreviewLoading(true);

            const data =
                await layoutImpressaoService.montarPayload({
                    layoutId: Number(layoutId),
                    valores,
                });

            setPreview(data);

        } catch (error) {
            console.error(
                "Erro ao gerar prévia:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Não foi possível gerar a prévia."
            );

        } finally {
            setPreviewLoading(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!validar()) {
            return;
        }

        try {
            setSubmitLoading(true);

            await filaImpressaoService.adicionar({
                layoutId: Number(layoutId),
                valores,
            });

            toast.success(
                "Item adicionado à fila de impressão."
            );

            navigate("/fila-impressao");

        } catch (error) {
            console.error(
                "Erro ao adicionar impressão:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Não foi possível adicionar o item à fila."
            );

        } finally {
            setSubmitLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7fb]">
                <Topbar />

                <main className="p-4 md:p-6">
                    <div className="max-w-7xl mx-auto">
                        <p className="text-slate-500">
                            Carregando...
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="p-4 md:p-6">
                <div className="max-w-7xl mx-auto">

                    {/* CABEÇALHO */}
                    <section className="mb-6">
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/fila-impressao")
                            }
                            className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
                        >
                            <ArrowLeft size={17} />
                            Voltar para fila
                        </button>

                        <h1 className="text-3xl md:text-4xl font-bold text-slate-950">
                            Nova Impressão
                        </h1>

                        <p className="mt-1 text-[16px] text-slate-600">
                            Configure os dados e confira a mensagem antes de enviá-la à fila
                        </p>
                    </section>

                    <form onSubmit={handleSubmit}>

                        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.05fr] gap-6 items-start">

                            {/* ============================= */}
                            {/* COLUNA ESQUERDA - FORMULÁRIO */}
                            {/* ============================= */}

                            <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6">

                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-slate-950">
                                        Configuração da Impressão
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Selecione o equipamento, o layout e preencha os campos
                                    </p>
                                </div>

                                <div className="space-y-5">

                                    <FormField label="Equipamento">
                                        <select
                                            value={equipamentoId}
                                            onChange={(e) =>
                                                setEquipamentoId(
                                                    e.target.value
                                                )
                                            }
                                            className={inputClass}
                                        >
                                            <option value="">
                                                Selecione o equipamento
                                            </option>

                                            {equipamentos.map(
                                                (equipamento) => (
                                                    <option
                                                        key={equipamento.id}
                                                        value={equipamento.id}
                                                    >
                                                        {equipamento.nome}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </FormField>

                                    <FormField label="Layout">
                                        <select
                                            value={layoutId}
                                            onChange={(e) =>
                                                setLayoutId(
                                                    e.target.value
                                                )
                                            }
                                            disabled={!equipamentoId}
                                            className={inputClass}
                                        >
                                            <option value="">
                                                Selecione o layout
                                            </option>

                                            {layouts.map(
                                                (layout) => (
                                                    <option
                                                        key={layout.id}
                                                        value={layout.id}
                                                    >
                                                        {layout.nome}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </FormField>

                                    {equipamentoId &&
                                        layouts.length === 0 && (
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

                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-5">
                                            {[...(layoutSelecionado.campos || [])]
                                                .sort(
                                                    (a, b) =>
                                                        a.ordem - b.ordem
                                                )
                                                .map((campo) => (
                                                    <CampoDinamico
                                                        key={
                                                            campo.id ??
                                                            campo.chave
                                                        }
                                                        campo={campo}
                                                        value={
                                                            valores[
                                                                campo.chave
                                                                ] || ""
                                                        }
                                                        onChange={
                                                            atualizarValor
                                                        }
                                                    />
                                                ))}
                                        </div>
                                    </>
                                )}

                                <div className="mt-8 border-t border-slate-200 pt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                "/fila-impressao"
                                            )
                                        }
                                        className="h-11 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            submitLoading ||
                                            !layoutSelecionado
                                        }
                                        className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition"
                                    >
                                        <PlusCircle size={17} />

                                        {submitLoading
                                            ? "Adicionando..."
                                            : "Adicionar à Fila"}
                                    </button>
                                </div>
                            </section>

                            {/* =========================== */}
                            {/* COLUNA DIREITA - PRÉVIA AX */}
                            {/* =========================== */}

                            <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 xl:sticky xl:top-24">

                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">

                                    <div className="flex items-start gap-3">
                                        <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Monitor size={22} />
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-bold text-slate-950">
                                                Prévia da Impressão
                                            </h2>

                                            <p className="mt-1 text-sm text-slate-500">
                                                Visualização aproximada da mensagem na Ax150i
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={gerarPreview}
                                        disabled={
                                            !layoutSelecionado ||
                                            previewLoading
                                        }
                                        className="h-10 px-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-blue-700 font-semibold text-sm flex items-center justify-center gap-2 transition"
                                    >
                                        <RefreshCw
                                            size={15}
                                            className={
                                                previewLoading
                                                    ? "animate-spin"
                                                    : ""
                                            }
                                        />

                                        {previewLoading
                                            ? "Gerando..."
                                            : "Atualizar Prévia"}
                                    </button>
                                </div>

                                {/* MOLDURA DA CODIFICADORA */}
                                <div className="rounded-[22px] border border-slate-300 bg-slate-200 p-3 shadow-inner">

                                    {/* BARRA SUPERIOR */}
                                    <div className="h-12 rounded-t-xl bg-slate-700 flex items-center justify-between px-4">
                                        <span className="text-xs font-semibold text-slate-200">
                                            AX SERIES
                                        </span>

                                        <span
                                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                                preview
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-slate-600 text-slate-200"
                                            }`}
                                        >
                                            <span
                                                className={`h-2 w-2 rounded-full ${
                                                    preview
                                                        ? "bg-green-500"
                                                        : "bg-slate-400"
                                                }`}
                                            />

                                            {preview
                                                ? "PREVIEW"
                                                : "AGUARDANDO"}
                                        </span>
                                    </div>

                                    {/* VISOR */}
                                    <div className="min-h-[330px] bg-[#f7f7f2] border-x border-slate-300 flex items-center justify-center px-8 py-10">

                                        {!layoutSelecionado ? (
                                            <PreviewEmpty>
                                                Selecione um equipamento e um layout para iniciar.
                                            </PreviewEmpty>

                                        ) : !preview ? (
                                            <PreviewEmpty>
                                                Preencha os campos e clique em
                                                <strong className="block mt-1 text-slate-500">
                                                    Atualizar Prévia
                                                </strong>
                                            </PreviewEmpty>

                                        ) : (
                                            <div className="w-full">
                                                <div className="font-mono text-[25px] md:text-[30px] xl:text-[26px] 2xl:text-[30px] leading-[1.5] font-bold tracking-wide text-black break-words">

                                                    {Object.entries(
                                                        preview.valoresFormatados ||
                                                        {}
                                                    ).map(
                                                        ([chave, valor]) => (
                                                            <div
                                                                key={chave}
                                                            >
                                                                {chave}:{" "}
                                                                {valor}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* BARRA INFERIOR */}
                                    <div className="min-h-14 rounded-b-xl bg-white border border-slate-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3">

                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Layout Online
                                            </p>

                                            <p className="text-sm font-bold text-slate-700">
                                                {layoutSelecionado
                                                        ?.nomeNaImpressora ||
                                                    "-"}
                                            </p>
                                        </div>

                                        <div className="sm:text-right">
                                            <p className="text-xs text-slate-400">
                                                Equipamento
                                            </p>

                                            <p className="text-sm font-semibold text-slate-600">
                                                {equipamentoSelecionado
                                                    ?.nome || "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* DETALHES DO PAYLOAD */}
                                <div className="mt-5">

                                    {preview ? (
                                        <div className="space-y-4">

                                            <div className="grid grid-cols-2 gap-4">
                                                <PreviewField
                                                    label="Estratégia"
                                                    value={formatarEstrategia(
                                                        preview.estrategia
                                                    )}
                                                />

                                                <PreviewField
                                                    label="Tamanho"
                                                    value={`${preview.tamanhoBytes} bytes`}
                                                />
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                                                    Payload Final
                                                </p>

                                                <div className="rounded-xl bg-slate-950 p-4 overflow-x-auto">
                                                    <code className="text-sm text-slate-100 whitespace-nowrap">
                                                        {preview.payload}
                                                    </code>
                                                </div>
                                            </div>

                                        </div>

                                    ) : (
                                        <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-400">
                                            O payload final aparecerá aqui após gerar a prévia.
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

function CampoDinamico({
                           campo,
                           value,
                           onChange,
                       }) {
    let type = "text";

    if (campo.tipoDado === "DATA") {
        type = "date";
    }

    if (campo.tipoDado === "HORA") {
        type = "time";
    }

    if (campo.tipoDado === "NUMERO") {
        type = "number";
    }

    return (
        <FormField
            label={`${campo.rotulo}${
                campo.obrigatorio
                    ? " *"
                    : ""
            }`}
        >
            <input
                type={type}
                value={value}
                onChange={(e) =>
                    onChange(
                        campo.chave,
                        e.target.value
                    )
                }
                maxLength={
                    campo.tipoDado === "TEXTO"
                        ? campo.comprimento ||
                        undefined
                        : undefined
                }
                placeholder={
                    campo.valorPadrao ||
                    campo.chave
                }
                className={inputClass}
            />

            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-400">
                <span>
                    Chave: {campo.chave}
                </span>

                {campo.formato && (
                    <span>
                        • Formato: {campo.formato}
                    </span>
                )}

                {campo.comprimento && (
                    <span>
                        • Máx.: {campo.comprimento}
                    </span>
                )}
            </div>
        </FormField>
    );
}

function FormField({
                       label,
                       children,
                   }) {
    return (
        <label className="block">
            <span className="block mb-2 text-sm font-semibold text-slate-700">
                {label}
            </span>

            {children}
        </label>
    );
}

function PreviewField({
                          label,
                          value,
                      }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
                {value ?? "-"}
            </p>
        </div>
    );
}

function PreviewEmpty({
                          children,
                      }) {
    return (
        <div className="text-center text-sm text-slate-400">
            <Monitor
                size={42}
                className="mx-auto mb-3 text-slate-300"
            />

            {children}
        </div>
    );
}

function formatarEstrategia(estrategia) {
    const labels = {
        DELIMITADO: "Delimitador",
        OFFSET_FIXO: "Offset Fixo",
    };

    return (
        labels[estrategia] ||
        estrategia ||
        "-"
    );
}

const inputClass =
    "w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400";

export default NovaImpressaoPage;