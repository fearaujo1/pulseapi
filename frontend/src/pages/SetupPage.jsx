import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AuthLayout from "../components/auth/AuthLayout";
import SetupForm from "../components/setup/SetupForm";
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
}

function SetupPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(false);

    function handleFieldChange(field, value) {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

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

            toast.success("Configuração inicial realizada com sucesso!");
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
        <AuthLayout
            title="Setup Inicial"
            description="Configure a empresa e crie o primeiro usuário administrador"
            maxWidthClass="max-w-5xl"
        >
            <SetupForm
                formData={formData}
                onFieldChange={handleFieldChange}
                onSubmit={handleSubmit}
                loading={loading}
            />
        </AuthLayout>
    );
}

export default SetupPage;
