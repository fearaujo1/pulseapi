import { X } from "lucide-react";

function FilaImpressaoDetalhesModal({
                                        item,
                                        onClose,
                                    }) {
    if (!item) {
        return null;
    }

    function formatarData(data) {
        if (!data) return "-";

        return new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "short",
            timeStyle: "medium",
        }).format(new Date(data));
    }

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-950">
                            Detalhes da Impressão
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Registro #{item.id}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
                        title="Fechar"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <DetailField
                            label="Equipamento"
                            value={item.equipamentoNome}
                        />

                        <DetailField
                            label="Layout"
                            value={item.layoutNome}
                        />

                        <DetailField
                            label="Ordem da Fila"
                            value={item.ordemFila}
                        />

                        <DetailField
                            label="Tentativas"
                            value={item.tentativas}
                        />

                        <DetailField
                            label="Criado em"
                            value={formatarData(item.criadoEm)}
                        />

                        <DetailField
                            label="Enviado em"
                            value={formatarData(item.enviadoEm)}
                        />

                        <DetailField
                            label="Impresso em"
                            value={formatarData(item.impressoEm)}
                        />

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Status
                            </p>

                            <div className="mt-2">
                                <FilaStatusBadge status={item.status} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                            Valores
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {item.valores &&
                            Object.keys(item.valores).length > 0 ? (
                                Object.entries(item.valores).map(
                                    ([chave, valor]) => (
                                        <div
                                            key={chave}
                                            className="rounded-xl bg-slate-50 border border-slate-200 p-4"
                                        >
                                            <p className="text-xs text-slate-400 font-semibold">
                                                {chave}
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                                {valor}
                                            </p>
                                        </div>
                                    )
                                )
                            ) : (
                                <p className="text-sm text-slate-500">
                                    Nenhum valor registrado.
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                            Payload Montado
                        </p>

                        <div className="rounded-xl bg-slate-950 p-4 overflow-x-auto">
                            <code className="text-sm text-slate-100">
                                {item.payloadMontado || "-"}
                            </code>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                            Contadores
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <CounterCard
                                label="Antes do envio"
                                value={item.contadorAntesEnvio}
                            />

                            <CounterCard
                                label="Carregamento"
                                value={item.contadorCarregamento}
                            />

                            <CounterCard
                                label="Após impressão"
                                value={item.contadorAposImpressao}
                            />
                        </div>
                    </div>

                    {item.mensagemErro && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
                                Erro
                            </p>

                            <p className="mt-1 text-sm text-red-700">
                                {item.mensagemErro}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailField({
                         label,
                         value,
                     }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-1 text-[15px] font-semibold text-slate-800">
                {value ?? "-"}
            </p>
        </div>
    );
}

function CounterCard({
                         label,
                         value,
                     }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
                {label}
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
                {value ?? "-"}
            </p>
        </div>
    );
}

function FilaStatusBadge({
                             status,
                         }) {
    const styles = {
        PENDENTE:
            "bg-amber-50 text-amber-700",

        ENVIANDO:
            "bg-blue-50 text-blue-700",

        ENVIADO_FIFO:
            "bg-violet-50 text-violet-700",

        PRONTO_IMPRESSAO:
            "bg-indigo-50 text-indigo-700",

        IMPRESSO:
            "bg-green-50 text-green-700",

        ERRO:
            "bg-red-50 text-red-700",

        CANCELADO:
            "bg-slate-100 text-slate-600",
    };

    const labels = {
        PENDENTE: "Pendente",
        ENVIANDO: "Enviando",
        ENVIADO_FIFO: "Enviado ao FIFO",
        PRONTO_IMPRESSAO: "Pronto para impressão",
        IMPRESSO: "Impresso",
        ERRO: "Erro",
        CANCELADO: "Cancelado",
    };

    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                styles[status] ||
                "bg-slate-100 text-slate-600"
            }`}
        >
            {labels[status] || status || "-"}
        </span>
    );
}

export default FilaImpressaoDetalhesModal;