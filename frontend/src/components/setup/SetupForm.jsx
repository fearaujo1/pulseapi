import {
    Building2,
    Factory,
    FileText,
    Lock,
    Mail,
    Phone,
    User,
} from "lucide-react";

import AuthField from "../auth/AuthField";
import SetupSection from "./SetupSection";

function SetupForm({
                       formData,
                       onFieldChange,
                       onSubmit,
                       loading = false,
                   }) {
    return (
        <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <SetupSection
                    icon={Building2}
                    title="Dados da Empresa"
                    description="Informações principais da empresa"
                >
                    <AuthField
                        label="Razão Social"
                        icon={Building2}
                        value={formData.razaoSocial}
                        onChange={(value) =>
                            onFieldChange("razaoSocial", value)
                        }
                        placeholder="Ex.: Pulse Tecnologia Industrial LTDA"
                        required
                        compact
                        disabled={loading}
                    />

                    <AuthField
                        label="Nome Fantasia"
                        icon={Factory}
                        value={formData.nomeFantasia}
                        onChange={(value) =>
                            onFieldChange("nomeFantasia", value)
                        }
                        placeholder="Ex.: PulseAPI"
                        compact
                        disabled={loading}
                    />

                    <AuthField
                        label="CNPJ"
                        icon={FileText}
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
                        value={formData.telefoneEmpresa}
                        onChange={(value) =>
                            onFieldChange("telefoneEmpresa", value)
                        }
                        placeholder="(43) 99999-9999"
                        compact
                        disabled={loading}
                    />

                    <AuthField
                        label="E-mail"
                        icon={Mail}
                        type="email"
                        value={formData.emailEmpresa}
                        onChange={(value) =>
                            onFieldChange("emailEmpresa", value)
                        }
                        placeholder="contato@empresa.com"
                        compact
                        disabled={loading}
                    />
                </SetupSection>

                <SetupSection
                    icon={User}
                    iconClassName="bg-green-50 text-green-600"
                    title="Administrador"
                    description="Primeiro usuário com acesso total ao sistema"
                >
                    <AuthField
                        label="Nome do Administrador"
                        icon={User}
                        value={formData.nomeAdmin}
                        onChange={(value) =>
                            onFieldChange("nomeAdmin", value)
                        }
                        placeholder="Ex.: Administrador"
                        required
                        compact
                        disabled={loading}
                    />

                    <AuthField
                        label="E-mail do Administrador"
                        icon={Mail}
                        type="email"
                        value={formData.emailAdmin}
                        onChange={(value) =>
                            onFieldChange("emailAdmin", value)
                        }
                        placeholder="admin@empresa.com"
                        required
                        compact
                        disabled={loading}
                    />

                    <AuthField
                        label="Senha Inicial"
                        icon={Lock}
                        type="password"
                        value={formData.senhaAdmin}
                        onChange={(value) =>
                            onFieldChange("senhaAdmin", value)
                        }
                        placeholder="Ex.: Admin!123"
                        autoComplete="new-password"
                        required
                        compact
                        disabled={loading}
                    />

                    <AuthField
                        label="Telefone"
                        icon={Phone}
                        value={formData.telefoneAdmin}
                        onChange={(value) =>
                            onFieldChange("telefoneAdmin", value)
                        }
                        placeholder="(43) 99999-9999"
                        compact
                        disabled={loading}
                    />

                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                        <p className="text-[13px] font-semibold text-blue-700">
                            Após finalizar
                        </p>

                        <p className="mt-1 text-[12.5px] text-blue-700/90">
                            O sistema será configurado e você será redirecionado
                            para a tela de login.
                        </p>
                    </div>
                </SetupSection>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="h-11 rounded-xl bg-blue-600 px-6 text-[13.5px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {loading
                        ? "Configurando..."
                        : "Finalizar Setup"}
                </button>
            </div>
        </form>
    );
}

export default SetupForm;