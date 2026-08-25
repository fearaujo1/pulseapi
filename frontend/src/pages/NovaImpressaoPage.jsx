import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Topbar from "../components/layout/Topbar";
import { ArrowLeft } from "lucide-react";
import { equipamentosService } from "../services/equipamentosService";
import { layoutImpressaoService } from "../services/layoutImpressaoService";
import { filaImpressaoService } from "../services/filaImpressaoService";
import NovaImpressaoForm from "../components/printing/NovaImpressaoForm";
import ImpressaoPreview from "../components/printing/ImpressaoPreview";

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
                        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_1.05fr]">
                            <NovaImpressaoForm
                                equipamentos={equipamentos}
                                layouts={layouts}
                                equipamentoId={equipamentoId}
                                onEquipamentoChange={setEquipamentoId}
                                layoutId={layoutId}
                                onLayoutChange={setLayoutId}
                                layoutSelecionado={layoutSelecionado}
                                valores={valores}
                                onValorChange={atualizarValor}
                                submitLoading={submitLoading}
                                onCancel={() => navigate("/fila-impressao")}
                            />

                            <ImpressaoPreview
                                preview={preview}
                                previewLoading={previewLoading}
                                layoutSelecionado={layoutSelecionado}
                                equipamentoSelecionado={equipamentoSelecionado}
                                onGenerate={gerarPreview}
                            />
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default NovaImpressaoPage;