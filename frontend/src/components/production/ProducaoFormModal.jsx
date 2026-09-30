import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Factory,
    Loader2,
    X,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    equipamentosService,
} from "../../services/equipamentosService.js";

import {
    layoutImpressaoService,
} from "../../services/layoutImpressaoService.js";

import {
    linhaService,
} from "../../services/linhaService.js";

import {
    plantaService,
} from "../../services/plantaService.js";

const FORM_INICIAL = {
    plantaId: "",
    linhaId: "",
    equipamentoPrincipalId: "",
    layoutPrincipalId: "",
    equipamentoRetrabalhoId: "",
    layoutRetrabalhoId: "",
    validadeDias: "",
    observacoes: "",
};
function ProducaoFormModal({
                               isOpen,
                               onClose,
                               onSubmit,
                               submitLoading = false,
                           }) {
    const [form, setForm] =
        useState(FORM_INICIAL);

    const [plantas, setPlantas] =
        useState([]);

    const [linhas, setLinhas] =
        useState([]);

    const [equipamentos, setEquipamentos] =
        useState([]);

    const [
        layoutsPrincipal,
        setLayoutsPrincipal,
    ] = useState([]);

    const [
        layoutsRetrabalho,
        setLayoutsRetrabalho,
    ] = useState([]);

    const [loadingBase, setLoadingBase] =
        useState(false);

    const [
        loadingLayoutPrincipal,
        setLoadingLayoutPrincipal,
    ] = useState(false);

    const [
        loadingLayoutRetrabalho,
        setLoadingLayoutRetrabalho,
    ] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        let ativo = true;

        async function carregarDadosBase() {
            try {
                setLoadingBase(true);

                const [
                    plantasData,
                    equipamentosData,
                ] = await Promise.all([
                    plantaService.listar(),
                    equipamentosService.listar(),
                ]);

                if (!ativo) {
                    return;
                }

                setPlantas(
                    Array.isArray(plantasData)
                        ? plantasData
                        : []
                );

                setEquipamentos(
                    Array.isArray(equipamentosData)
                        ? equipamentosData
                        : []
                );

                setLinhas([]);
            } catch (error) {
                console.error(
                    "Erro ao carregar dados da produção:",
                    error
                );

                toast.error(
                    error.response?.data?.detail ||
                    "Não foi possível carregar plantas e equipamentos."
                );
            } finally {
                if (ativo) {
                    setLoadingBase(false);
                }
            }
        }

        setForm(FORM_INICIAL);
        setLayoutsPrincipal([]);
        setLayoutsRetrabalho([]);

        carregarDadosBase();

        return () => {
            ativo = false;
        };
    }, [isOpen]);

    useEffect(() => {
        const plantaId =
            form.plantaId;

        if (!isOpen || !plantaId) {
            setLinhas([]);
            return;
        }

        let ativo = true;

        async function carregarLinhas() {
            try {
                const data =
                    await linhaService.listarPorPlanta(
                        Number(plantaId)
                    );

                if (!ativo) {
                    return;
                }

                setLinhas(
                    Array.isArray(data)
                        ? data
                        : []
                );
            } catch (error) {
                console.error(
                    "Erro ao carregar linhas:",
                    error
                );

                if (ativo) {
                    setLinhas([]);

                    toast.error(
                        error.response?.data?.detail ||
                        "Não foi possível carregar as linhas da planta."
                    );
                }
            }
        }

        carregarLinhas();

        return () => {
            ativo = false;
        };
    }, [
        isOpen,
        form.plantaId,
    ]);

    useEffect(() => {
        const equipamentoId =
            form.equipamentoPrincipalId;

        if (!isOpen || !equipamentoId) {
            setLayoutsPrincipal([]);
            return;
        }

        let ativo = true;

        async function carregarLayouts() {
            try {
                setLoadingLayoutPrincipal(true);

                const data =
                    await layoutImpressaoService
                        .listarPorEquipamento(
                            Number(equipamentoId)
                        );

                if (!ativo) {
                    return;
                }

                setLayoutsPrincipal(
                    Array.isArray(data)
                        ? data.filter(
                            (layout) =>
                                layout.ativo !== false
                        )
                        : []
                );
            } catch (error) {
                console.error(
                    "Erro ao carregar layouts principais:",
                    error
                );

                if (ativo) {
                    setLayoutsPrincipal([]);

                    toast.error(
                        error.response?.data?.detail ||
                        "Não foi possível carregar os layouts do equipamento principal."
                    );
                }
            } finally {
                if (ativo) {
                    setLoadingLayoutPrincipal(false);
                }
            }
        }

        carregarLayouts();

        return () => {
            ativo = false;
        };
    }, [
        isOpen,
        form.equipamentoPrincipalId,
    ]);

    useEffect(() => {
        const equipamentoId =
            form.equipamentoRetrabalhoId;

        if (!isOpen || !equipamentoId) {
            setLayoutsRetrabalho([]);
            return;
        }

        let ativo = true;

        async function carregarLayouts() {
            try {
                setLoadingLayoutRetrabalho(true);

                const data =
                    await layoutImpressaoService
                        .listarPorEquipamento(
                            Number(equipamentoId)
                        );

                if (!ativo) {
                    return;
                }

                setLayoutsRetrabalho(
                    Array.isArray(data)
                        ? data.filter(
                            (layout) =>
                                layout.ativo !== false
                        )
                        : []
                );
            } catch (error) {
                console.error(
                    "Erro ao carregar layouts de retrabalho:",
                    error
                );

                if (ativo) {
                    setLayoutsRetrabalho([]);

                    toast.error(
                        error.response?.data?.detail ||
                        "Não foi possível carregar os layouts de retrabalho."
                    );
                }
            } finally {
                if (ativo) {
                    setLoadingLayoutRetrabalho(false);
                }
            }
        }

        carregarLayouts();

        return () => {
            ativo = false;
        };
    }, [
        isOpen,
        form.equipamentoRetrabalhoId,
    ]);

    const equipamentosDaLinha =
        useMemo(() => {
            if (!form.linhaId) {
                return [];
            }

            return equipamentos
                .filter(
                    (equipamento) =>
                        String(equipamento.linhaId) ===
                        String(form.linhaId)
                )
                .filter(
                    (equipamento) =>
                        equipamento.status === "ATIVO"
                )
                .sort((a, b) =>
                    a.nome.localeCompare(
                        b.nome,
                        "pt-BR"
                    )
                );
        }, [
            equipamentos,
            form.linhaId,
        ]);

    const equipamentosRetrabalho =
        useMemo(() => {
            return equipamentosDaLinha.filter(
                (equipamento) =>
                    String(equipamento.id) !==
                    String(
                        form.equipamentoPrincipalId
                    )
            );
        }, [
            equipamentosDaLinha,
            form.equipamentoPrincipalId,
        ]);

    function atualizarCampo(
        campo,
        valor
    ) {
        setForm((anterior) => ({
            ...anterior,
            [campo]: valor,
        }));
    }

    function alterarPlanta(event) {
        const plantaId =
            event.target.value;

        setForm((anterior) => ({
            ...anterior,
            plantaId,
            linhaId: "",
            equipamentoPrincipalId: "",
            layoutPrincipalId: "",
            equipamentoRetrabalhoId: "",
            layoutRetrabalhoId: "",
        }));

        setLinhas([]);
        setLayoutsPrincipal([]);
        setLayoutsRetrabalho([]);
    }

    function alterarLinha(event) {
        const linhaId =
            event.target.value;

        setForm((anterior) => ({
            ...anterior,
            linhaId,
            equipamentoPrincipalId: "",
            layoutPrincipalId: "",
            equipamentoRetrabalhoId: "",
            layoutRetrabalhoId: "",
        }));

        setLayoutsPrincipal([]);
        setLayoutsRetrabalho([]);
    }

    function alterarEquipamentoPrincipal(
        event
    ) {
        const equipamentoId =
            event.target.value;

        setForm((anterior) => {
            const mesmoRetrabalho =
                String(
                    anterior.equipamentoRetrabalhoId
                ) === String(equipamentoId);

            return {
                ...anterior,
                equipamentoPrincipalId:
                equipamentoId,
                layoutPrincipalId: "",
                equipamentoRetrabalhoId:
                    mesmoRetrabalho
                        ? ""
                        : anterior
                            .equipamentoRetrabalhoId,
                layoutRetrabalhoId:
                    mesmoRetrabalho
                        ? ""
                        : anterior
                            .layoutRetrabalhoId,
            };
        });

        setLayoutsPrincipal([]);
    }

    function alterarEquipamentoRetrabalho(
        event
    ) {
        const equipamentoId =
            event.target.value;

        setForm((anterior) => ({
            ...anterior,
            equipamentoRetrabalhoId:
            equipamentoId,
            layoutRetrabalhoId: "",
        }));

        setLayoutsRetrabalho([]);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!form.plantaId) {
            toast.error(
                "Selecione a planta."
            );
            return;
        }

        if (!form.linhaId) {
            toast.error(
                "Selecione a linha."
            );
            return;
        }

        if (
            !form.equipamentoPrincipalId ||
            !form.layoutPrincipalId
        ) {
            toast.error(
                "Selecione o equipamento e o layout principal."
            );
            return;
        }

        const possuiEquipamentoRetrabalho =
            Boolean(
                form.equipamentoRetrabalhoId
            );

        const possuiLayoutRetrabalho =
            Boolean(form.layoutRetrabalhoId);

        if (
            possuiEquipamentoRetrabalho !==
            possuiLayoutRetrabalho
        ) {
            toast.error(
                "Informe o equipamento e o layout de retrabalho ou deixe ambos vazios."
            );
            return;
        }

        const validadeDias =
            form.validadeDias === ""
                ? null
                : Number(form.validadeDias);

        if (
            validadeDias !== null &&
            (
                !Number.isInteger(validadeDias) ||
                validadeDias < 0
            )
        ) {
            toast.error(
                "A validade deve ser um número inteiro igual ou maior que zero."
            );
            return;
        }

        const payload = {
            linhaId: Number(form.linhaId),
            equipamentoPrincipalId:
                Number(form.equipamentoPrincipalId),
            layoutPrincipalId:
                Number(form.layoutPrincipalId),
            equipamentoRetrabalhoId:
                form.equipamentoRetrabalhoId
                    ? Number(form.equipamentoRetrabalhoId)
                    : null,
            layoutRetrabalhoId:
                form.layoutRetrabalhoId
                    ? Number(form.layoutRetrabalhoId)
                    : null,
            validadeDias,
            observacoes:
                form.observacoes.trim() || null,
        };

        await onSubmit(payload);
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
            <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <Factory
                                size={21}
                                className="text-blue-600"
                            />

                            <h2 className="text-lg font-bold text-slate-900">
                                Nova produção
                            </h2>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Configure a ordem, a linha e
                            os equipamentos de impressão.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitLoading}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Fechar"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="max-h-[calc(92vh-86px)] overflow-y-auto"
                >
                    <div className="space-y-7 p-6">
                        <section>
                            <SectionTitle
                                title="Identificação"
                                description="Dados principais da ordem de produção."
                            />

                            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                                <Field
                                    label="Planta"
                                    required
                                >
                                    <select
                                        value={form.plantaId}
                                        onChange={alterarPlanta}
                                        disabled={
                                            loadingBase ||
                                            submitLoading
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            {loadingBase
                                                ? "Carregando plantas..."
                                                : "Selecione a planta"}
                                        </option>

                                        {plantas.map(
                                            (planta) => (
                                                <option
                                                    key={planta.id}
                                                    value={planta.id}
                                                >
                                                    {planta.nome}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </Field>

                                <Field
                                    label="Linha"
                                    required
                                >
                                    <select
                                        value={form.linhaId}
                                        onChange={alterarLinha}
                                        disabled={
                                            !form.plantaId ||
                                            loadingBase ||
                                            submitLoading
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            {!form.plantaId
                                                ? "Selecione primeiro a planta"
                                                : linhas.length === 0
                                                    ? "Nenhuma linha encontrada"
                                                    : "Selecione a linha"}
                                        </option>

                                        {linhas.map(
                                            (linha) => (
                                                <option
                                                    key={linha.id}
                                                    value={linha.id}
                                                >
                                                    {linha.nome}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </Field>
                            </div>
                        </section>

                        <section>
                            <SectionTitle
                                title="Impressão principal"
                                description="Equipamento e layout utilizados no fluxo principal."
                            />

                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Field
                                    label="Equipamento principal"
                                    required
                                >
                                    <select
                                        value={
                                            form.equipamentoPrincipalId
                                        }
                                        onChange={
                                            alterarEquipamentoPrincipal
                                        }
                                        disabled={
                                            !form.linhaId ||
                                            loadingBase ||
                                            submitLoading
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            {!form.linhaId
                                                ? "Selecione primeiro a linha"
                                                : equipamentosDaLinha.length === 0
                                                    ? "Nenhum equipamento ativo na linha"
                                                    : "Selecione o equipamento"}
                                        </option>

                                        {equipamentosDaLinha.map(
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
                                </Field>

                                <Field
                                    label="Layout principal"
                                    required
                                >
                                    <select
                                        value={
                                            form.layoutPrincipalId
                                        }
                                        onChange={(event) =>
                                            atualizarCampo(
                                                "layoutPrincipalId",
                                                event.target.value
                                            )
                                        }
                                        disabled={
                                            !form.equipamentoPrincipalId ||
                                            loadingLayoutPrincipal ||
                                            submitLoading
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            {loadingLayoutPrincipal
                                                ? "Carregando layouts..."
                                                : !form.equipamentoPrincipalId
                                                    ? "Selecione primeiro o equipamento"
                                                    : layoutsPrincipal.length === 0
                                                        ? "Nenhum layout ativo"
                                                        : "Selecione o layout"}
                                        </option>

                                        {layoutsPrincipal.map(
                                            (layout) => (
                                                <option
                                                    key={
                                                        layout.id
                                                    }
                                                    value={
                                                        layout.id
                                                    }
                                                >
                                                    {
                                                        layout.nome
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </Field>
                            </div>
                        </section>

                        <section>
                            <SectionTitle
                                title="Retrabalho"
                                description="Configuração opcional para reimpressão de itens reprovados."
                            />

                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Field label="Equipamento de retrabalho">
                                    <select
                                        value={
                                            form.equipamentoRetrabalhoId
                                        }
                                        onChange={
                                            alterarEquipamentoRetrabalho
                                        }
                                        disabled={
                                            !form.linhaId ||
                                            loadingBase ||
                                            submitLoading
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Sem retrabalho
                                        </option>

                                        {equipamentosRetrabalho.map(
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
                                </Field>

                                <Field label="Layout de retrabalho">
                                    <select
                                        value={
                                            form.layoutRetrabalhoId
                                        }
                                        onChange={(event) =>
                                            atualizarCampo(
                                                "layoutRetrabalhoId",
                                                event.target.value
                                            )
                                        }
                                        disabled={
                                            !form.equipamentoRetrabalhoId ||
                                            loadingLayoutRetrabalho ||
                                            submitLoading
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            {loadingLayoutRetrabalho
                                                ? "Carregando layouts..."
                                                : !form.equipamentoRetrabalhoId
                                                    ? "Selecione primeiro o equipamento"
                                                    : layoutsRetrabalho.length === 0
                                                        ? "Nenhum layout ativo"
                                                        : "Selecione o layout"}
                                        </option>

                                        {layoutsRetrabalho.map(
                                            (layout) => (
                                                <option
                                                    key={
                                                        layout.id
                                                    }
                                                    value={
                                                        layout.id
                                                    }
                                                >
                                                    {
                                                        layout.nome
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </Field>
                            </div>
                        </section>

                        <section>
                            <SectionTitle
                                title="Informações adicionais"
                                description="Validade e observações da produção."
                            />

                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[14rem_minmax(0,1fr)]">
                                <Field label="Validade em dias">
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={
                                            form.validadeDias
                                        }
                                        onChange={(event) =>
                                            atualizarCampo(
                                                "validadeDias",
                                                event.target.value
                                            )
                                        }
                                        disabled={
                                            submitLoading
                                        }
                                        placeholder="Ex.: 90"
                                        className={inputClass}
                                    />
                                </Field>

                                <Field label="Observações">
                                    <textarea
                                        value={
                                            form.observacoes
                                        }
                                        onChange={(event) =>
                                            atualizarCampo(
                                                "observacoes",
                                                event.target.value
                                            )
                                        }
                                        maxLength={1000}
                                        rows={4}
                                        disabled={
                                            submitLoading
                                        }
                                        placeholder="Informações adicionais sobre a produção..."
                                        className={`${inputClass} min-h-28 resize-y py-3`}
                                    />
                                </Field>
                            </div>
                        </section>
                    </div>

                    <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitLoading}
                            className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={
                                loadingBase ||
                                submitLoading
                            }
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitLoading && (
                                <Loader2
                                    size={17}
                                    className="animate-spin"
                                />
                            )}

                            {submitLoading
                                ? "Salvando..."
                                : "Criar produção"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({
                   label,
                   required = false,
                   children,
               }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}
            </span>

            {children}
        </label>
    );
}

function SectionTitle({
                          title,
                          description,
                      }) {
    return (
        <div>
            <h3 className="text-sm font-bold text-slate-900">
                {title}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
                {description}
            </p>
        </div>
    );
}

const inputClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60";

export default ProducaoFormModal;