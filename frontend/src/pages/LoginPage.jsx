import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import toast from "react-hot-toast";
import { Mail, Lock } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import AuthField from "../components/auth/AuthField";

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] =
        useState("");

    const [senha, setSenha] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!email.trim() || !senha) {
            toast.error(
                "Informe e-mail e senha."
            );
            return;
        }

        try {
            setLoading(true);

            await login({
                email: email.trim(),
                senha,
            });

            toast.success(
                "Login realizado com sucesso!"
            );

            navigate(
                "/dashboard",
                { replace: true }
            );
        } catch (error) {
            console.error(
                "Erro ao fazer login:",
                error
            );

            if (error.response?.status === 401) {
                toast.error(
                    "E-mail ou senha incorretos."
                );
                return;
            }

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Não foi possível realizar o login."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout
            title="PulseAPI"
            description="Sistema de Gestão de Produção Industrial"
        >
            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >
                <AuthField
                    label="E-mail"
                    icon={Mail}
                    type="email"
                    placeholder="seu.email@empresa.com"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                    disabled={loading}
                />

                <AuthField
                    label="Senha"
                    icon={Lock}
                    type="password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={setSenha}
                    autoComplete="current-password"
                    disabled={loading}
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="h-14 w-full rounded-xl bg-blue-600 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {loading
                        ? "Entrando..."
                        : "Entrar"}
                </button>
            </form>
        </AuthLayout>
    );
}

export default LoginPage;