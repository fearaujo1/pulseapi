import { Building2, Clock3, Plus, Save, ShieldCheck } from "lucide-react";
import { Button } from "../common/Button.jsx";
import FormField from "../common/FormField.jsx";
import Toggle from "../common/Toggle.jsx";
import { inputClass } from "../common/formStyles.js";
import TurnoRow from "./TurnoRow.jsx";

function GeralTab({
                      empresa,
                      atualizarCampoEmpresa,
                      salvarEmpresa,
                      savingEmpresa,
                      configGeral,
                      setConfigGeral,
                      salvarConfiguracaoGeral,
                      savingConfig,
                      turnos,
                      novoTurno,
                      editarTurno,
                      excluirTurno,
                  }) {
    return (
        <div className="space-y-5">
            {/* SEÇÃO: INFORMAÇÕES DA EMPRESA */}
            <SettingsCard
                icon={Building2}
                title="Informações da empresa"
                description="Identificação e contatos utilizados pelo sistema"
                action={
                    <Button
                        variant="softPrimary"
                        size="small"
                        icon={Save}
                        loading={savingEmpresa}
                        loadingText="Salvando..."
                        onClick={salvarEmpresa}
                    >
                        Salvar empresa
                    </Button>
                }
            >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <CompanyInput
                        label="Razão social"
                        field="razaoSocial"
                        empresa={empresa}
                        onChange={atualizarCampoEmpresa}
                    />
                    <CompanyInput
                        label="Nome fantasia"
                        field="nomeFantasia"
                        empresa={empresa}
                        onChange={atualizarCampoEmpresa}
                    />
                    <CompanyInput
                        label="CNPJ"
                        field="cnpj"
                        empresa={empresa}
                        onChange={atualizarCampoEmpresa}
                    />
                    <CompanyInput
                        label="Telefone"
                        field="telefone"
                        empresa={empresa}
                        onChange={atualizarCampoEmpresa}
                    />
                    <CompanyInput
                        label="E-mail"
                        field="email"
                        type="email"
                        empresa={empresa}
                        onChange={atualizarCampoEmpresa}
                        className="md:col-span-2"
                    />
                </div>
            </SettingsCard>

            {/* SEÇÃO: CONTROLE DE ACESSO */}
            <SettingsCard
                icon={ShieldCheck}
                title="Controle de acesso por turno"
                description="Restrinja o login dos operadores aos horários permitidos"
                action={
                    <Button
                        variant="softPrimary"
                        size="small"
                        icon={Save}
                        loading={savingConfig}
                        loadingText="Salvando..."
                        onClick={salvarConfiguracaoGeral}
                    >
                        Salvar controle
                    </Button>
                }
            >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Restrição de horário</p>
                            <p className="mt-0.5 text-xs text-slate-500">Autoriza o login somente dentro do turno e da tolerância.</p>
                        </div>
                        <Toggle
                            checked={configGeral.controleAcessoTurnoAtivo}
                            label="Ativar controle por turno"
                            onChange={(checked) =>
                                setConfigGeral((previous) => ({ ...previous, controleAcessoTurnoAtivo: checked }))
                            }
                        />
                    </div>

                    <FormField label="Tolerância de acesso">
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                value={configGeral.toleranciaTurnoMinutos}
                                className={`${inputClass} pr-20`}
                                onChange={(event) =>
                                    setConfigGeral((previous) => ({ ...previous, toleranciaTurnoMinutos: event.target.value }))
                                }
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                minutos
              </span>
                        </div>
                    </FormField>
                </div>
                <p className="mt-3 text-[11px] text-slate-400">
                    Exemplo: um turno das 08:00 às 15:00 com 60 minutos permite acesso das 07:00 às 16:00.
                </p>
            </SettingsCard>

            {/* SEÇÃO: TURNOS */}
            <SettingsCard
                icon={Clock3}
                title="Turnos"
                description={`${turnos.length} turno(s) configurado(s)`}
                action={
                    <Button size="small" icon={Plus} onClick={novoTurno}>
                        Novo turno
                    </Button>
                }
            >
                {turnos.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 px-6 py-9 text-center">
                        <Clock3 size={25} className="mx-auto text-slate-300" />
                        <p className="mt-2 text-sm font-semibold text-slate-700">Nenhum turno configurado</p>
                        <p className="mt-1 text-xs text-slate-500">Crie o primeiro turno para controlar o acesso dos operadores.</p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {turnos.map((turno) => (
                            <TurnoRow
                                key={turno.id}
                                turno={turno}
                                onEdit={() => editarTurno(turno)}
                                onDelete={() => excluirTurno(turno)}
                            />
                        ))}
                    </div>
                )}
            </SettingsCard>
        </div>
    );
}

{/* COMPONENTES AUXILIARES COESOS */}
function CompanyInput({ label, field, type = "text", empresa, onChange, className = "" }) {
    return (
        <FormField label={label} className={className}>
            <input
                type={type}
                value={empresa?.[field] || ""}
                className={inputClass}
                onChange={(event) => onChange(field, event.target.value)}
            />
        </FormField>
    );
}

function SettingsCard({ icon: Icon, title, description, action, children }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <header className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon size={19} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-base font-bold text-slate-950">{title}</h2>
                        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
                    </div>
                </div>
                {action}
            </header>
            {children}
        </section>
    );
}

export default GeralTab;
