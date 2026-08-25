import { Monitor, RefreshCw } from "lucide-react";

function formatarEstrategia(estrategia) {
    const labels = {
        DELIMITADO: "Delimitador",
        OFFSET_FIXO: "Offset fixo",
    };

    return labels[estrategia] || estrategia || "-";
}

function PreviewField({ label, value }) {
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

function PreviewEmpty({ children }) {
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

function ImpressaoPreview({
                              preview,
                              previewLoading = false,
                              layoutSelecionado,
                              equipamentoSelecionado,
                              onGenerate,
                          }) {
    return (
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-24">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
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
                    onClick={onGenerate}
                    disabled={!layoutSelecionado || previewLoading}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        size={15}
                        className={previewLoading ? "animate-spin" : ""}
                    />

                    {previewLoading
                        ? "Gerando..."
                        : "Atualizar Prévia"}
                </button>
            </div>

            <div className="rounded-[22px] border border-slate-300 bg-slate-200 p-3 shadow-inner">
                <div className="flex h-12 items-center justify-between rounded-t-xl bg-slate-700 px-4">
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

                        {preview ? "PREVIEW" : "AGUARDANDO"}
                    </span>
                </div>

                <div className="flex min-h-[330px] items-center justify-center border-x border-slate-300 bg-[#f7f7f2] px-8 py-10">
                    {!layoutSelecionado ? (
                        <PreviewEmpty>
                            Selecione um equipamento e um layout para iniciar.
                        </PreviewEmpty>
                    ) : !preview ? (
                        <PreviewEmpty>
                            Preencha os campos e clique em

                            <strong className="mt-1 block text-slate-500">
                                Atualizar Prévia
                            </strong>
                        </PreviewEmpty>
                    ) : (
                        <div className="w-full">
                            <div className="break-words font-mono text-[25px] font-bold leading-[1.5] tracking-wide text-black md:text-[30px] xl:text-[26px] 2xl:text-[30px]">
                                {Object.entries(
                                    preview.valoresFormatados || {}
                                ).map(([chave, valor]) => (
                                    <div key={chave}>
                                        {chave}: {valor}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex min-h-14 flex-col gap-2 rounded-b-xl border border-slate-300 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs text-slate-400">
                            Layout online
                        </p>

                        <p className="text-sm font-bold text-slate-700">
                            {layoutSelecionado?.nomeNaImpressora || "-"}
                        </p>
                    </div>

                    <div className="sm:text-right">
                        <p className="text-xs text-slate-400">
                            Equipamento
                        </p>

                        <p className="text-sm font-semibold text-slate-600">
                            {equipamentoSelecionado?.nome || "-"}
                        </p>
                    </div>
                </div>
            </div>

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
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Payload final
                            </p>

                            <div className="overflow-x-auto rounded-xl bg-slate-950 p-4">
                                <code className="whitespace-nowrap text-sm text-slate-100">
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
    );
}

export default ImpressaoPreview;