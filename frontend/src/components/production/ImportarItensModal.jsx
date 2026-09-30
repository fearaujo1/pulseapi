import {
    FileJson,
    Loader2,
    Upload,
    X,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import toast from "react-hot-toast";

const EXEMPLO_ITENS = [
    {
        sequencia: 1,
        referenciaExterna: "ITEM-001",
        valores: {
            FAB: "2026-09-22",
            VAL: "2026-12-21",
            LOTE: "L260001",
        },
    },
    {
        sequencia: 2,
        referenciaExterna: "ITEM-002",
        valores: {
            FAB: "2026-09-22",
            VAL: "2026-12-21",
            LOTE: "L260002",
        },
    },
];

function ImportarItensModal({
                                isOpen,
                                producao,
                                onClose,
                                onImport,
                                loading = false,
                            }) {
    const [conteudo, setConteudo] =
        useState("");

    const [nomeArquivo, setNomeArquivo] =
        useState("");

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setConteudo(
            JSON.stringify(
                EXEMPLO_ITENS,
                null,
                2
            )
        );

        setNomeArquivo("");
    }, [isOpen]);

    async function selecionarArquivo(
        event
    ) {
        const arquivo =
            event.target.files?.[0];

        /*
         * Permite selecionar o mesmo arquivo
         * novamente depois.
         */
        event.target.value = "";

        if (!arquivo) {
            return;
        }

        const nome =
            arquivo.name.toLowerCase();

        const formatoValido =
            nome.endsWith(".json") ||
            nome.endsWith(".txt");

        if (!formatoValido) {
            toast.error(
                "Selecione um arquivo JSON ou TXT."
            );
            return;
        }

        const limiteBytes =
            5 * 1024 * 1024;

        if (arquivo.size > limiteBytes) {
            toast.error(
                "O arquivo deve possuir no máximo 5 MB."
            );
            return;
        }

        try {
            const texto =
                await arquivo.text();

            if (!texto.trim()) {
                toast.error(
                    "O arquivo selecionado está vazio."
                );
                return;
            }

            /*
             * Verifica antecipadamente se o arquivo
             * possui um JSON válido.
             */
            JSON.parse(texto);

            setConteudo(texto);
            setNomeArquivo(arquivo.name);

            toast.success(
                "Arquivo carregado com sucesso."
            );
        } catch (error) {
            console.error(
                "Erro ao ler arquivo:",
                error
            );

            toast.error(
                "O arquivo não possui um JSON válido."
            );
        }
    }

    const resultadoValidacao =
        useMemo(() => {
            if (!conteudo.trim()) {
                return {
                    itens: null,
                    erro: null,
                };
            }

            try {
                const parsed =
                    JSON.parse(conteudo);

                const itens =
                    Array.isArray(parsed)
                        ? parsed
                        : parsed?.itens;

                if (!Array.isArray(itens)) {
                    return {
                        itens: null,
                        erro:
                            "O JSON deve ser uma lista de itens ou possuir a propriedade 'itens'.",
                    };
                }

                if (itens.length === 0) {
                    return {
                        itens: null,
                        erro:
                            "Informe pelo menos um item.",
                    };
                }

                if (itens.length > 500) {
                    return {
                        itens: null,
                        erro:
                            "Cada lote pode possuir no máximo 500 itens.",
                    };
                }

                const sequencias =
                    new Set();

                for (
                    let indice = 0;
                    indice < itens.length;
                    indice++
                ) {
                    const item =
                        itens[indice];

                    if (
                        !item ||
                        typeof item !== "object" ||
                        Array.isArray(item)
                    ) {
                        return {
                            itens: null,
                            erro:
                                `O item ${indice + 1} é inválido.`,
                        };
                    }

                    if (
                        !Number.isInteger(
                            item.sequencia
                        ) ||
                        item.sequencia <= 0
                    ) {
                        return {
                            itens: null,
                            erro:
                                `A sequência do item ${indice + 1} deve ser um número inteiro maior que zero.`,
                        };
                    }

                    if (
                        sequencias.has(
                            item.sequencia
                        )
                    ) {
                        return {
                            itens: null,
                            erro:
                                `A sequência ${item.sequencia} está repetida no lote.`,
                        };
                    }

                    sequencias.add(
                        item.sequencia
                    );

                    if (
                        item.referenciaExterna != null &&
                        typeof item.referenciaExterna !==
                        "string"
                    ) {
                        return {
                            itens: null,
                            erro:
                                `A referência externa do item ${item.sequencia} deve ser um texto.`,
                        };
                    }

                    if (
                        item.referenciaExterna
                            ?.length > 150
                    ) {
                        return {
                            itens: null,
                            erro:
                                `A referência externa do item ${item.sequencia} ultrapassa 150 caracteres.`,
                        };
                    }

                    if (
                        !item.valores ||
                        typeof item.valores !==
                        "object" ||
                        Array.isArray(
                            item.valores
                        ) ||
                        Object.keys(
                            item.valores
                        ).length === 0
                    ) {
                        return {
                            itens: null,
                            erro:
                                `O item ${item.sequencia} deve possuir valores de impressão.`,
                        };
                    }

                    const possuiChaveVazia =
                        Object.keys(
                            item.valores
                        ).some(
                            (chave) =>
                                !chave.trim()
                        );

                    if (possuiChaveVazia) {
                        return {
                            itens: null,
                            erro:
                                `O item ${item.sequencia} possui uma chave vazia em valores.`,
                        };
                    }
                }

                return {
                    itens,
                    erro: null,
                };
            } catch {
                return {
                    itens: null,
                    erro:
                        "O conteúdo informado não é um JSON válido.",
                };
            }
        }, [conteudo]);

    function restaurarExemplo() {
        setConteudo(
            JSON.stringify(
                EXEMPLO_ITENS,
                null,
                2
            )
        );

        setNomeArquivo("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!resultadoValidacao.itens) {
            toast.error(
                resultadoValidacao.erro ||
                "Informe os itens da produção."
            );
            return;
        }

        const payload = {
            itens:
                resultadoValidacao.itens.map(
                    (item) => ({
                        sequencia:
                        item.sequencia,

                        referenciaExterna:
                            item.referenciaExterna
                                ?.trim() ||
                            null,

                        valores:
                        item.valores,
                    })
                ),
        };

        await onImport(payload);
    }

    if (!isOpen || !producao) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 p-4">
            <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <FileJson
                                size={21}
                                className="text-blue-600"
                            />

                            <h2 className="text-lg font-bold text-slate-900">
                                Importar itens
                            </h2>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Produção{" "}
                            <strong>
                                {producao.codigoOrdem}
                            </strong>
                            {" "}— até 500 itens por lote.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
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
                    <div className="min-h-0 flex-1 overflow-y-auto p-6">
                        <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-blue-900">
                                        Formato de importação
                                    </p>

                                    <p className="mt-1 text-xs text-blue-700">
                                        Cole os dados no editor ou selecione
                                        um arquivo JSON/TXT com até 500 itens.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <label
                                        className={`
                    inline-flex h-10 cursor-pointer
                    items-center justify-center gap-2
                    rounded-xl border border-blue-200
                    bg-white px-4 text-xs font-semibold
                    text-blue-700 transition
                    hover:bg-blue-100
                    ${
                                            loading
                                                ? "pointer-events-none opacity-50"
                                                : ""
                                        }
                `}
                                    >
                                        <Upload size={16} />

                                        Selecionar arquivo

                                        <input
                                            type="file"
                                            accept=".json,.txt,application/json,text/plain"
                                            onChange={
                                                selecionarArquivo
                                            }
                                            disabled={loading}
                                            className="hidden"
                                        />
                                    </label>

                                    <button
                                        type="button"
                                        onClick={
                                            restaurarExemplo
                                        }
                                        disabled={loading}
                                        className="h-10 rounded-xl border border-blue-200 bg-white px-4 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                                    >
                                        Restaurar exemplo
                                    </button>
                                </div>
                            </div>

                            {nomeArquivo && (
                                <div className="mt-4 flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-3">
                                    <FileJson
                                        size={17}
                                        className="shrink-0 text-blue-600"
                                    />

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-700">
                                            {nomeArquivo}
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            Arquivo carregado no editor
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-slate-700">
                                Itens em JSON
                            </span>

                            <textarea
                                value={conteudo}
                                onChange={(event) =>
                                    setConteudo(
                                        event.target.value
                                    )
                                }
                                disabled={loading}
                                spellCheck={false}
                                className="min-h-[24rem] w-full resize-y rounded-2xl border border-slate-200 bg-slate-950 p-5 font-mono text-sm leading-6 text-slate-100 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </label>

                        <div
                            className={`
                                mt-4 rounded-xl border px-4 py-3
                                text-sm
                                ${
                                resultadoValidacao.erro
                                    ? "border-red-200 bg-red-50 text-red-700"
                                    : resultadoValidacao.itens
                                        ? "border-green-200 bg-green-50 text-green-700"
                                        : "border-slate-200 bg-slate-50 text-slate-500"
                            }
                            `}
                        >
                            {resultadoValidacao.erro && (
                                <p>
                                    {
                                        resultadoValidacao.erro
                                    }
                                </p>
                            )}

                            {resultadoValidacao.itens && (
                                <p>
                                    JSON válido:{" "}
                                    <strong>
                                        {
                                            resultadoValidacao
                                                .itens
                                                .length
                                        }
                                    </strong>{" "}
                                    item(ns) pronto(s) para importação.
                                </p>
                            )}

                            {!resultadoValidacao.erro &&
                                !resultadoValidacao.itens && (
                                    <p>
                                        Informe os itens que serão importados.
                                    </p>
                                )}
                        </div>
                    </div>

                    <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                !resultadoValidacao.itens
                            }
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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

export default ImportarItensModal;