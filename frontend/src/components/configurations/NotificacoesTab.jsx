import { Bell, Mail, Monitor } from "lucide-react";
import Toggle from "../common/Toggle.jsx";
import { Button } from "../common/Button.jsx";
function NotificacoesTab({
                             configuracoes = [],
                             saving = false,
                             onChange,
                             onSave,
                         }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <header className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Bell size={19} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-950">Notificações</h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Defina quais alertas serão exibidos dentro do sistema.
                        </p>
                    </div>
                </div>

                {configuracoes.length > 0 && (
                    <Button
                        size="small"
                        loading={saving}
                        loadingText="Salvando..."
                        onClick={onSave}
                    >
                        Salvar alterações
                    </Button>
                )}
            </header>

            {configuracoes.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="divide-y divide-slate-100">
                    {configuracoes.map((configuracao) => (
                        <article
                            key={configuracao.tipo}
                            className="grid gap-4 py-4 first:pt-0 last:pb-0 lg:grid-cols-[minmax(220px,1fr)_auto] lg:items-center"
                        >
                            <div className="min-w-0">
                                <h3 className="truncate text-sm font-semibold text-slate-900">
                                    {formatarTipo(configuracao.tipo)}
                                </h3>
                                <p className="mt-0.5 text-[11px] text-slate-500">
                                    Configure os canais usados para este alerta.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <NotificationOption
                                    icon={Monitor}
                                    label="No sistema"
                                    checked={configuracao.notificacaoSistemaAtiva}
                                    disabled={saving}
                                    onChange={(checked) =>
                                        onChange(
                                            configuracao.tipo,
                                            "notificacaoSistemaAtiva",
                                            checked
                                        )
                                    }
                                />
                                <NotificationOption
                                    icon={Mail}
                                    label="E-mail"
                                    complement="Em breve"
                                    checked={false}
                                    disabled
                                    onChange={() => {}}
                                />
                            </div>

                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

function NotificationOption({ icon: Icon, label, complement, checked, disabled, onChange }) {
    return (
        <div className={`flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-2.5 ${disabled ? "bg-slate-50 opacity-70" : "bg-white"}`}>
            <Icon size={14} className="text-slate-400" />
            <span className="whitespace-nowrap text-xs font-medium text-slate-700">{label}</span>
            {complement ? (
                <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[8px] font-bold uppercase text-slate-500">
                    {complement}
                </span>
            ) : (
                <Toggle checked={Boolean(checked)} disabled={disabled} onChange={onChange} label={label} />
            )}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center">
            <Bell size={23} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">Nenhuma configuração encontrada</p>
            <p className="mt-1 text-xs text-slate-500">Ainda não existem tipos de notificação cadastrados.</p>
        </div>
    );
}

const notificationNames = {
    PRODUCAO_INICIADA: "Produção iniciada",
    PRODUCAO_CONCLUIDA: "Produção concluída",
    EQUIPAMENTO_SEM_CONEXAO: "Equipamento sem conexão",
    EQUIPAMENTO_RECONECTADO: "Equipamento reconectado",
    NOVA_OCORRENCIA: "Nova ocorrência",
    OCORRENCIA_CRITICA: "Ocorrência crítica",
    ERRO_IMPRESSAO: "Erro de impressão",
    IMPRESSAO_CONCLUIDA: "Impressão concluída",
};

function formatarTipo(tipo) {
    if (!tipo) return "Notificação";
    if (notificationNames[tipo]) return notificationNames[tipo];
    return tipo.toLowerCase().split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export default NotificacoesTab;
