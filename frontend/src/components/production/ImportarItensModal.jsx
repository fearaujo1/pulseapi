import {
    AlertCircle,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    Loader2,
    Upload,
    X,
} from "lucide-react";

import {
    DataTable,
    TableText,
} from "../common/table/index.js";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import toast from "react-hot-toast";

import {
    layoutImpressaoService,
} from "../../services/layoutImpressaoService.js";

const TAMANHO_MAXIMO_ARQUIVO =
    5 * 1024 * 1024;

const QUANTIDADE_MAXIMA_ITENS =
    500;

function ImportarItensModal({
                                isOpen,
                                producao,
                                onClose,
                                onImport,
                                loading = false,
                            }) {
    const [layout, setLayout] =
        useState(null);

    const [loadingLayout, setLoadingLayout] =
        useState(false);

    const [erroLayout, setErroLayout] =
        useState("");

    const [arquivo, setArquivo] =
        useState(null);

    const [resultado, setResultado] =
        useState(null);

    const [erroArquivo, setErroArquivo] =
        useState("");

    useEffect(() => {
        if (
            !isOpen ||
            !producao?.layoutPrincipalId
        ) {
            return;
        }

        let ativo = true;

        setLayout(null);
        setArquivo(null);
        setResultado(null);
        setErroArquivo("");
        setErroLayout("");
        setLoadingLayout(true);

        layoutImpressaoService
            .buscarPorId(
                producao.layoutPrincipalId
            )
            .then((data) => {
                if (!ativo) {
                    return;
                }

                setLayout(data);
            })
            .catch((error) => {
                if (!ativo) {
                    return;
                }

                console.error(
                    "Erro ao carregar layout:",
                    error
                );

                setErroLayout(
                    error.response?.data?.detail ||
                    error.response?.data?.message ||
                    "Não foi possível carregar os campos do layout."
                );
            })
            .finally(() => {
                if (ativo) {
                    setLoadingLayout(false);
                }
            });

        return () => {
            ativo = false;
        };
    }, [
        isOpen,
        producao?.layoutPrincipalId,
    ]);

    const camposEsperados =
        useMemo(() => {
            if (
                !Array.isArray(layout?.campos)
            ) {
                return [];
            }

            return layout.campos
                .map((campo) =>
                    campo?.chave?.trim()
                )
                .filter(Boolean);
        }, [layout]);

    async function selecionarArquivo(
        event
    ) {
        const arquivoSelecionado =
            event.target.files?.[0];

        /*
         * Permite selecionar novamente
         * o mesmo arquivo.
         */
        event.target.value = "";

        if (!arquivoSelecionado) {
            return;
        }

        setArquivo(null);
        setResultado(null);
        setErroArquivo("");

        if (
            !arquivoSelecionado.name
                .toLowerCase()
                .endsWith(".csv")
        ) {
            const mensagem =
                "Selecione um arquivo com extensão .csv.";

            setErroArquivo(mensagem);
            toast.error(mensagem);
            return;
        }

        if (
            arquivoSelecionado.size >
            TAMANHO_MAXIMO_ARQUIVO
        ) {
            const mensagem =
                "O arquivo CSV não pode ultrapassar 5 MB.";

            setErroArquivo(mensagem);
            toast.error(mensagem);
            return;
        }

        if (camposEsperados.length === 0) {
            const mensagem =
                "O layout selecionado não possui campos configurados.";

            setErroArquivo(mensagem);
            toast.error(mensagem);
            return;
        }

        try {
            const conteudo =
                await arquivoSelecionado.text();

            const dados =
                processarCsv(
                    conteudo,
                    camposEsperados
                );

            setArquivo(arquivoSelecionado);
            setResultado(dados);
            setErroArquivo("");

            toast.success(
                `${dados.linhas.length} item(ns) identificado(s) no arquivo.`
            );
        } catch (error) {
            console.error(
                "Erro ao validar CSV:",
                error
            );

            const mensagem =
                error instanceof Error
                    ? error.message
                    : "Não foi possível validar o arquivo CSV.";

            setErroArquivo(mensagem);
            toast.error(mensagem);
        }
    }

    function removerArquivo() {
        if (loading) {
            return;
        }

        setArquivo(null);
        setResultado(null);
        setErroArquivo("");
    }

    function baixarModelo() {
        if (camposEsperados.length === 0) {
            toast.error(
                "O layout não possui campos configurados."
            );
            return;
        }

        const cabecalho =
            camposEsperados
                .map(escaparValorCsv)
                .join(";");

        /*
         * BOM facilita a abertura correta
         * de caracteres UTF-8 no Excel.
         */
        const conteudo =
            `\uFEFF${cabecalho}\r\n`;

        const blob =
            new Blob(
                [conteudo],
                {
                    type:
                        "text/csv;charset=utf-8;",
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        const nomeLayout =
            normalizarNomeArquivo(
                layout?.nome ||
                producao?.layoutPrincipalNome ||
                "layout"
            );

        link.href = url;
        link.download =
            `modelo-${nomeLayout}.csv`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!arquivo || !resultado) {
            toast.error(
                "Selecione e valide um arquivo CSV."
            );
            return;
        }

        await onImport(arquivo);
    }

    if (!isOpen || !producao) {
        return null;
    }

    const bloqueado =
        loading || loadingLayout;


    const colunasPrevia = useMemo(() => {
        if (!resultado?.cabecalhos) {
            return [];
        }

        return [
            {
                key: "numero",
                header: "#",
                width: "4rem",
                render: (_, indice) => (
                    <span className="font-semibold tabular-nums text-slate-400">
                    {indice + 1}
                </span>
                ),
            },
            ...resultado.cabecalhos.map(
                (cabecalho, indiceColuna) => ({
                    key: `coluna-${indiceColuna}`,
                    header: cabecalho,
                    width: "12rem",
                    render: (linha) => (
                        <TableText
                            title={
                                linha[indiceColuna]
                            }
                            className="max-w-xs"
                        >
                            {linha[
                                indiceColuna
                                ] || "—"}
                        </TableText>
                    ),
                })
            ),
        ];
    }, [resultado?.cabecalhos]);

    const linhasPrevia = useMemo(() => {
        return resultado?.linhas?.slice(0, 5) || [];
    }, [resultado?.linhas]);

    const larguraMinimaPrevia = useMemo(() => {
        const quantidadeColunas =
            resultado?.cabecalhos?.length || 0;

        return `${Math.max(
            36,
            quantidadeColunas * 12 + 4
        )}rem`;
    }, [resultado?.cabecalhos]);

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm">
            <div className="flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <FileSpreadsheet
                                    size={21}
                                />
                            </div>

                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    Importar itens por CSV
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Produção{" "}
                                    <strong className="text-slate-700">
                                        {
                                            producao
                                                .codigoOrdem
                                        }
                                    </strong>
                                    {" "}— até 500 itens.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={bloqueado}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Fechar"
                    >
                        <X size={20} />
                    </button>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#f4f6f9] p-4 lg:p-5">
                        <section className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-900">
                                        Layout de impressão
                                    </p>

                                    <p className="mt-1 text-sm text-slate-600">
                                        {layout?.nome ||
                                            producao
                                                .layoutPrincipalNome ||
                                            "Carregando layout..."}
                                    </p>

                                    <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">
                                        O cabeçalho do CSV deve possuir
                                        exatamente os campos do layout.
                                        A ordem das colunas pode ser
                                        diferente, mas não podem existir
                                        campos adicionais, ausentes ou
                                        duplicados.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={baixarModelo}
                                    disabled={
                                        bloqueado ||
                                        camposEsperados
                                            .length === 0
                                    }
                                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Download size={16} />
                                    Baixar modelo
                                </button>
                            </div>

                            {loadingLayout && (
                                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />

                                    Carregando campos do layout...
                                </div>
                            )}

                            {erroLayout && (
                                <MensagemValidacao
                                    tipo="erro"
                                    mensagem={erroLayout}
                                />
                            )}

                            {!loadingLayout &&
                                !erroLayout &&
                                camposEsperados.length >
                                0 && (
                                    <div className="mt-4">
                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Colunas esperadas
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {camposEsperados.map(
                                                (campo) => (
                                                    <span
                                                        key={campo}
                                                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 font-mono text-xs font-semibold text-blue-700"
                                                    >
                                                        {campo}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                        </section>

                        <section>
                            <p className="mb-2 text-xs font-semibold text-slate-800">
                                Arquivo CSV
                            </p>

                            {!arquivo ? (
                                <label
                                    className={`
                                        flex min-h-44 cursor-pointer
                                        flex-col items-center justify-center
                                        rounded-2xl border-2
                                        border-dashed border-slate-300
                                        bg-slate-50 px-6 py-8
                                        text-center transition
                                        hover:border-blue-400
                                        hover:bg-blue-50/50
                                        ${
                                        bloqueado ||
                                        Boolean(
                                            erroLayout
                                        )
                                            ? "pointer-events-none opacity-50"
                                            : ""
                                    }
                                    `}
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                                        <Upload size={22} />
                                    </div>

                                    <p className="mt-4 text-xs font-semibold text-slate-800">
                                        Selecionar arquivo CSV
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Apenas .csv, com no máximo
                                        5 MB e 500 registros
                                    </p>

                                    <input
                                        type="file"
                                        accept=".csv,text/csv"
                                        onChange={
                                            selecionarArquivo
                                        }
                                        disabled={
                                            bloqueado ||
                                            Boolean(
                                                erroLayout
                                            )
                                        }
                                        className="hidden"
                                    />
                                </label>
                            ) : (
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600">
                                                <FileSpreadsheet
                                                    size={20}
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-semibold text-slate-800">
                                                    {arquivo.name}
                                                </p>

                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    {formatarTamanho(
                                                        arquivo.size
                                                    )}
                                                    {" • "}
                                                    {
                                                        resultado
                                                            ?.linhas
                                                            ?.length
                                                    }{" "}
                                                    item(ns)
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={
                                                removerArquivo
                                            }
                                            disabled={loading}
                                            className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-red-600 disabled:opacity-50"
                                            title="Remover arquivo"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {erroArquivo && (
                                <MensagemValidacao
                                    tipo="erro"
                                    mensagem={erroArquivo}
                                />
                            )}

                            {resultado && (
                                <MensagemValidacao
                                    tipo="sucesso"
                                    mensagem={`${resultado.linhas.length} item(ns) validado(s). O arquivo está pronto para importação.`}
                                />
                            )}
                        </section>

                        {resultado && (
                            <section>
                                <div className="flex flex-col gap-2 rounded-t-xl border border-b-0 border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="text-xs font-semibold text-slate-900">
                                            Prévia dos dados
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Exibindo até os cinco primeiros registros.
                                        </p>
                                    </div>

                                    <span className="text-xs font-medium text-slate-500">
                                        Separador identificado:{" "}
                                                                <strong className="font-mono text-slate-700">
                                            {formatarDelimitador(
                                                resultado.delimitador
                                            )}
                                        </strong>
                                    </span>
                                </div>

                                <div className="[&>div]:rounded-t-none">
                                    <DataTable
                                        columns={colunasPrevia}
                                        data={linhasPrevia}
                                        minWidth={
                                            larguraMinimaPrevia
                                        }
                                        rowKey={(_, indice) =>
                                            `previa-${indice}`
                                        }
                                        emptyIcon={
                                            FileSpreadsheet
                                        }
                                        emptyTitle="Nenhum registro válido"
                                        emptyDescription="O arquivo não possui linhas disponíveis para pré-visualização."
                                    />
                                </div>
                            </section>
                        )}
                    </div>

                    <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={bloqueado}
                            className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={
                                bloqueado ||
                                !arquivo ||
                                !resultado
                            }
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <Loader2
                                    size={17}
                                    className="animate-spin"
                                />
                            ) : (
                                <Upload size={17} />
                            )}

                            {loading
                                ? "Importando..."
                                : "Importar itens"}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}

function MensagemValidacao({
                               tipo,
                               mensagem,
                           }) {
    const sucesso =
        tipo === "sucesso";

    return (
        <div
            className={`
                mt-3 flex items-start gap-2
                rounded-xl border px-4 py-3
                text-sm
                ${
                sucesso
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
            }
            `}
        >
            {sucesso ? (
                <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0"
                />
            ) : (
                <AlertCircle
                    size={17}
                    className="mt-0.5 shrink-0"
                />
            )}

            <p>{mensagem}</p>
        </div>
    );
}

function processarCsv(
    conteudoOriginal,
    camposEsperados
) {
    let conteudo =
        conteudoOriginal || "";

    if (
        conteudo.length > 0 &&
        conteudo.charAt(0) === "\uFEFF"
    ) {
        conteudo =
            conteudo.substring(1);
    }

    conteudo = conteudo
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");

    const linhasArquivo =
        conteudo.split("\n");

    const linhasNaoVazias =
        linhasArquivo.filter(
            (linha) => linha.trim()
        );

    if (linhasNaoVazias.length === 0) {
        throw new Error(
            "O arquivo CSV está vazio."
        );
    }

    const linhaCabecalho =
        linhasNaoVazias[0];

    const delimitador =
        detectarDelimitador(
            linhaCabecalho
        );

    const cabecalhos =
        analisarLinhaCsv(
            linhaCabecalho,
            delimitador,
            1
        ).map((cabecalho) =>
            cabecalho.trim()
        );

    validarCabecalhos(
        cabecalhos,
        camposEsperados
    );

    const linhas =
        linhasNaoVazias
            .slice(1)
            .map((linha, indice) =>
                analisarLinhaCsv(
                    linha,
                    delimitador,
                    indice + 2
                )
            );

    if (linhas.length === 0) {
        throw new Error(
            "O arquivo CSV não possui itens para importação."
        );
    }

    if (
        linhas.length >
        QUANTIDADE_MAXIMA_ITENS
    ) {
        throw new Error(
            `O arquivo pode possuir no máximo ${QUANTIDADE_MAXIMA_ITENS} itens.`
        );
    }

    linhas.forEach(
        (linha, indice) => {
            if (
                linha.length !==
                cabecalhos.length
            ) {
                throw new Error(
                    `A linha ${indice + 2} possui ${linha.length} colunas, mas o cabeçalho possui ${cabecalhos.length}.`
                );
            }
        }
    );

    return {
        cabecalhos,
        linhas,
        delimitador,
    };
}

function validarCabecalhos(
    cabecalhos,
    camposEsperados
) {
    if (
        cabecalhos.some(
            (cabecalho) =>
                !cabecalho.trim()
        )
    ) {
        throw new Error(
            "O cabeçalho possui uma coluna sem nome."
        );
    }

    const normalizados =
        cabecalhos.map(
            normalizarCabecalho
        );

    if (
        new Set(normalizados).size !==
        normalizados.length
    ) {
        throw new Error(
            "O cabeçalho possui colunas duplicadas."
        );
    }

    const esperadosNormalizados =
        camposEsperados.map(
            normalizarCabecalho
        );

    const faltantes =
        camposEsperados.filter(
            (_, indice) =>
                !normalizados.includes(
                    esperadosNormalizados[
                        indice
                        ]
                )
        );

    const adicionais =
        cabecalhos.filter(
            (cabecalho) =>
                !esperadosNormalizados.includes(
                    normalizarCabecalho(
                        cabecalho
                    )
                )
        );

    if (
        faltantes.length === 0 &&
        adicionais.length === 0
    ) {
        return;
    }

    const partes = [];

    if (faltantes.length > 0) {
        partes.push(
            `campos ausentes: ${faltantes.join(", ")}`
        );
    }

    if (adicionais.length > 0) {
        partes.push(
            `campos não reconhecidos: ${adicionais.join(", ")}`
        );
    }

    throw new Error(
        `O cabeçalho não corresponde ao layout: ${partes.join("; ")}.`
    );
}

function detectarDelimitador(
    linha
) {
    const pontoVirgula =
        contarDelimitador(
            linha,
            ";"
        );

    const virgula =
        contarDelimitador(
            linha,
            ","
        );

    if (
        pontoVirgula === 0 &&
        virgula === 0
    ) {
        return ";";
    }

    return pontoVirgula >= virgula
        ? ";"
        : ",";
}

function contarDelimitador(
    linha,
    delimitador
) {
    let dentroDeAspas = false;
    let quantidade = 0;

    for (
        let indice = 0;
        indice < linha.length;
        indice++
    ) {
        const caractere =
            linha[indice];

        if (caractere === "\"") {
            if (
                dentroDeAspas &&
                linha[indice + 1] === "\""
            ) {
                indice++;
                continue;
            }

            dentroDeAspas =
                !dentroDeAspas;
            continue;
        }

        if (
            caractere === delimitador &&
            !dentroDeAspas
        ) {
            quantidade++;
        }
    }

    return quantidade;
}

function analisarLinhaCsv(
    linha,
    delimitador,
    numeroLinha
) {
    const colunas = [];
    let valorAtual = "";
    let dentroDeAspas = false;

    for (
        let indice = 0;
        indice < linha.length;
        indice++
    ) {
        const caractere =
            linha[indice];

        if (caractere === "\"") {
            if (
                dentroDeAspas &&
                linha[indice + 1] === "\""
            ) {
                valorAtual += "\"";
                indice++;
            } else {
                dentroDeAspas =
                    !dentroDeAspas;
            }

            continue;
        }

        if (
            caractere === delimitador &&
            !dentroDeAspas
        ) {
            colunas.push(
                valorAtual.trim()
            );

            valorAtual = "";
            continue;
        }

        valorAtual += caractere;
    }

    if (dentroDeAspas) {
        throw new Error(
            `A linha ${numeroLinha} possui aspas não finalizadas.`
        );
    }

    colunas.push(
        valorAtual.trim()
    );

    return colunas;
}

function normalizarCabecalho(valor) {
    return String(valor || "")
        .trim()
        .toUpperCase();
}

function escaparValorCsv(valor) {
    const texto =
        String(valor ?? "");

    if (
        texto.includes(";") ||
        texto.includes("\"") ||
        texto.includes("\n")
    ) {
        return `"${texto.replace(
            /"/g,
            "\"\""
        )}"`;
    }

    return texto;
}

function normalizarNomeArquivo(valor) {
    return String(valor || "layout")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^a-zA-Z0-9_-]+/g,
            "-"
        )
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();
}

function formatarTamanho(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(
            bytes / 1024
        ).toFixed(1)} KB`;
    }

    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(1)} MB`;
}

export default ImportarItensModal;


function formatarDelimitador(
    delimitador
) {
    if (!delimitador) {
        return "Não identificado";
    }

    const nomes = {
        ",": "Vírgula (,)",
        ";": "Ponto e vírgula (;)",
        "\t": "Tabulação",
        "|": "Barra vertical (|)",
    };

    return (
        nomes[delimitador] ||
        delimitador
    );
}