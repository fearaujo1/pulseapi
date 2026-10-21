import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AuthLayout from "../components/auth/AuthLayout.jsx";
import SetupForm from "../components/setup/SetupForm.jsx";
import { setupService } from "../services/setupService.js";

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
};

const previewForm = {
    razaoSocial: "Pulse Tecnologia Industrial LTDA",
    nomeFantasia: "PulseAPI",
    cnpj: "00.000.000/0001-00",
    telefoneEmpresa: "(43) 99999-9999",
    emailEmpresa: "contato@pulseapi.com.br",
    nomeAdmin: "Administrador",
    emailAdmin: "admin@pulseapi.com.br",
    senhaAdmin: "Admin@123",
    telefoneAdmin: "(43) 98888-8888",
};

function SetupPage({ previewMode = false }) {
    const navigate = useNavigate();

    const [formData, setFormData] = useState(
        previewMode ? previewForm : initialForm
    );

    const [loading, setLoading] = useState(false);

    function handleFieldChange(field, value) {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (
            !formData.razaoSocial.trim() ||
            !formData.nomeAdmin.trim() ||
            !formData.emailAdmin.trim() ||
            !formData.senhaAdmin
        ) {
            toast.error("Preencha todos os campos obrigatórios.");
            return;
        }

        if (!senhaForte(formData.senhaAdmin)) {
            toast.error(
                "A senha não atende aos critérios mínimos de segurança."
            );
            return;
        }

        if (previewMode) {
            toast.success(
                "Pré-visualização concluída. Nenhum dado foi enviado."
            );
            return;
        }

        try {
            setLoading(true);

            const payload = {
                empresa: {
                    razaoSocial:
                        formData.razaoSocial.trim(),

                    nomeFantasia:
                        formData.nomeFantasia.trim() ||
                        null,

                    cnpj:
                        formData.cnpj.trim() ||
                        null,

                    telefone:
                        formData.telefoneEmpresa.trim() ||
                        null,

                    email:
                        formData.emailEmpresa.trim() ||
                        null,
                },

                admin: {
                    nome:
                        formData.nomeAdmin.trim(),

                    email:
                        formData.emailAdmin.trim(),

                    senha:
                    formData.senhaAdmin,

                    telefone:
                        formData.telefoneAdmin.trim() ||
                        null,
                },
            };

            await setupService.criarSetupInicial(payload);

            toast.success(
                "Configuração inicial realizada com sucesso!"
            );

            navigate("/login", {
                replace: true,
            });
        } catch (error) {
            console.error(
                "Erro ao realizar configurações:",
                error
            );

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
        <AuthLayout
            eyebrow={
                previewMode
                    ? "Modo de visualização"
                    : "Primeiro acesso"
            }
            title="Configure seu ambiente"
            description={
                previewMode
                    ? "Visualize e teste a configuração inicial sem alterar os dados do sistema."
                    : "Cadastre a empresa e crie o primeiro administrador do sistema."
            }
            maxWidthClass="max-w-[680px]"
        >
            {previewMode && (
                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-xs font-semibold text-amber-800">
                        Pré-visualização
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-amber-700">
                        Esta página está em modo de
                        desenvolvimento. Nenhuma informação será
                        enviada ou salva no banco de dados.
                    </p>
                </div>
            )}
            
            <SetupForm
                formData={formData}
                onFieldChange={handleFieldChange}
                onSubmit={handleSubmit}
                loading={loading}
                previewMode={previewMode}
            />
        </AuthLayout>
    );
}

function senhaForte(senha) {
    return (
        senha.length >= 8 &&
        /[A-Z]/.test(senha) &&
        /[a-z]/.test(senha) &&
        /\d/.test(senha) &&
        /[^A-Za-z0-9]/.test(senha)
    );
}

export default SetupPage;