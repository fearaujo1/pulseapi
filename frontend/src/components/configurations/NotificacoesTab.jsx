import {
    Bell,
    Loader2,
    Mail,
    Monitor,
} from "lucide-react";

function NotificacoesTab({
                             configuracoes = [],
                             saving = false,
                             onChange,
                             onSave,
                         }) {
    if (configuracoes.length === 0) {
        return (
            <section className="rounded-2xl border border-slate-200 bg-white p-8">
                <div className="flex flex-col items-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <Bell size={22} />
                    </div>

                    <h2 className="mt-4 text-base font-semibold text-slate-900">
                        Nenhuma configuração encontrada
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Ainda não existem tipos de notificação cadastrados.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <div className="space-y-4">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Notificações
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Escolha como cada alerta do sistema deve ser enviado.
                    </p>
                </div>

                <button
                    type="button"
                    disabled={saving}
                    onClick={onSave}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving && (
                        <Loader2
                            size={16}
                            className="animate-spin"
                        />
                    )}

                    {saving
                        ? "Salvando alterações..."
                        : "Salvar alterações"}
                </button>
            </header>

            <div className="space-y-3">
                {configuracoes.map((configuracao) => (
                    <article
                        key={configuracao.tipo}
                        className="rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:border-slate-300"
                    >
                        <div className="grid gap-4 lg:grid-cols-[minmax(240px,1fr)_auto] lg:items-center">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Bell size={19} />
                                </div>

                                <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                                    {formatarTipo(
                                        configuracao.tipo
                                    )}
                                </h3>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <OpcaoNotificacao
                                    icon={Monitor}
                                    label="No sistema"
                                    checked={
                                        configuracao
                                            .notificacaoSistemaAtiva
                                    }
                                    disabled={saving}
                                    onChange={(checked) =>
                                        onChange(
                                            configuracao.tipo,
                                            "notificacaoSistemaAtiva",
                                            checked
                                        )
                                    }
                                />

                                <OpcaoNotificacao
                                    icon={Mail}
                                    label="Por e-mail"
                                    complemento="Em breve"
                                    checked={false}
                                    disabled
                                    onChange={() => {}}
                                />
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}

function OpcaoNotificacao({
                              icon: Icon,
                              label,
                              complemento,
                              checked,
                              disabled,
                              onChange,
                          }) {
    return (
        <label
            className={`
                flex items-center gap-3 rounded-xl border
                border-slate-200 px-3 py-2.5
                ${disabled
                ? "cursor-not-allowed bg-slate-50 opacity-70"
                : "cursor-pointer bg-white"
            }
            `}
        >
            <Icon
                size={17}
                className="text-slate-500"
            />

            <span className="whitespace-nowrap text-sm font-medium text-slate-700">
                {label}
            </span>

            {complemento && (
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    {complemento}
                </span>
            )}

            <input
                type="checkbox"
                checked={Boolean(checked)}
                disabled={disabled}
                onChange={(event) =>
                    onChange(event.target.checked)
                }
                className="h-4 w-4 accent-blue-600"
            />
        </label>
    );
}

const nomesTiposNotificacao = {
    PRODUCAO_INICIADA:
        "Produção iniciada",

    PRODUCAO_CONCLUIDA:
        "Produção concluída",

    EQUIPAMENTO_SEM_CONEXAO:
        "Equipamento sem conexão",

    EQUIPAMENTO_RECONECTADO:
        "Equipamento reconectado",

    NOVA_OCORRENCIA:
        "Nova ocorrência",

    OCORRENCIA_CRITICA:
        "Ocorrência crítica",

    ERRO_IMPRESSAO:
        "Erro de impressão",

    IMPRESSAO_CONCLUIDA:
        "Impressão concluída",
};

function formatarTipo(tipo) {
    if (!tipo) {
        return "Notificação";
    }

    if (nomesTiposNotificacao[tipo]) {
        return nomesTiposNotificacao[tipo];
    }

    return tipo
        .toLowerCase()
        .split("_")
        .map((palavra) =>
            palavra.charAt(0).toUpperCase()
            + palavra.slice(1)
        )
        .join(" ");
}

export default NotificacoesTab;