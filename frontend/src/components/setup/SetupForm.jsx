import { useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    Check,
    Factory,
    FileText,
    Lock,
    Mail,
    Phone,
    User,
} from "lucide-react";
import toast from "react-hot-toast";

import AuthField from "../auth/AuthField.jsx";
import PasswordRequirements from "../auth/PasswordRequirements.jsx";
import Button from "../common/Button.jsx";
import SetupSection from "./SetupSection.jsx";

const ETAPAS = [
    {
        id: 1,
        label: "Empresa",
        description: "Dados da organização",
    },
    {
        id: 2,
        label: "Administrador",
        description: "Primeiro acesso",
    },
];

function SetupForm({
                       formData,
                       onFieldChange,
                       onSubmit,
                       loading = false,
                       previewMode = false,
                   }) {
    const [etapaAtual, setEtapaAtual] = useState(1);

    function avancarEtapa() {
        if (!formData.razaoSocial.trim()) {
            toast.error("Informe a razão social da empresa.");
            return;
        }

        setEtapaAtual(2);
    }

    function voltarEtapa() {
        if (loading) {
            return;
        }

        setEtapaAtual(1);
    }

    return (
        <form onSubmit={onSubmit}>
            <ProgressSteps currentStep={etapaAtual} />

            <div className="mt-7">
                {etapaAtual === 1 ? (
                    <EmpresaStep
                        formData={formData}
                        onFieldChange={onFieldChange}
                        loading={loading}
                    />
                ) : (
                    <AdministradorStep
                        formData={formData}
                        onFieldChange={onFieldChange}
                        loading={loading}
                    />
                )}
            </div>

            <footer className="mt-7 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-center text-[11px] text-slate-400 sm:text-left">
                    Campos marcados com{" "}
                    <span className="font-semibold text-red-500">
                        *
                    </span>{" "}
                    são obrigatórios.
                </p>

                <div className="flex gap-2">
                    {etapaAtual === 2 && (
                        <Button
                            type="button"
                            variant="secondary"
                            size="large"
                            icon={ArrowLeft}
                            onClick={voltarEtapa}
                            disabled={loading}
                            className="flex-1 sm:flex-none"
                        >
                            Voltar
                        </Button>
                    )}

                    {etapaAtual === 1 ? (
                        <Button
                            type="button"
                            size="large"
                            icon={ArrowRight}
                            iconPosition="right"
                            onClick={avancarEtapa}
                            className="flex-1 sm:flex-none"
                        >
                            Continuar
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            size="large"
                            icon={Check}
                            loading={loading}
                            loadingText="Configurando..."
                            className="flex-1 sm:flex-none"
                        >
                            {previewMode
                                ? "Testar conclusão"
                                : "Finalizar configuração"}
                        </Button>
                    )}
                </div>
            </footer>
        </form>
    );
}

function EmpresaStep({
                         formData,
                         onFieldChange,
                         loading,
                     }) {
    return (
        <SetupSection
            icon={Building2}
            title="Dados da empresa"
            description="Informe os dados principais da organização que utilizará o sistema."
        >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <AuthField
                        label="Razão social"
                        icon={Building2}
                        name="razaoSocial"
                        value={formData.razaoSocial}
                        onChange={(value) =>
                            onFieldChange(
                                "razaoSocial",
                                value
                            )
                        }
                        placeholder="Pulse Tecnologia Industrial LTDA"
                        autoComplete="organization"
                        required
                        compact
                        autoFocus
                        disabled={loading}
                    />
                </div>

                <AuthField
                    label="Nome fantasia"
                    icon={Factory}
                    name="nomeFantasia"
                    value={formData.nomeFantasia}
                    onChange={(value) =>
                        onFieldChange(
                            "nomeFantasia",
                            value
                        )
                    }
                    placeholder="PulseAPI"
                    autoComplete="organization"
                    compact
                    disabled={loading}
                />

                <AuthField
                    label="CNPJ"
                    icon={FileText}
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={(value) =>
                        onFieldChange("cnpj", value)
                    }
                    placeholder="00.000.000/0001-00"
                    compact
                    disabled={loading}
                />

                <AuthField
                    label="Telefone"
                    icon={Phone}
                    type="tel"
                    name="telefoneEmpresa"
                    value={formData.telefoneEmpresa}
                    onChange={(value) =>
                        onFieldChange(
                            "telefoneEmpresa",
                            value
                        )
                    }
                    placeholder="(43) 99999-9999"
                    autoComplete="tel"
                    compact
                    disabled={loading}
                />

                <AuthField
                    label="E-mail corporativo"
                    icon={Mail}
                    type="email"
                    name="emailEmpresa"
                    value={formData.emailEmpresa}
                    onChange={(value) =>
                        onFieldChange(
                            "emailEmpresa",
                            value
                        )
                    }
                    placeholder="contato@empresa.com"
                    autoComplete="email"
                    compact
                    disabled={loading}
                />
            </div>
        </SetupSection>
    );
}

function AdministradorStep({
                               formData,
                               onFieldChange,
                               loading,
                           }) {
    return (
        <SetupSection
            icon={User}
            title="Administrador do sistema"
            description="Crie o primeiro usuário, que terá acesso completo às configurações."
            iconClassName="bg-emerald-50 text-emerald-600"
        >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <AuthField
                        label="Nome completo"
                        icon={User}
                        name="nomeAdmin"
                        value={formData.nomeAdmin}
                        onChange={(value) =>
                            onFieldChange(
                                "nomeAdmin",
                                value
                            )
                        }
                        placeholder="Nome do administrador"
                        autoComplete="name"
                        required
                        compact
                        autoFocus
                        disabled={loading}
                    />
                </div>

                <AuthField
                    label="E-mail de acesso"
                    icon={Mail}
                    type="email"
                    name="emailAdmin"
                    value={formData.emailAdmin}
                    onChange={(value) =>
                        onFieldChange(
                            "emailAdmin",
                            value
                        )
                    }
                    placeholder="admin@empresa.com"
                    autoComplete="email"
                    required
                    compact
                    disabled={loading}
                />

                <AuthField
                    label="Telefone"
                    icon={Phone}
                    type="tel"
                    name="telefoneAdmin"
                    value={formData.telefoneAdmin}
                    onChange={(value) =>
                        onFieldChange(
                            "telefoneAdmin",
                            value
                        )
                    }
                    placeholder="(43) 99999-9999"
                    autoComplete="tel"
                    compact
                    disabled={loading}
                />

                <div className="sm:col-span-2">
                    <AuthField
                        label="Senha inicial"
                        icon={Lock}
                        type="password"
                        name="senhaAdmin"
                        value={formData.senhaAdmin}
                        onChange={(value) =>
                            onFieldChange(
                                "senhaAdmin",
                                value
                            )
                        }
                        placeholder="Crie uma senha segura"
                        autoComplete="new-password"
                        required
                        compact
                        disabled={loading}
                    />
                </div>

                <div className="sm:col-span-2">
                    <PasswordRequirements />
                </div>
            </div>

            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[11px] leading-5 text-slate-500">
                    Ao finalizar, a empresa será configurada e
                    você será direcionado para a tela de login
                    utilizando o e-mail e a senha cadastrados
                    acima.
                </p>
            </div>
        </SetupSection>
    );
}

function ProgressSteps({ currentStep }) {
    return (
        <div
            className="grid grid-cols-2"
            aria-label="Etapas da configuração"
        >
            {ETAPAS.map((etapa, index) => {
                const completed =
                    currentStep > etapa.id;
                const active =
                    currentStep === etapa.id;

                return (
                    <div
                        key={etapa.id}
                        className="relative"
                    >
                        {index < ETAPAS.length - 1 && (
                            <span
                                aria-hidden="true"
                                className={`absolute left-[calc(50%+1.25rem)] right-[calc(-50%+1.25rem)] top-5 h-px ${
                                    completed
                                        ? "bg-blue-500"
                                        : "bg-slate-200"
                                }`}
                            />
                        )}

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <span
                                className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs font-bold transition ${
                                    completed
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : active
                                            ? "border-blue-600 bg-blue-50 text-blue-700"
                                            : "border-slate-200 bg-white text-slate-400"
                                }`}
                            >
                                {completed ? (
                                    <Check size={16} />
                                ) : (
                                    etapa.id
                                )}
                            </span>

                            <span
                                className={`mt-2 text-xs font-semibold ${
                                    active || completed
                                        ? "text-slate-800"
                                        : "text-slate-400"
                                }`}
                            >
                                {etapa.label}
                            </span>

                            <span className="mt-0.5 hidden text-[10px] text-slate-400 sm:block">
                                {etapa.description}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default SetupForm;