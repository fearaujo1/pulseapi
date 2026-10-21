import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import Topbar from "../components/layout/Topbar.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import ContentCard from "../components/common/ContentCard.jsx";
import RelatorioFilters from "../components/reports/RelatorioFilters.jsx";
import RelatorioSummary from "../components/reports/RelatorioSummary.jsx";
import ResultadoGeral from "../components/reports/ResultadoGeral.jsx";
import ResultadoDetalhado from "../components/reports/ResultadoDetalhado.jsx";
import usePagination from "../hooks/usePagination.js";
import { relatorioService } from "../services/relatorioService.js";
import { equipamentosService } from "../services/equipamentosService.js";
import { layoutImpressaoService } from "../services/layoutImpressaoService.js";

function RelatoriosPage() {
    const hoje = formatarDataInput(new Date());

    const [filtros, setFiltros] = useState({
        tipoRelatorio: "GERAL",
        dataInicial: criarPrimeiroDiaMes(),
        dataFinal: hoje,
        equipamentoId: "",
        status: "",
        tipoOcorrencia: "",
        layoutId: "",
    });

    const [equipamentos, setEquipamentos] = useState([]);
    const [layouts, setLayouts] = useState([]);
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function carregarEquipamentos() {
            try {
                const data = await equipamentosService.listar();
                setEquipamentos(Array.isArray(data) ? data : []);
            } catch (error) {
                mostrarErro(error, "Não foi possível carregar os equipamentos.");
                setEquipamentos([]);
            }
        }

        carregarEquipamentos();
    }, []);

    useEffect(() => {
        if (filtros.tipoRelatorio !== "IMPRESSOES") {
            setLayouts([]);
            return;
        }

        async function carregarLayouts() {
            try {
                const data = filtros.equipamentoId
                    ? await layoutImpressaoService.listarPorEquipamento(
                        filtros.equipamentoId
                    )
                    : await layoutImpressaoService.listar();

                const ativos = Array.isArray(data)
                    ? data.filter((layout) => layout.ativo)
                    : [];

                setLayouts(ativos);
                setFiltros((anteriores) => ({
                    ...anteriores,
                    layoutId: ativos.some(
                        (layout) => String(layout.id) === String(anteriores.layoutId)
                    )
                        ? anteriores.layoutId
                        : "",
                }));
            } catch (error) {
                mostrarErro(error, "Não foi possível carregar os layouts.");
                setLayouts([]);
                setFiltros((anteriores) => ({ ...anteriores, layoutId: "" }));
            }
        }

        carregarLayouts();
    }, [filtros.tipoRelatorio, filtros.equipamentoId]);

    function alterarFiltro(campo, valor) {
        if (campo === "tipoRelatorio") {
            setFiltros((anteriores) => ({
                ...anteriores,
                tipoRelatorio: valor,
                equipamentoId: "",
                status: "",
                tipoOcorrencia: "",
                layoutId: "",
            }));

            setResultado(null);
            setSearch("");
            resetPage();
            return;
        }

        setFiltros((anteriores) => ({ ...anteriores, [campo]: valor }));
    }

    function validarPeriodo() {
        if (filtros.tipoRelatorio === "EQUIPAMENTOS") return true;

        if (!filtros.dataInicial || !filtros.dataFinal) {
            toast.error("Informe a data inicial e a data final.");
            return false;
        }

        if (filtros.dataInicial > filtros.dataFinal) {
            toast.error("A data inicial não pode ser posterior à data final.");
            return false;
        }

        return true;
    }

    function criarFiltrosRequisicao() {
        return {
            dataInicial: filtros.dataInicial,
            dataFinal: filtros.dataFinal,
            equipamentoId: filtros.equipamentoId || undefined,
            status: filtros.status || undefined,
            layoutId: filtros.layoutId || undefined,
            tipo: filtros.tipoOcorrencia || undefined,
        };
    }

    async function gerarRelatorio() {
        if (!validarPeriodo()) return;

        try {
            setLoading(true);
            const parametros = criarFiltrosRequisicao();
            let data;

            switch (filtros.tipoRelatorio) {
                case "GERAL":
                    data = await relatorioService.gerarRelatorioGeral(parametros);
                    break;
                case "IMPRESSOES":
                    data = await relatorioService.gerarRelatorioImpressoes(parametros);
                    break;
                case "OCORRENCIAS":
                    data = await relatorioService.gerarRelatorioOcorrencias(parametros);
                    break;
                case "EQUIPAMENTOS":
                    data = await relatorioService.gerarRelatorioEquipamentos();
                    break;
                default:
                    throw new Error("Tipo de relatório inválido.");
            }

            setResultado(data);
            setSearch("");
        } catch (error) {
            mostrarErro(error, "Não foi possível gerar o relatório.");
        } finally {
            setLoading(false);
        }
    }

    async function exportarPdf() {
        if (!validarPeriodo()) return;

        try {
            setExportLoading(true);
            const parametros = criarFiltrosRequisicao();
            let blob;
            let nomeArquivo;

            switch (filtros.tipoRelatorio) {
                case "GERAL":
                    blob = await relatorioService.exportarPdfGeral(parametros);
                    nomeArquivo = `relatorio-geral-${filtros.dataInicial}-a-${filtros.dataFinal}.pdf`;
                    break;
                case "IMPRESSOES":
                    blob = await relatorioService.exportarPdfImpressoes(parametros);
                    nomeArquivo = `relatorio-impressoes-${filtros.dataInicial}-a-${filtros.dataFinal}.pdf`;
                    break;
                case "OCORRENCIAS":
                    blob = await relatorioService.exportarPdfOcorrencias(parametros);
                    nomeArquivo = `relatorio-ocorrencias-${filtros.dataInicial}-a-${filtros.dataFinal}.pdf`;
                    break;
                case "EQUIPAMENTOS":
                    blob = await relatorioService.exportarPdfEquipamentos();
                    nomeArquivo = `relatorio-equipamentos-${hoje}.pdf`;
                    break;
                default:
                    throw new Error("Tipo de relatório inválido.");
            }

            if (!blob) throw new Error("O arquivo não foi recebido.");

            baixarArquivo(blob, nomeArquivo);
            toast.success("Relatório exportado com sucesso.");
        } catch (error) {
            mostrarErro(error, "Não foi possível exportar o relatório.");
        } finally {
            setExportLoading(false);
        }
    }

    const itensFiltrados = useMemo(() => {
        if (
            filtros.tipoRelatorio === "GERAL" ||
            !Array.isArray(resultado?.itens)
        ) {
            return [];
        }

        const termo = search.trim().toLowerCase();
        if (!termo) return resultado.itens;

        return resultado.itens.filter((item) =>
            JSON.stringify(item).toLowerCase().includes(termo)
        );
    }, [resultado, search, filtros.tipoRelatorio]);

    const {
        currentPage,
        totalPages,
        paginatedItems: itensPaginados,
        setCurrentPage,
        resetPage,
    } = usePagination(itensFiltrados, 10);

    function alterarBusca(valor) {
        setSearch(valor);
        resetPage();
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="mx-auto w-full max-w-[1800px] px-4 py-5 md:px-6 lg:px-8">
                <PageHeader
                    title="Relatórios"
                    description="Consulte, analise e exporte informações operacionais do sistema"
                />

                <ContentCard
                    title="Configuração do relatório"
                    subtitle="Selecione o tipo, período e critérios da consulta"
                    className="mb-5"
                >
                    <RelatorioFilters
                        filtros={filtros}
                        equipamentos={equipamentos}
                        layouts={layouts}
                        hoje={hoje}
                        loading={loading}
                        exportLoading={exportLoading}
                        onChange={alterarFiltro}
                        onGerar={gerarRelatorio}
                        onExportar={exportarPdf}
                    />
                </ContentCard>

                {resultado && (
                    <>
                        <RelatorioSummary
                            tipo={filtros.tipoRelatorio}
                            resultado={resultado}
                        />

                        {filtros.tipoRelatorio === "GERAL" ? (
                            <ResultadoGeral resultado={resultado} />
                        ) : (
                            <ResultadoDetalhado
                                tipo={filtros.tipoRelatorio}
                                total={resultado.itens?.length || 0}
                                itens={itensPaginados}
                                search={search}
                                onSearchChange={alterarBusca}
                                currentPage={currentPage}
                                totalPages = {totalPages}
                                onPageChange = {setCurrentPage}
                            />
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

function criarPrimeiroDiaMes() {
    const data = new Date();
    data.setDate(1);
    return formatarDataInput(data);
}

function formatarDataInput(data) {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

function baixarArquivo(blob, nome) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nome;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

function mostrarErro(error, fallback) {
    console.error(fallback, error);
    toast.error(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        fallback
    );
}

export default RelatoriosPage;
