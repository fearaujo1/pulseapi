import { useEffect, useState } from "react";
import {
    Building2,
    Bell,
    Cable,
    DatabaseBackup,
    Palette,
    ScrollText,
    Save,
    Plus,
    Pencil,
    Trash2,
    Clock3,
    ShieldCheck,
    Settings,
    X,
} from "lucide-react";

import toast from "react-hot-toast";

import Topbar from "../components/layout/Topbar";
import { configuracaoService } from "../services/configuracaoService";

const tabs = [
    {
        id: "geral",
        label: "Geral",
        icon: Building2,
    },
    {
        id: "notificacoes",
        label: "Notificações",
        icon: Bell,
    },
    {
        id: "integracoes",
        label: "Integrações",
        icon: Cable,
    },
    {
        id: "backup",
        label: "Backup",
        icon: DatabaseBackup,
    },
    {
        id: "aparencia",
        label: "Aparência",
        icon: Palette,
    },
    {
        id: "logs",
        label: "Logs",
        icon: ScrollText,
    },
];

function ConfiguracoesPage() {
    const [activeTab, setActiveTab] =
        useState("geral");

    const [loading, setLoading] =
        useState(true);

    const [savingEmpresa, setSavingEmpresa] =
        useState(false);

    const [savingConfig, setSavingConfig] =
        useState(false);

    const [empresa, setEmpresa] =
        useState(null);

    const [configGeral, setConfigGeral] =
        useState({
            controleAcessoTurnoAtivo: false,
            toleranciaTurnoMinutos: 60,
        });

    const [turnos, setTurnos] =
        useState([]);

    const [turnoModalOpen, setTurnoModalOpen] =
        useState(false);

    const [turnoEditando, setTurnoEditando] =
        useState(null);

    useEffect(() => {
        carregarDados();
    }, []);

    async function carregarDados() {
        try {
            setLoading(true);

            const [
                empresaData,
                configData,
                turnosData,
            ] = await Promise.all([
                configuracaoService.buscarEmpresa(),
                configuracaoService.buscarConfiguracaoGeral(),
                configuracaoService.listarTurnos(),
            ]);

            setEmpresa(empresaData);

            setConfigGeral({
                controleAcessoTurnoAtivo:
                configData.controleAcessoTurnoAtivo,

                toleranciaTurnoMinutos:
                configData.toleranciaTurnoMinutos,
            });

            setTurnos(
                Array.isArray(turnosData)
                    ? turnosData
                    : []
            );

        } catch (error) {
            console.error(
                "Erro ao carregar configurações:",
                error
            );

            toast.error(
                "Não foi possível carregar as configurações."
            );

        } finally {
            setLoading(false);
        }
    }


    // =====================================================
    // EMPRESA
    // =====================================================

    function atualizarCampoEmpresa(
        campo,
        valor
    ) {
        setEmpresa((prev) => ({
            ...prev,
            [campo]: valor,
        }));
    }

    async function salvarEmpresa() {
        try {
            setSavingEmpresa(true);

            const atualizado =
                await configuracaoService
                    .atualizarEmpresa(
                        empresa.id,
                        {
                            razaoSocial:
                            empresa.razaoSocial,

                            nomeFantasia:
                            empresa.nomeFantasia,

                            cnpj:
                            empresa.cnpj,

                            email:
                            empresa.email,

                            telefone:
                            empresa.telefone,
                        }
                    );

            setEmpresa(atualizado);

            toast.success(
                "Dados da empresa atualizados."
            );

        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.detail ||
                "Não foi possível atualizar a empresa."
            );

        } finally {
            setSavingEmpresa(false);
        }
    }


    // =====================================================
    // CONFIGURAÇÃO DE TURNO
    // =====================================================

    async function salvarConfiguracaoGeral() {
        try {
            setSavingConfig(true);

            const atualizado =
                await configuracaoService
                    .atualizarConfiguracaoGeral({
                        controleAcessoTurnoAtivo:
                        configGeral.controleAcessoTurnoAtivo,

                        toleranciaTurnoMinutos:
                            Number(
                                configGeral.toleranciaTurnoMinutos
                            ),
                    });

            setConfigGeral({
                controleAcessoTurnoAtivo:
                atualizado.controleAcessoTurnoAtivo,

                toleranciaTurnoMinutos:
                atualizado.toleranciaTurnoMinutos,
            });

            toast.success(
                "Controle de acesso atualizado."
            );

        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.detail ||
                "Não foi possível salvar a configuração."
            );

        } finally {
            setSavingConfig(false);
        }
    }


    // =====================================================
    // TURNOS
    // =====================================================

    function novoTurno() {
        setTurnoEditando(null);
        setTurnoModalOpen(true);
    }

    function editarTurno(turno) {
        setTurnoEditando(turno);
        setTurnoModalOpen(true);
    }

    async function excluirTurno(turno) {
        const confirmar =
            window.confirm(
                `Deseja excluir o turno "${turno.nome}"?`
            );

        if (!confirmar) {
            return;
        }

        try {
            await configuracaoService
                .excluirTurno(turno.id);

            setTurnos((prev) =>
                prev.filter(
                    (item) =>
                        item.id !== turno.id
                )
            );

            toast.success(
                "Turno excluído."
            );

        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.detail ||
                "Não foi possível excluir o turno."
            );
        }
    }

    async function salvarTurno(payload) {
        try {
            if (turnoEditando) {
                const atualizado =
                    await configuracaoService
                        .atualizarTurno(
                            turnoEditando.id,
                            payload
                        );

                setTurnos((prev) =>
                    prev.map((turno) =>
                        turno.id === atualizado.id
                            ? atualizado
                            : turno
                    )
                );

                toast.success(
                    "Turno atualizado."
                );

            } else {
                const novo =
                    await configuracaoService
                        .criarTurno(payload);

                setTurnos((prev) => [
                    ...prev,
                    novo,
                ]);

                toast.success(
                    "Turno criado."
                );
            }

            setTurnoModalOpen(false);
            setTurnoEditando(null);

        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.detail ||
                "Não foi possível salvar o turno."
            );
        }
    }


    if (loading) {
        return (
            <div className="min-h-screen bg-[#f5f7fb]">
                <Topbar />

                <main className="p-4 md:p-6">
                    <p className="text-slate-500">
                        Carregando configurações...
                    </p>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">

            <Topbar />

            <main className="p-4 md:p-6">

                {/* CABEÇALHO */}

                <section className="mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-950">
                        Configurações
                    </h1>

                    <p className="mt-1 text-[16px] text-slate-600">
                        Gerencie as configurações gerais do Smart Production Manager
                    </p>
                </section>


                {/* CONTAINER */}

                <div className="grid grid-cols-1 xl:grid-cols-[240px_1fr] gap-6">

                    {/* MENU LATERAL */}

                    <aside className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm h-fit">

                        {tabs.map((tab) => {
                            const Icon = tab.icon;

                            const ativo =
                                activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() =>
                                        setActiveTab(
                                            tab.id
                                        )
                                    }
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                                        ativo
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                    <Icon size={18} />

                                    {tab.label}
                                </button>
                            );
                        })}
                    </aside>


                    {/* CONTEÚDO */}

                    <section>

                        {activeTab === "geral" && (
                            <GeralTab
                                empresa={empresa}
                                atualizarCampoEmpresa={
                                    atualizarCampoEmpresa
                                }
                                salvarEmpresa={
                                    salvarEmpresa
                                }
                                savingEmpresa={
                                    savingEmpresa
                                }

                                configGeral={
                                    configGeral
                                }
                                setConfigGeral={
                                    setConfigGeral
                                }
                                salvarConfiguracaoGeral={
                                    salvarConfiguracaoGeral
                                }
                                savingConfig={
                                    savingConfig
                                }

                                turnos={turnos}
                                novoTurno={novoTurno}
                                editarTurno={
                                    editarTurno
                                }
                                excluirTurno={
                                    excluirTurno
                                }
                            />
                        )}

                        {activeTab !== "geral" && (
                            <EmBreveTab
                                tab={tabs.find(
                                    (tab) =>
                                        tab.id ===
                                        activeTab
                                )}
                            />
                        )}

                    </section>

                </div>
            </main>


            {turnoModalOpen && (
                <TurnoModal
                    turno={turnoEditando}
                    onClose={() => {
                        setTurnoModalOpen(false);
                        setTurnoEditando(null);
                    }}
                    onSave={salvarTurno}
                />
            )}

        </div>
    );
}


// =========================================================
// ABA GERAL
// =========================================================

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


// =========================================================
// TURNO
// =========================================================

function TurnoRow({
                      turno,
                      onEdit,
                      onDelete,
                  }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-4">

                <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Clock3 size={20} />
                </div>

                <div>
                    <div className="flex items-center gap-2">

                        <p className="font-bold text-slate-900">
                            {turno.nome}
                        </p>

                        <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                turno.ativo
                                    ? "bg-green-50 text-green-700"
                                    : "bg-slate-100 text-slate-500"
                            }`}
                        >
                            {turno.ativo
                                ? "Ativo"
                                : "Inativo"}
                        </span>

                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        {formatarHora(turno.horaInicio)}
                        {" → "}
                        {formatarHora(turno.horaFim)}
                    </p>
                </div>

            </div>


            <div className="flex items-center gap-2">

                <button
                    type="button"
                    onClick={onEdit}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                    title="Editar"
                >
                    <Pencil size={16} />
                </button>

                <button
                    type="button"
                    onClick={onDelete}
                    className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                    title="Excluir"
                >
                    <Trash2 size={16} />
                </button>

            </div>

        </div>
    );
}


// =========================================================
// MODAL TURNO
// =========================================================

function TurnoModal({
                        turno,
                        onClose,
                        onSave,
                    }) {
    const [nome, setNome] =
        useState(turno?.nome || "");

    const [horaInicio, setHoraInicio] =
        useState(
            formatarHora(
                turno?.horaInicio
            )
        );

    const [horaFim, setHoraFim] =
        useState(
            formatarHora(
                turno?.horaFim
            )
        );

    const [ativo, setAtivo] =
        useState(
            turno?.ativo ?? true
        );

    const [saving, setSaving] =
        useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        if (
            !nome ||
            !horaInicio ||
            !horaFim
        ) {
            toast.error(
                "Preencha os dados do turno."
            );

            return;
        }

        try {
            setSaving(true);

            await onSave({
                nome,
                horaInicio,
                horaFim,
                ativo,
            });

        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-lg rounded-[28px] bg-white shadow-2xl p-6"
            >

                <div className="flex items-start justify-between">

                    <div>
                        <h2 className="text-xl font-bold text-slate-950">
                            {turno
                                ? "Editar Turno"
                                : "Novo Turno"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Configure o período de funcionamento
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>

                </div>


                <div className="mt-6 space-y-5">

                    <FormField label="Nome">
                        <input
                            value={nome}
                            onChange={(e) =>
                                setNome(
                                    e.target.value
                                )
                            }
                            placeholder="Ex.: Turno A"
                            className={inputClass}
                        />
                    </FormField>


                    <div className="grid grid-cols-2 gap-4">

                        <FormField label="Início">
                            <input
                                type="time"
                                value={horaInicio}
                                onChange={(e) =>
                                    setHoraInicio(
                                        e.target.value
                                    )
                                }
                                className={inputClass}
                            />
                        </FormField>

                        <FormField label="Fim">
                            <input
                                type="time"
                                value={horaFim}
                                onChange={(e) =>
                                    setHoraFim(
                                        e.target.value
                                    )
                                }
                                className={inputClass}
                            />
                        </FormField>

                    </div>


                    <div className="rounded-xl border border-slate-200 p-4 flex items-center justify-between">

                        <div>
                            <p className="font-semibold text-slate-800">
                                Turno ativo
                            </p>

                            <p className="text-xs text-slate-500">
                                Turnos inativos não liberam acesso.
                            </p>
                        </div>

                        <Toggle
                            checked={ativo}
                            onChange={setAtivo}
                        />

                    </div>

                </div>


                <div className="mt-7 flex justify-end gap-3">

                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 px-5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold"
                    >
                        {saving
                            ? "Salvando..."
                            : "Salvar Turno"}
                    </button>

                </div>

            </form>

        </div>
    );
}


// =========================================================
// EM BREVE
// =========================================================

function EmBreveTab({
                        tab,
                    }) {
    const Icon =
        tab?.icon || Settings;

    return (
        <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-10 text-center">

            <div className="mx-auto h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Icon size={26} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
                {tab?.label}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
                Esta seção será implementada em uma próxima etapa.
            </p>

        </div>
    );
}


// =========================================================
// COMPONENTES AUXILIARES
// =========================================================

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

            <div className="h-11 w-11 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Icon size={21} />
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

function Toggle({
                    checked,
                    onChange,
                }) {
    return (
        <button
            type="button"
            onClick={() =>
                onChange(!checked)
            }
            className={`relative w-12 h-7 rounded-full transition ${
                checked
                    ? "bg-blue-600"
                    : "bg-slate-300"
            }`}
        >
            <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    checked
                        ? "left-6"
                        : "left-1"
                }`}
            />
        </button>
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

function formatarHora(
    hora
) {
    if (!hora) {
        return "";
    }

    return String(hora).substring(
        0,
        5
    );
}

const inputClass =
    "w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default ConfiguracoesPage;