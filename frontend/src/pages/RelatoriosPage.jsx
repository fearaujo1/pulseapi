import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    BarChart3,
    CheckCircle2,
    CircleAlert,
    Download,
    FileText,
    HardDrive,
    Printer,
    Search,
} from "lucide-react";

import toast from "react-hot-toast";

import Topbar from "../components/layout/Topbar";
import SummaryCard from "../components/common/SummaryCard.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";

import {
    relatorioService,
} from "../services/relatorioService";

import {
    equipamentosService,
} from "../services/equipamentosService";

import {
    layoutImpressaoService,
} from "../services/layoutImpressaoService";


function RelatoriosPage() {
    const hoje =
        formatarDataInput(
            new Date()
        );

    const primeiroDiaMes = (() => {
        const data = new Date();

        data.setDate(1);

        return formatarDataInput(data);
    })();

    const [
        tipoRelatorio,
        setTipoRelatorio,
    ] = useState("GERAL");

    const [
        dataInicial,
        setDataInicial,
    ] = useState(primeiroDiaMes);

    const [
        dataFinal,
        setDataFinal,
    ] = useState(hoje);

    const [
        equipamentoId,
        setEquipamentoId,
    ] = useState("");

    const [
        status,
        setStatus,
    ] = useState("");

    const [
        tipoOcorrencia,
        setTipoOcorrencia,
    ] = useState("");

    const [
        layoutId,
        setLayoutId,
    ] = useState("");

    const [
        equipamentos,
        setEquipamentos,
    ] = useState([]);

    const [
        layouts,
        setLayouts,
    ] = useState([]);

    const [
        resultado,
        setResultado,
    ] = useState(null);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        exportLoading,
        setExportLoading,
    ] = useState(false);

    const [
        search,
        setSearch,
    ] = useState("");


    useEffect(() => {
        async function carregarEquipamentos() {
            try {
                const data =
                    await equipamentosService
                        .listar();

                setEquipamentos(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {
                console.error(
                    "Erro ao carregar equipamentos:",
                    error
                );

                setEquipamentos([]);

                toast.error(
                    "Erro ao carregar equipamentos."
                );
            }
        }

        carregarEquipamentos();
    }, []);


    useEffect(() => {
        setResultado(null);
        setSearch("");
        setEquipamentoId("");
        setStatus("");
        setTipoOcorrencia("");
        setLayoutId("");
        setLayouts([]);
    }, [tipoRelatorio]);


    useEffect(() => {
        if (tipoRelatorio !== "IMPRESSOES") {
            return;
        }

        async function carregarLayouts() {
            try {
                let data;

                if (equipamentoId) {
                    data =
                        await layoutImpressaoService
                            .listarPorEquipamento(
                                equipamentoId
                            );
                } else {
                    data =
                        await layoutImpressaoService
                            .listar();
                }

                const layoutsAtivos =
                    Array.isArray(data)
                        ? data.filter(
                            (layout) =>
                                layout.ativo
                        )
                        : [];

                setLayouts(layoutsAtivos);

                setLayoutId(
                    (layoutAtual) => {
                        if (!layoutAtual) {
                            return "";
                        }

                        const aindaExiste =
                            layoutsAtivos.some(
                                (layout) =>
                                    String(layout.id) ===
                                    String(layoutAtual)
                            );

                        return aindaExiste
                            ? layoutAtual
                            : "";
                    }
                );

            } catch (error) {
                console.error(
                    "Erro ao carregar layouts:",
                    error
                );

                setLayouts([]);
                setLayoutId("");

                toast.error(
                    "Erro ao carregar layouts de impressão."
                );
            }
        }

        carregarLayouts();

    }, [
        tipoRelatorio,
        equipamentoId,
    ]);


    function validarPeriodo() {
        if (tipoRelatorio === "EQUIPAMENTOS") {
            return true;
        }

        if (!dataInicial || !dataFinal) {
            toast.error(
                "Informe a data inicial e a data final."
            );

            return false;
        }

        if (dataInicial > dataFinal) {
            toast.error(
                "A data inicial não pode ser posterior à data final."
            );

            return false;
        }

        return true;
    }


    async function gerarRelatorio() {
        if (!validarPeriodo()) {
            return;
        }

        try {
            setLoading(true);

            let data = null;

            if (tipoRelatorio === "GERAL") {
                data =
                    await relatorioService
                        .gerarRelatorioGeral({
                            dataInicial,
                            dataFinal,
                        });
            }

            if (tipoRelatorio === "IMPRESSOES") {
                data =
                    await relatorioService
                        .gerarRelatorioImpressoes({
                            dataInicial,
                            dataFinal,

                            equipamentoId:
                                equipamentoId ||
                                undefined,

                            status:
                                status ||
                                undefined,

                            layoutId:
                                layoutId ||
                                undefined,
                        });
            }

            if (tipoRelatorio === "OCORRENCIAS") {
                data =
                    await relatorioService
                        .gerarRelatorioOcorrencias({
                            dataInicial,
                            dataFinal,

                            equipamentoId:
                                equipamentoId ||
                                undefined,

                            tipo:
                                tipoOcorrencia ||
                                undefined,

                            status:
                                status ||
                                undefined,
                        });
            }

            if (tipoRelatorio === "EQUIPAMENTOS") {
                data =
                    await relatorioService
                        .gerarRelatorioEquipamentos();
            }

            setResultado(data);
            setSearch("");

        } catch (error) {
            console.error(
                "Erro ao gerar relatório:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Não foi possível gerar o relatório."
            );

        } finally {
            setLoading(false);
        }
    }


    async function exportarPdf() {
        if (!validarPeriodo()) {
            return;
        }

        try {
            setExportLoading(true);

            let blob = null;
            let nomeArquivo = "";

            if (tipoRelatorio === "GERAL") {
                blob =
                    await relatorioService
                        .exportarPdfGeral({
                            dataInicial,
                            dataFinal,
                        });

                nomeArquivo =
                    `relatorio-geral-${dataInicial}-a-${dataFinal}.pdf`;
            }

            if (tipoRelatorio === "IMPRESSOES") {
                blob =
                    await relatorioService
                        .exportarPdfImpressoes({
                            dataInicial,
                            dataFinal,

                            equipamentoId:
                                equipamentoId ||
                                undefined,

                            status:
                                status ||
                                undefined,

                            layoutId:
                                layoutId ||
                                undefined,
                        });

                nomeArquivo =
                    `relatorio-impressoes-${dataInicial}-a-${dataFinal}.pdf`;
            }

            if (tipoRelatorio === "OCORRENCIAS") {
                blob =
                    await relatorioService
                        .exportarPdfOcorrencias({
                            dataInicial,
                            dataFinal,

                            equipamentoId:
                                equipamentoId ||
                                undefined,

                            tipo:
                                tipoOcorrencia ||
                                undefined,

                            status:
                                status ||
                                undefined,
                        });

                nomeArquivo =
                    `relatorio-ocorrencias-${dataInicial}-a-${dataFinal}.pdf`;
            }

            if (tipoRelatorio === "EQUIPAMENTOS") {
                blob =
                    await relatorioService
                        .exportarPdfEquipamentos();

                nomeArquivo =
                    `relatorio-equipamentos-${hoje}.pdf`;
            }

            if (!blob) {
                throw new Error(
                    "O arquivo do relatório não foi recebido."
                );
            }

            const url =
                window.URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement("a");

            link.href = url;
            link.download = nomeArquivo;

            document.body.appendChild(
                link
            );

            link.click();
            link.remove();

            window.URL.revokeObjectURL(
                url
            );

            toast.success(
                "Relatório exportado com sucesso."
            );

        } catch (error) {
            console.error(
                "Erro ao exportar PDF:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Não foi possível exportar o relatório."
            );

        } finally {
            setExportLoading(false);
        }
    }


    const itensFiltrados =
        useMemo(() => {
            if (
                tipoRelatorio === "GERAL" ||
                !Array.isArray(
                    resultado?.itens
                )
            ) {
                return [];
            }

            const termo =
                search
                    .trim()
                    .toLowerCase();

            if (!termo) {
                return resultado.itens;
            }

            return resultado.itens.filter(
                (item) =>
                    JSON.stringify(item)
                        .toLowerCase()
                        .includes(termo)
            );

        }, [
            resultado,
            search,
            tipoRelatorio,
        ]);


    const carregando =
        loading || exportLoading;

    const mostraPeriodo =
        tipoRelatorio !== "EQUIPAMENTOS";

    const mostraEquipamento =
        tipoRelatorio === "IMPRESSOES" ||
        tipoRelatorio === "OCORRENCIAS";


    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="p-4 md:p-6">
                <section className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-950 md:text-4xl">
                        Relatórios
                    </h1>

                    <p className="mt-1 text-base text-slate-600">
                        Gere e analise informações operacionais do sistema
                    </p>
                </section>


                <section className="mb-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-950">
                            Filtros do relatório
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Selecione o tipo e os critérios desejados
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        <FormField label="Tipo de relatório">
                            <select
                                value={tipoRelatorio}
                                onChange={(event) =>
                                    setTipoRelatorio(
                                        event.target.value
                                    )
                                }
                                disabled={carregando}
                                className={inputClass}
                            >
                                <option value="GERAL">
                                    Relatório geral
                                </option>

                                <option value="IMPRESSOES">
                                    Impressões
                                </option>

                                <option value="OCORRENCIAS">
                                    Ocorrências
                                </option>

                                <option value="EQUIPAMENTOS">
                                    Equipamentos
                                </option>
                            </select>
                        </FormField>


                        {mostraPeriodo && (
                            <>
                                <FormField label="Data inicial">
                                    <input
                                        type="date"
                                        value={dataInicial}
                                        max={dataFinal || undefined}
                                        onChange={(event) =>
                                            setDataInicial(
                                                event.target.value
                                            )
                                        }
                                        disabled={carregando}
                                        className={inputClass}
                                    />
                                </FormField>

                                <FormField label="Data final">
                                    <input
                                        type="date"
                                        value={dataFinal}
                                        min={dataInicial || undefined}
                                        max={hoje}
                                        onChange={(event) =>
                                            setDataFinal(
                                                event.target.value
                                            )
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
                                    value={equipamentoId}
                                    onChange={(event) =>
                                        setEquipamentoId(
                                            event.target.value
                                        )
                                    }
                                    disabled={carregando}
                                    className={inputClass}
                                >
                                    <option value="">
                                        Todos os equipamentos
                                    </option>

                                    {equipamentos.map(
                                        (equipamento) => (
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
                        )}


                        {tipoRelatorio ===
                            "IMPRESSOES" && (
                                <>
                                    <FormField label="Status">
                                        <select
                                            value={status}
                                            onChange={(event) =>
                                                setStatus(
                                                    event.target.value
                                                )
                                            }
                                            disabled={carregando}
                                            className={inputClass}
                                        >
                                            <option value="">
                                                Todos os status
                                            </option>

                                            <option value="PENDENTE">
                                                Pendente
                                            </option>

                                            <option value="ENVIANDO">
                                                Enviando
                                            </option>

                                            <option value="ENVIADO_FIFO">
                                                Enviado ao FIFO
                                            </option>

                                            <option value="PRONTO_IMPRESSAO">
                                                Pronto para impressão
                                            </option>

                                            <option value="IMPRESSO">
                                                Impresso
                                            </option>

                                            <option value="ERRO">
                                                Erro
                                            </option>

                                            <option value="CANCELADO">
                                                Cancelado
                                            </option>
                                        </select>
                                    </FormField>

                                    <FormField label="Layout">
                                        <select
                                            value={layoutId}
                                            onChange={(event) =>
                                                setLayoutId(
                                                    event.target.value
                                                )
                                            }
                                            disabled={carregando}
                                            className={inputClass}
                                        >
                                            <option value="">
                                                Todos os layouts
                                            </option>

                                            {layouts.map(
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

                                                        {layout.nomeNaImpressora
                                                            ? ` - ${layout.nomeNaImpressora}`
                                                            : ""}
                                                    </option>
                                                )
                                            )}
                                        </select>

                                        {equipamentoId &&
                                            layouts.length === 0 && (
                                                <p className="mt-2 text-xs text-amber-600">
                                                    O equipamento selecionado não possui layouts de impressão ativos.
                                                </p>
                                            )}
                                    </FormField>
                                </>
                            )}


                        {tipoRelatorio ===
                            "OCORRENCIAS" && (
                                <>
                                    <FormField label="Tipo">
                                        <select
                                            value={tipoOcorrencia}
                                            onChange={(event) =>
                                                setTipoOcorrencia(
                                                    event.target.value
                                                )
                                            }
                                            disabled={carregando}
                                            className={inputClass}
                                        >
                                            <option value="">
                                                Todos os tipos
                                            </option>

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

                                    <FormField label="Status">
                                        <select
                                            value={status}
                                            onChange={(event) =>
                                                setStatus(
                                                    event.target.value
                                                )
                                            }
                                            disabled={carregando}
                                            className={inputClass}
                                        >
                                            <option value="">
                                                Todos os status
                                            </option>

                                            <option value="ABERTA">
                                                Aberta
                                            </option>

                                            <option value="EM_ANALISE">
                                                Em análise
                                            </option>

                                            <option value="EM_ATENDIMENTO">
                                                Em atendimento
                                            </option>

                                            <option value="RESOLVIDA">
                                                Resolvida
                                            </option>

                                            <option value="CANCELADA">
                                                Cancelada
                                            </option>
                                        </select>
                                    </FormField>
                                </>
                            )}
                    </div>


                    <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={exportarPdf}
                            disabled={carregando}
                            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Download size={17} />

                            {exportLoading
                                ? "Exportando..."
                                : "Exportar PDF"}
                        </button>

                        <button
                            type="button"
                            onClick={gerarRelatorio}
                            disabled={carregando}
                            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                        >
                            <BarChart3 size={17} />

                            {loading
                                ? "Gerando..."
                                : "Gerar relatório"}
                        </button>
                    </div>
                </section>


                {resultado && (
                    <>
                        <ResumoRelatorio
                            tipo={tipoRelatorio}
                            resultado={resultado}
                        />

                        {tipoRelatorio === "GERAL" ? (
                            <ResultadoGeral
                                resultado={resultado}
                            />
                        ) : (
                            <ResultadoDetalhado
                                tipoRelatorio={
                                    tipoRelatorio
                                }
                                resultado={
                                    resultado
                                }
                                itens={
                                    itensFiltrados
                                }
                                search={search}
                                onSearchChange={
                                    setSearch
                                }
                            />
                        )}
                    </>
                )}
            </main>
        </div>
    );
}


function ResultadoGeral({
                            resultado,
                        }) {
    const secoes = [
        {
            titulo: "Produções",
            descricao:
                "Produções criadas no período selecionado.",

            total:
                resultado.producoes?.total ||
                0,

            detalhes: [
                {
                    label: "Em andamento",
                    value:
                        resultado
                            .producoes
                            ?.emAndamento ||
                        0,
                },
                {
                    label: "Pausadas",
                    value:
                        resultado
                            .producoes
                            ?.pausadas ||
                        0,
                },
                {
                    label: "Em avaliação",
                    value:
                        resultado
                            .producoes
                            ?.aguardandoAvaliacao ||
                        0,
                },
                {
                    label: "Em retrabalho",
                    value:
                        resultado
                            .producoes
                            ?.emRetrabalho ||
                        0,
                },
                {
                    label: "Concluídas",
                    value:
                        resultado
                            .producoes
                            ?.concluidas ||
                        0,
                },
                {
                    label: "Canceladas",
                    value:
                        resultado
                            .producoes
                            ?.canceladas ||
                        0,
                },
            ],
        },

        {
            titulo: "Impressões",
            descricao:
                "Registros enviados ao fluxo de impressão.",

            total:
                resultado.impressoes?.total ||
                0,

            detalhes: [
                {
                    label: "Pendentes",
                    value:
                        resultado
                            .impressoes
                            ?.pendentes ||
                        0,
                },
                {
                    label: "Processando",
                    value:
                        resultado
                            .impressoes
                            ?.emProcessamento ||
                        0,
                },
                {
                    label: "Impressos",
                    value:
                        resultado
                            .impressoes
                            ?.impressos ||
                        0,
                },
                {
                    label: "Erros",
                    value:
                        resultado
                            .impressoes
                            ?.erros ||
                        0,
                },
                {
                    label: "Cancelados",
                    value:
                        resultado
                            .impressoes
                            ?.cancelados ||
                        0,
                },
            ],
        },

        {
            titulo: "Ocorrências",
            descricao:
                "Ocorrências registradas no período.",

            total:
                resultado.ocorrencias?.total ||
                0,

            detalhes: [
                {
                    label: "Abertas",
                    value:
                        resultado
                            .ocorrencias
                            ?.abertas ||
                        0,
                },
                {
                    label: "Em análise",
                    value:
                        resultado
                            .ocorrencias
                            ?.emAnalise ||
                        0,
                },
                {
                    label: "Em atendimento",
                    value:
                        resultado
                            .ocorrencias
                            ?.emAtendimento ||
                        0,
                },
                {
                    label: "Resolvidas",
                    value:
                        resultado
                            .ocorrencias
                            ?.resolvidas ||
                        0,
                },
                {
                    label: "Canceladas",
                    value:
                        resultado
                            .ocorrencias
                            ?.canceladas ||
                        0,
                },
            ],
        },

        {
            titulo: "Equipamentos",
            descricao:
                "Situação atual dos equipamentos cadastrados.",

            total:
                resultado.equipamentos?.total ||
                0,

            detalhes: [
                {
                    label: "Ativos",
                    value:
                        resultado
                            .equipamentos
                            ?.ativos ||
                        0,
                },
                {
                    label: "Inativos",
                    value:
                        resultado
                            .equipamentos
                            ?.inativos ||
                        0,
                },
                {
                    label: "Em manutenção",
                    value:
                        resultado
                            .equipamentos
                            ?.emManutencao ||
                        0,
                },
                {
                    label: "Sem conexão",
                    value:
                        resultado
                            .equipamentos
                            ?.semConexao ||
                        0,
                },
                {
                    label: "Parados",
                    value:
                        resultado
                            .equipamentos
                            ?.parados ||
                        0,
                },
            ],
        },
    ];


    return (
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-950">
                        Visão consolidada
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Informações consolidadas do período selecionado
                    </p>
                </div>

                <p className="text-sm text-slate-500">
                    Gerado por{" "}

                    <span className="font-semibold text-slate-700">
                        {resultado.geradoPor ||
                            "Não identificado"}
                    </span>

                    {" em "}

                    <span className="font-semibold text-slate-700">
                        {formatarData(
                            resultado.geradoEm
                        )}
                    </span>
                </p>
            </div>


            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {secoes.map(
                    (secao) => (
                        <article
                            key={
                                secao.titulo
                            }
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        {
                                            secao.titulo
                                        }
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {
                                            secao.descricao
                                        }
                                    </p>
                                </div>

                                <span className="rounded-xl bg-slate-900 px-3 py-1.5 text-sm font-bold text-white">
                                    {
                                        secao.total
                                    }
                                </span>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {secao.detalhes.map(
                                    (
                                        detalhe
                                    ) => (
                                        <div
                                            key={
                                                detalhe.label
                                            }
                                            className="rounded-xl border border-slate-200 bg-white p-3"
                                        >
                                            <p className="text-xs text-slate-500">
                                                {
                                                    detalhe.label
                                                }
                                            </p>

                                            <p className="mt-1 text-lg font-bold text-slate-900">
                                                {
                                                    detalhe.value
                                                }
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        </article>
                    )
                )}
            </div>
        </section>
    );
}


function ResultadoDetalhado({
                                tipoRelatorio,
                                resultado,
                                itens,
                                search,
                                onSearchChange,
                            }) {
    return (
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-950">
                        Resultado
                    </h2>

                    <p className="text-sm text-slate-500">
                        {resultado.itens?.length ||
                            0}{" "}
                        registro(s) encontrado(s)
                    </p>
                </div>

                <div className="relative w-full lg:w-80">
                    <Search
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        value={search}
                        onChange={(event) =>
                            onSearchChange(
                                event.target.value
                            )
                        }
                        placeholder="Buscar no resultado..."
                        className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>
            </div>


            {tipoRelatorio ===
                "IMPRESSOES" && (
                    <TabelaImpressoes
                        itens={itens}
                    />
                )}

            {tipoRelatorio ===
                "OCORRENCIAS" && (
                    <TabelaOcorrencias
                        itens={itens}
                    />
                )}

            {tipoRelatorio ===
                "EQUIPAMENTOS" && (
                    <TabelaEquipamentos
                        itens={itens}
                    />
                )}
        </section>
    );
}


function ResumoRelatorio({
                             tipo,
                             resultado,
                         }) {
    if (tipo === "GERAL") {
        return (
            <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
                <SummaryCard
                    title="Produções"
                    value={
                        resultado
                            .producoes
                            ?.total ||
                        0
                    }
                    subtitle="Criadas no período"
                    icon={
                        <BarChart3
                            size={26}
                            className="text-blue-600"
                        />
                    }
                    className="border-blue-200 bg-blue-50"
                />

                <SummaryCard
                    title="Itens planejados"
                    value={
                        resultado
                            .producoes
                            ?.quantidadeTotalPlanejada ||
                        0
                    }
                    subtitle="Quantidade das produções"
                    icon={
                        <FileText
                            size={26}
                            className="text-violet-600"
                        />
                    }
                    className="border-violet-200 bg-violet-50"
                />

                <SummaryCard
                    title="Impressões"
                    value={
                        resultado
                            .impressoes
                            ?.total ||
                        0
                    }
                    subtitle="Registros no período"
                    icon={
                        <Printer
                            size={26}
                            className="text-emerald-600"
                        />
                    }
                    className="border-emerald-200 bg-emerald-50"
                />

                <SummaryCard
                    title="Ocorrências"
                    value={
                        resultado
                            .ocorrencias
                            ?.total ||
                        0
                    }
                    subtitle="Eventos registrados"
                    icon={
                        <CircleAlert
                            size={26}
                            className="text-amber-600"
                        />
                    }
                    className="border-amber-200 bg-amber-50"
                />

                <SummaryCard
                    title="Equipamentos"
                    value={
                        resultado
                            .equipamentos
                            ?.total ||
                        0
                    }
                    subtitle="Cadastrados no sistema"
                    icon={
                        <HardDrive
                            size={26}
                            className="text-slate-600"
                        />
                    }
                    className="border-slate-200 bg-slate-50"
                />
            </section>
        );
    }


    if (tipo === "IMPRESSOES") {
        return (
            <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
                <SummaryCard
                    title="Total"
                    value={
                        resultado.total
                    }
                    subtitle="Registros encontrados"
                    icon={
                        <Printer
                            size={26}
                            className="text-blue-600"
                        />
                    }
                    className="border-blue-200 bg-blue-50"
                />

                <SummaryCard
                    title="Pendentes"
                    value={
                        resultado.pendentes
                    }
                    subtitle="Aguardando processamento"
                    icon={
                        <FileText
                            size={26}
                            className="text-amber-600"
                        />
                    }
                    className="border-amber-200 bg-amber-50"
                />

                <SummaryCard
                    title="Processando"
                    value={
                        resultado.emProcessamento
                    }
                    subtitle="Fluxo de impressão"
                    icon={
                        <Printer
                            size={26}
                            className="text-violet-600"
                        />
                    }
                    className="border-violet-200 bg-violet-50"
                />

                <SummaryCard
                    title="Impressos"
                    value={
                        resultado.impressos
                    }
                    subtitle="Concluídos"
                    icon={
                        <CheckCircle2
                            size={26}
                            className="text-green-600"
                        />
                    }
                    className="border-green-200 bg-green-50"
                />

                <SummaryCard
                    title="Erros"
                    value={
                        resultado.erros
                    }
                    subtitle="Falhas registradas"
                    icon={
                        <CircleAlert
                            size={26}
                            className="text-red-600"
                        />
                    }
                    className="border-red-200 bg-red-50"
                />
            </section>
        );
    }


    if (tipo === "OCORRENCIAS") {
        return (
            <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-6">
                <MiniCard
                    title="Total"
                    value={resultado.total}
                />

                <MiniCard
                    title="Abertas"
                    value={resultado.abertas}
                />

                <MiniCard
                    title="Em análise"
                    value={resultado.emAnalise}
                />

                <MiniCard
                    title="Em atendimento"
                    value={
                        resultado.emAtendimento
                    }
                />

                <MiniCard
                    title="Resolvidas"
                    value={
                        resultado.resolvidas
                    }
                />

                <MiniCard
                    title="Canceladas"
                    value={
                        resultado.canceladas
                    }
                />
            </section>
        );
    }


    return (
        <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-6">
            <MiniCard
                title="Total"
                value={resultado.total}
            />

            <MiniCard
                title="Ativos"
                value={resultado.ativos}
            />

            <MiniCard
                title="Inativos"
                value={resultado.inativos}
            />

            <MiniCard
                title="Em manutenção"
                value={
                    resultado.emManutencao
                }
            />

            <MiniCard
                title="Sem conexão"
                value={
                    resultado.semConexao
                }
            />

            <MiniCard
                title="Parados"
                value={resultado.parados}
            />
        </section>
    );
}


function TabelaImpressoes({
                              itens,
                          }) {
    if (itens.length === 0) {
        return (
            <EmptyTable />
        );
    }

    return (
        <TabelaBase
            headers={[
                "Data",
                "Equipamento",
                "Layout",
                "Payload",
                "Status",
                "Tentativas",
            ]}
        >
            {itens.map(
                (item) => (
                    <tr
                        key={item.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                        <Td>
                            {formatarData(
                                item.criadoEm
                            )}
                        </Td>

                        <Td>
                            {
                                item.equipamentoNome
                            }
                        </Td>

                        <Td>
                            {
                                item.layoutNome
                            }
                        </Td>

                        <Td>
                            <code className="break-all text-xs">
                                {item.payloadMontado ||
                                    "-"}
                            </code>
                        </Td>

                        <Td>
                            <StatusBadge
                                status={
                                    item.status
                                }
                            />
                        </Td>

                        <Td>
                            {item.tentativas ??
                                0}
                        </Td>
                    </tr>
                )
            )}
        </TabelaBase>
    );
}


function TabelaOcorrencias({
                               itens,
                           }) {
    if (itens.length === 0) {
        return (
            <EmptyTable />
        );
    }

    return (
        <TabelaBase
            headers={[
                "Data",
                "Equipamento",
                "Título",
                "Tipo",
                "Status",
                "Descrição",
            ]}
        >
            {itens.map(
                (item) => (
                    <tr
                        key={item.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                        <Td>
                            {formatarData(
                                item.criadoEm
                            )}
                        </Td>

                        <Td>
                            {
                                item.equipamentoNome
                            }
                        </Td>

                        <Td>
                            {item.titulo}
                        </Td>

                        <Td>
                            {formatarStatus(
                                item.tipo
                            )}
                        </Td>

                        <Td>
                            <StatusBadge
                                status={
                                    item.status
                                }
                            />
                        </Td>

                        <Td>
                            {item.descricao ||
                                "-"}
                        </Td>
                    </tr>
                )
            )}
        </TabelaBase>
    );
}


function TabelaEquipamentos({
                                itens,
                            }) {
    if (itens.length === 0) {
        return (
            <EmptyTable />
        );
    }

    return (
        <TabelaBase
            headers={[
                "Código",
                "Nome",
                "Tipo",
                "Modelo",
                "Status",
                "Conexão",
                "IP",
            ]}
        >
            {itens.map(
                (item) => (
                    <tr
                        key={item.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                        <Td>
                            {item.codigo}
                        </Td>

                        <Td>
                            {item.nome}
                        </Td>

                        <Td>
                            {item.tipo || "-"}
                        </Td>

                        <Td>
                            {item.modelo || "-"}
                        </Td>

                        <Td>
                            <StatusBadge
                                status={
                                    item.status
                                }
                            />
                        </Td>

                        <Td>
                            <StatusBadge
                                status={
                                    item.statusConexao ||
                                    "SEM_CONEXAO"
                                }
                            />
                        </Td>

                        <Td>
                            {item.ip || "-"}
                        </Td>
                    </tr>
                )
            )}
        </TabelaBase>
    );
}


function TabelaBase({
                        headers,
                        children,
                    }) {
    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[900px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                    {headers.map(
                        (header) => (
                            <th
                                key={
                                    header
                                }
                                className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                            >
                                {
                                    header
                                }
                            </th>
                        )
                    )}
                </tr>
                </thead>

                <tbody>
                {children}
                </tbody>
            </table>
        </div>
    );
}


function Td({
                children,
            }) {
    return (
        <td className="px-5 py-4 text-[13.5px] text-slate-600">
            {children}
        </td>
    );
}


function EmptyTable() {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
            <FileText
                size={28}
                className="mx-auto text-slate-400"
            />

            <p className="mt-3 text-sm font-semibold text-slate-700">
                Nenhum registro encontrado
            </p>

            <p className="mt-1 text-sm text-slate-500">
                Tente alterar os filtros utilizados.
            </p>
        </div>
    );
}


function MiniCard({
                      title,
                      value,
                  }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
                {title}
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-950">
                {value ?? 0}
            </p>
        </div>
    );
}


function FormField({
                       label,
                       children,
                   }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </span>

            {children}
        </label>
    );
}


function formatarData(data) {
    if (!data) {
        return "-";
    }

    const valor =
        new Date(data);

    if (
        Number.isNaN(
            valor.getTime()
        )
    ) {
        return "-";
    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short",
        }
    ).format(valor);
}


function formatarDataInput(data) {
    const ano =
        data.getFullYear();

    const mes =
        String(
            data.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            data.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


function formatarStatus(valor) {
    if (!valor) {
        return "-";
    }

    return valor
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            (letra) =>
                letra.toUpperCase()
        );
}


const inputClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";


export default RelatoriosPage;