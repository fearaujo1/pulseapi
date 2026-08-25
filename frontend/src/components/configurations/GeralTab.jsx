import {
    Building2,
    Clock3,
    Plus,
    Save,
    ShieldCheck,
} from "lucide-react";

import FormField from "../common/FormField";
import Toggle from "../common/Toggle";
import { inputClass } from "../common/formStyles";
import TurnoRow from "./TurnoRow";

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
        <div className="space-y-6">

            {/* EMPRESA */}

            <Card>

                <CardHeader
                    icon={Building2}
                    title="Informações da Empresa"
                    description="Dados cadastrados durante a configuração inicial do sistema"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

                    <FormField label="Razão Social">
                        <input
                            value={
                                empresa?.razaoSocial || ""
                            }
                            onChange={(e) =>
                                atualizarCampoEmpresa(
                                    "razaoSocial",
                                    e.target.value
                                )
                            }
                            className={inputClass}
                        />
                    </FormField>

                    <FormField label="Nome Fantasia">
                        <input
                            value={
                                empresa?.nomeFantasia || ""
                            }
                            onChange={(e) =>
                                atualizarCampoEmpresa(
                                    "nomeFantasia",
                                    e.target.value
                                )
                            }
                            className={inputClass}
                        />
                    </FormField>

                    <FormField label="CNPJ">
                        <input
                            value={
                                empresa?.cnpj || ""
                            }
                            onChange={(e) =>
                                atualizarCampoEmpresa(
                                    "cnpj",
                                    e.target.value
                                )
                            }
                            className={inputClass}
                        />
                    </FormField>

                    <FormField label="Telefone">
                        <input
                            value={
                                empresa?.telefone || ""
                            }
                            onChange={(e) =>
                                atualizarCampoEmpresa(
                                    "telefone",
                                    e.target.value
                                )
                            }
                            className={inputClass}
                        />
                    </FormField>

                    <div className="md:col-span-2">
                        <FormField label="E-mail">
                            <input
                                type="email"
                                value={
                                    empresa?.email || ""
                                }
                                onChange={(e) =>
                                    atualizarCampoEmpresa(
                                        "email",
                                        e.target.value
                                    )
                                }
                                className={inputClass}
                            />
                        </FormField>
                    </div>

                </div>

                <div className="mt-6 flex justify-end">
                    <PrimaryButton
                        loading={savingEmpresa}
                        onClick={salvarEmpresa}
                    >
                        <Save size={17} />
                        Salvar Empresa
                    </PrimaryButton>
                </div>

            </Card>


            {/* CONTROLE POR TURNO */}

            <Card>

                <CardHeader
                    icon={ShieldCheck}
                    title="Controle de Acesso por Turno"
                    description="Restrinja o acesso dos operadores aos horários configurados"
                />

                <div className="mt-6">

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div>
                            <p className="font-semibold text-slate-900">
                                Restrição de horário
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Quando ativada, somente operadores dentro de seus turnos poderão realizar login.
                            </p>
                        </div>

                        <Toggle
                            checked={
                                configGeral
                                    .controleAcessoTurnoAtivo
                            }
                            onChange={(checked) =>
                                setConfigGeral(
                                    (prev) => ({
                                        ...prev,
                                        controleAcessoTurnoAtivo:
                                        checked,
                                    })
                                )
                            }
                        />

                    </div>


                    <div className="mt-5 max-w-sm">

                        <FormField label="Tolerância de acesso">
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    value={
                                        configGeral
                                            .toleranciaTurnoMinutos
                                    }
                                    onChange={(e) =>
                                        setConfigGeral(
                                            (prev) => ({
                                                ...prev,
                                                toleranciaTurnoMinutos:
                                                e.target.value,
                                            })
                                        )
                                    }
                                    className={`${inputClass} pr-24`}
                                />

                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                    minutos
                                </span>
                            </div>
                        </FormField>

                        <p className="mt-2 text-xs text-slate-400">
                            Ex.: turno 08:00–15:00 com 60 minutos permite acesso entre 07:00 e 16:00.
                        </p>

                    </div>

                </div>

                <div className="mt-6 flex justify-end">
                    <PrimaryButton
                        loading={savingConfig}
                        onClick={
                            salvarConfiguracaoGeral
                        }
                    >
                        <Save size={17} />
                        Salvar Controle
                    </PrimaryButton>
                </div>

            </Card>


            {/* TURNOS */}

            <Card>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                    <CardHeader
                        icon={Clock3}
                        title="Turnos"
                        description="Configure os horários disponíveis para os operadores"
                    />

                    <button
                        type="button"
                        onClick={novoTurno}
                        className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2"
                    >
                        <Plus size={16} />
                        Novo Turno
                    </button>

                </div>

                <div className="mt-6 space-y-3">

                    {turnos.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">

                            <Clock3
                                size={34}
                                className="mx-auto text-slate-300"
                            />

                            <p className="mt-3 text-sm font-semibold text-slate-600">
                                Nenhum turno configurado
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                                Crie o primeiro turno para começar.
                            </p>

                        </div>

                    ) : (
                        turnos.map((turno) => (
                            <TurnoRow
                                key={turno.id}
                                turno={turno}
                                onEdit={() =>
                                    editarTurno(turno)
                                }
                                onDelete={() =>
                                    excluirTurno(turno)
                                }
                            />
                        ))
                    )}

                </div>

            </Card>

        </div>
    );
}

function Card({
                  children,
              }) {
    return (
        <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6">
            {children}
        </section>
    );
}

function CardHeader({
                        icon: Icon,
                        title,
                        description,
                    }) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                {Icon && <Icon size={21} />}
            </div>

            <div>
                <h2 className="text-lg font-bold text-slate-950">
                    {title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

function PrimaryButton({
                           children,
                           onClick,
                           loading,
                       }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading}
            className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold flex items-center gap-2 transition"
        >
            {children}
        </button>
    );
}

export default GeralTab;