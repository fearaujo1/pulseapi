import { useEffect, useMemo, useState } from "react";
import {
    BarChart3,
    CheckCircle2,
    CircleAlert,
    FileText,
    HardDrive,
    Printer,
    Search,
    Download,
} from "lucide-react";
import toast from "react-hot-toast";

import Topbar from "../components/layout/Topbar";
import SummaryCard from "../components/common/SummaryCard.jsx";

import { relatorioService } from "../services/relatorioService";
import { equipamentosService } from "../services/equipamentosService";
import { layoutImpressaoService } from "../services/layoutImpressaoService";
import StatusBadge from "../components/common/StatusBadge.jsx";

function RelatoriosPage() {
    const hoje = new Date().toISOString().split("T")[0];

    const primeiroDiaMes = (() => {
        const data = new Date();

        data.setDate(1);

        return data
            .toISOString()
            .split("T")[0];
    })();

    const [tipoRelatorio, setTipoRelatorio] = useState("IMPRESSOES");
    const [dataInicial, setDataInicial] = useState(primeiroDiaMes);
    const [dataFinal, setDataFinal] = useState(hoje);
    const [equipamentoId, setEquipamentoId] = useState("");
    const [status, setStatus] = useState("");
    const [tipoOcorrencia, setTipoOcorrencia] = useState("");
    const [layoutId, setLayoutId] = useState("");
    const [equipamentos, setEquipamentos] = useState([]);
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const [exportLoading, setExportLoading] = useState(false);
    const [layouts, setLayouts] = useState([]);

    useEffect(() => {
        async function carregarEquipamentos() {
            try {
                const data =
                    await equipamentosService.listar();

                setEquipamentos(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {
                console.error(error);

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
    }, [tipoRelatorio]);

    useEffect(() => {
        async function carregarLayouts() {
            try {
                let data;

                if (equipamentoId) {
                    data =
                        await layoutImpressaoService.listarPorEquipamento(
                            equipamentoId
                        );
                } else {
                    data =
                        await layoutImpressaoService.listar();
                }

                const ativos = Array.isArray(data)
                    ? data.filter((layout) => layout.ativo)
                    : [];

                setLayouts(ativos);

                setLayoutId((currentLayoutId) => {
                    if (!currentLayoutId) {
                        return "";
                    }

                    const layoutAindaExiste = ativos.some(
                        (layout) =>
                            String(layout.id) ===
                            String(currentLayoutId)
                    );

                    return layoutAindaExiste
                        ? currentLayoutId
                        : "";
                });
            } catch (error) {
                console.error(
                    "Erro ao carregar layouts:",
                    error
                );

                setLayouts([]);

                toast.error(
                    "Erro ao carregar layouts de impressão."
                );
            }
        }

        if (tipoRelatorio === "IMPRESSOES") {
            carregarLayouts();
        }
    }, [tipoRelatorio, equipamentoId]);

    async function gerarRelatorio() {
        try {
            setLoading(true);

            let data;

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

        } catch (error) {
            console.error(
                "Erro ao gerar relatório:",
                error
            );

            toast.error(
                error.response?.data?.detail ||
                "Não foi possível gerar o relatório."
            );

        } finally {
            setLoading(false);
        }
    }

    const itensFiltrados = useMemo(() => {
        if (!resultado?.itens) {
            return [];
        }

        const termo =
            search.trim().toLowerCase();

        if (!termo) {
            return resultado.itens;
        }

        return resultado.itens.filter(
            (item) =>
                JSON.stringify(item)
                    .toLowerCase()
                    .includes(termo)
        );

    }, [resultado, search]);


    async function exportarPdf() {
        try {
            setExportLoading(true);

            let blob;
            let nomeArquivo;

            if (tipoRelatorio === "IMPRESSOES") {
                blob =
                    await relatorioService.exportarPdfImpressoes({
                        dataInicial,
                        dataFinal,
                        equipamentoId:
                            equipamentoId || undefined,
                        status:
                            status || undefined,
                        layoutId:
                            layoutId || undefined,
                    });

                nomeArquivo =
                    `relatorio-impressoes-${hoje}.pdf`;
            }

            if (tipoRelatorio === "OCORRENCIAS") {
                blob =
                    await relatorioService.exportarPdfOcorrencias({
                        dataInicial,
                        dataFinal,
                        equipamentoId:
                            equipamentoId || undefined,
                        tipo:
                            tipoOcorrencia || undefined,
                        status:
                            status || undefined,
                    });

                nomeArquivo =
                    `relatorio-ocorrencias-${hoje}.pdf`;
            }

            if (tipoRelatorio === "EQUIPAMENTOS") {
                blob =
                    await relatorioService.exportarPdfEquipamentos();

                nomeArquivo =
                    `relatorio-equipamentos-${hoje}.pdf`;
            }

            const url =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;
            link.download = nomeArquivo;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

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
                "Não foi possível exportar o relatório."
            );

        } finally {
            setExportLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="p-4 md:p-6">

                <section className="mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-950">
                        Relatórios
                    </h1>

                    <p className="mt-1 text-[16px] text-slate-600">
                        Gere e analise informações operacionais do sistema
                    </p>
                </section>


                {/* FILTROS */}
                <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 mb-6">

                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-950">
                            Filtros do Relatório
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Selecione o tipo e os critérios desejados
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                        <FormField label="Tipo de Relatório">
                            <select
                                value={tipoRelatorio}
                                onChange={(e) =>
                                    setTipoRelatorio(
                                        e.target.value
                                    )
                                }
                                className={inputClass}
                            >
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

                        {tipoRelatorio !== "EQUIPAMENTOS" && (
                            <>
                                <FormField label="Data Inicial">
                                    <input
                                        type="date"
                                        value={dataInicial}
                                        onChange={(e) =>
                                            setDataInicial(
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </FormField>

                                <FormField label="Data Final">
                                    <input
                                        type="date"
                                        value={dataFinal}
                                        onChange={(e) =>
                                            setDataFinal(
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </FormField>

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
                            </>
                        )}

                        {tipoRelatorio === "IMPRESSOES" && (
                            <>
                                <FormField label="Status">
                                    <select
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(
                                                e.target.value
                                            )
                                        }
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
                                        onChange={(e) =>
                                            setLayoutId(
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Todos os layouts
                                        </option>

                                        {layouts.map(
                                            (layout) => (
                                                <option
                                                    key={layout.id}
                                                    value={layout.id}
                                                >
                                                    {layout.nome}
                                                    {layout.nomeNaImpressora
                                                        ? ` - ${layout.nomeNaImpressora}`
                                                        : ""}
                                                </option>
                                            )
                                        )}

                                        {equipamentoId &&
                                            layouts.length === 0 && (
                                                <option
                                                    value=""
                                                    disabled
                                                >
                                                    Nenhum layout disponível para este equipamento
                                                </option>
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

                        {tipoRelatorio === "OCORRENCIAS" && (
                            <>
                                <FormField label="Tipo">
                                    <select
                                        value={tipoOcorrencia}
                                        onChange={(e) =>
                                            setTipoOcorrencia(
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Todos os tipos
                                        </option>

                                        <option value="FALHA_EQUIPAMENTO">
                                            Falha de Equipamento
                                        </option>

                                        <option value="PARADA_LINHA">
                                            Parada de Linha
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
                                        onChange={(e) =>
                                            setStatus(
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Todos os status
                                        </option>

                                        <option value="ABERTA">
                                            Aberta
                                        </option>

                                        <option value="EM_ANALISE">
                                            Em Análise
                                        </option>

                                        <option value="EM_ATENDIMENTO">
                                            Em Atendimento
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

                    <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">

                        <button
                            type="button"
                            onClick={exportarPdf}
                            disabled={exportLoading}
                            className="h-11 px-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-semibold flex items-center justify-center gap-2 transition"
                        >
                            <Download size={17} />

                            {exportLoading
                                ? "Exportando..."
                                : "Exportar PDF"}
                        </button>

                        <button
                            type="button"
                            onClick={gerarRelatorio}
                            disabled={loading}
                            className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition"
                        >
                            <BarChart3 size={17} />

                            {loading
                                ? "Gerando..."
                                : "Gerar Relatório"}
                        </button>

                    </div>
                </section>


                {/* RESULTADO */}
                {resultado && (
                    <>
                        <ResumoRelatorio
                            tipo={tipoRelatorio}
                            resultado={resultado}
                        />

                        <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6">

                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

                                <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                        Resultado
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        {resultado.itens?.length || 0} registro(s) encontrado(s)
                                    </p>
                                </div>

                                <div className="relative w-full lg:w-80">

                                    <Search
                                        size={17}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Buscar no resultado..."
                                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {tipoRelatorio === "IMPRESSOES" && (
                                <TabelaImpressoes
                                    itens={itensFiltrados}
                                />
                            )}

                            {tipoRelatorio === "OCORRENCIAS" && (
                                <TabelaOcorrencias
                                    itens={itensFiltrados}
                                />
                            )}

                            {tipoRelatorio === "EQUIPAMENTOS" && (
                                <TabelaEquipamentos
                                    itens={itensFiltrados}
                                />
                            )}

                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

function ResumoRelatorio({
                             tipo,
                             resultado,
                         }) {
    if (tipo === "IMPRESSOES") {
        return (
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 mb-6">

                <SummaryCard
                    title="Total"
                    value={resultado.total}
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
                    value={resultado.pendentes}
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
                    value={resultado.emProcessamento}
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
                    value={resultado.impressos}
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
                    value={resultado.erros}
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
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-5 mb-6">

                <MiniCard title="Total" value={resultado.total} />
                <MiniCard title="Abertas" value={resultado.abertas} />
                <MiniCard title="Em análise" value={resultado.emAnalise} />
                <MiniCard title="Em atendimento" value={resultado.emAtendimento} />
                <MiniCard title="Resolvidas" value={resultado.resolvidas} />
                <MiniCard title="Canceladas" value={resultado.canceladas} />

            </section>
        );
    }

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-5 mb-6">

            <MiniCard title="Total" value={resultado.total} />
            <MiniCard title="Ativos" value={resultado.ativos} />
            <MiniCard title="Inativos" value={resultado.inativos} />
            <MiniCard title="Em manutenção" value={resultado.emManutencao} />
            <MiniCard title="Sem conexão" value={resultado.semConexao} />
            <MiniCard title="Parados" value={resultado.parados} />

        </section>
    );
}

function TabelaImpressoes({ itens }) {
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
            {itens.map((item) => (
                <tr
                    key={item.id}
                    className="border-b border-slate-100"
                >
                    <Td>{formatarData(item.criadoEm)}</Td>
                    <Td>{item.equipamentoNome}</Td>
                    <Td>{item.layoutNome}</Td>
                    <Td>
                        <code className="text-xs">
                            {item.payloadMontado || "-"}
                        </code>
                    </Td>
                    <Td>
                        <StatusBadge status={item.status} />
                    </Td>
                    <Td>{item.tentativas}</Td>
                </tr>
            ))}
        </TabelaBase>
    );
}

function TabelaOcorrencias({ itens }) {
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
            {itens.map((item) => (
                <tr
                    key={item.id}
                    className="border-b border-slate-100"
                >
                    <Td>{formatarData(item.criadoEm)}</Td>
                    <Td>{item.equipamentoNome}</Td>
                    <Td>{item.titulo}</Td>
                    <Td>{formatarStatus(item.tipo)}</Td>
                    <Td>
                        <StatusBadge status={item.status} />
                    </Td>
                    <Td>{item.descricao || "-"}</Td>
                </tr>
            ))}
        </TabelaBase>
    );
}

function TabelaEquipamentos({ itens }) {
    return (
        <TabelaBase
            headers={[
                "Código",
                "Nome",
                "Tipo",
                "Setor",
                "Modelo",
                "Status",
                "IP",
            ]}
        >
            {itens.map((item) => (
                <tr
                    key={item.id}
                    className="border-b border-slate-100"
                >
                    <Td>{item.codigo}</Td>
                    <Td>{item.nome}</Td>
                    <Td>{item.tipo || "-"}</Td>
                    <Td>{item.setor || "-"}</Td>
                    <Td>{item.modelo || "-"}</Td>
                    <Td>
                        <StatusBadge status={item.status} />
                    </Td>
                    <Td>{item.ip || "-"}</Td>
                </tr>
            ))}
        </TabelaBase>
    );
}

function TabelaBase({
                        headers,
                        children,
                    }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">

                <thead className="bg-slate-50 border-y border-slate-200">
                <tr>
                    {headers.map((header) => (
                        <th
                            key={header}
                            className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                        >
                            {header}
                        </th>
                    ))}
                </tr>
                </thead>

                <tbody>
                {children}
                </tbody>

            </table>
        </div>
    );
}

function Td({ children }) {
    return (
        <td className="px-5 py-4 text-[13.5px] text-slate-600">
            {children}
        </td>
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
            <span className="block mb-2 text-sm font-semibold text-slate-700">
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

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short",
        }
    ).format(new Date(data));
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
    "w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default RelatoriosPage;