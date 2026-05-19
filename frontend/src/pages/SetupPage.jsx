import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Building2,
    User,
    Mail,
    Phone,
    Lock,
    FileText,
    Factory,
} from "lucide-react";
import toast from "react-hot-toast";
import { setupService } from "./../services/setupService.js";

const initialForm = {
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    telefoneEmpresa: "",
    emailEmpresa: "",
    nomeAdmin: "",
    emailAdmin: "",
    senhaAdmin: "",
    telefoneAdmin: "",
}

function SetupPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setLoading(true);

            const payload = {
                empresa: {
                    razaoSocial: formData.razaoSocial,
                    nomeFantasia: formData.nomeFantasia || null,
                    cnpj: formData.cnpj || null,
                    telefone: formData.telefoneEmpresa || null,
                    email: formData.emailEmpresa || null,
                },
                admin: {
                    nome: formData.nomeAdmin,
                    email: formData.emailAdmin,
                    senha: formData.senhaAdmin,
                    telefone: formData.telefoneAdmin || null,
                },
            };

            await setupService.criarSetupInicial(payload);

            toast.success("Configurações Iniciais realizada com sucesso!");
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Erro ao realizar configurações: ", error);
            console.error("Resposta: ", error.response?.data);

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Erro ao realizar configurações iniciais."
            );
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-5xl rounded-[28px] bg-white border border-slate-200 shadow-2xl">
                <div className="px-8 pt-8 text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white">
                        <Factory size={34} />
                    </div>

                    <h1 className="text-[28px] font-bold text-slate-950">
                        Setup Inicial
                    </h1>

                    <p className="mt-2 text-[14px] text-slate-500">
                        Configure a empresa e crie o primeiro usuário administrador
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pb-8 pt-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <section>
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Building2 size={20} />
                                </div>

                                <div>
                                    <h2 className="text-[18px] font-bold text-slate-900">
                                        Dados da Empresa
                                    </h2>
                                    <p className="text-[13px] text-slate-500">
                                        Informações principais da empresa
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <Field
                                    label="Razão Social *"
                                    icon={<Building2 size={17} />}
                                    name="razaoSocial"
                                    value={formData.razaoSocial}
                                    onChange={handleChange}
                                    placeholder="Ex: Pulse Tecnologia Industrial LTDA"
                                    required
                                />

                                <Field
                                    label="Nome Fantasia"
                                    icon={<Factory size={17} />}
                                    name="nomeFantasia"
                                    value={formData.nomeFantasia}
                                    onChange={handleChange}
                                    placeholder="Ex: PulseAPI"
                                />

                                <Field
                                    label="CNPJ"
                                    icon={<FileText size={17} />}
                                    name="cnpj"
                                    value={formData.cnpj}
                                    onChange={handleChange}
                                    placeholder="00.000.000/0001-00"
                                />

                                <Field
                                    label="Telefone"
                                    icon={<Phone size={17} />}
                                    name="telefoneEmpresa"
                                    value={formData.telefoneEmpresa}
                                    onChange={handleChange}
                                    placeholder="(43) 99999-9999"
                                />

                                <Field
                                    label="E-mail"
                                    icon={<Mail size={17} />}
                                    name="emailEmpresa"
                                    value={formData.emailEmpresa}
                                    onChange={handleChange}
                                    placeholder="contato@empresa.com"
                                />
                            </div>
                        </section>

                        <section>
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                                    <User size={20} />
                                </div>

                                <div>
                                    <h2 className="text-[18px] font-bold text-slate-900">
                                        Administrador
                                    </h2>
                                    <p className="text-[13px] text-slate-500">
                                        Primeiro usuário com acesso total ao sistema
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <Field
                                    label="Nome do Administrador *"
                                    icon={<User size={17} />}
                                    name="nomeAdmin"
                                    value={formData.nomeAdmin}
                                    onChange={handleChange}
                                    placeholder="Ex: Administrador"
                                    required
                                />

                                <Field
                                    label="E-mail do Administrador *"
                                    icon={<Mail size={17} />}
                                    name="emailAdmin"
                                    value={formData.emailAdmin}
                                    onChange={handleChange}
                                    placeholder="admin@empresa.com"
                                    type="email"
                                    required
                                />

                                <Field
                                    label="Senha Inicial *"
                                    icon={<Lock size={17} />}
                                    name="senhaAdmin"
                                    value={formData.senhaAdmin}
                                    onChange={handleChange}
                                    placeholder="Ex: Admin!123"
                                    type="password"
                                    required
                                />

                                <Field
                                    label="Telefone"
                                    icon={<Phone size={17} />}
                                    name="telefoneAdmin"
                                    value={formData.telefoneAdmin}
                                    onChange={handleChange}
                                    placeholder="(43) 99999-9999"
                                />

                                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                                    <p className="text-[13px] font-semibold text-blue-700">
                                        Após finalizar:
                                    </p>
                                    <p className="mt-1 text-[12.5px] text-blue-700/90">
                                        O sistema será configurado e você será redirecionado para a tela de login.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-11 rounded-xl bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 text-[13.5px]"
                        >
                            {loading ? "Configurando..." : "Finalizar Setup"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({
                   label,
                   icon,
                   name,
                   value,
                   onChange,
                   placeholder,
                   type = "text",
                   required = false,
               }) {
    return (
        <div>
            <label className="mb-2 block text-[13.5px] font-semibold text-slate-900">
                {label}
            </label>

            <div className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 flex items-center gap-3 focus-within:border-blue-500">
                <span className="text-slate-400">{icon}</span>

                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className="w-full bg-transparent outline-none text-[13px] placeholder:text-slate-400"
                />
            </div>
        </div>
    );
}

export default SetupPage;
