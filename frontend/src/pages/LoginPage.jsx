import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../contexts/AuthContext.jsx";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import AuthField from "../components/auth/AuthField.jsx";

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!email.trim() || !senha) {
            toast.error("Informe e-mail e senha.");
            return;
        }

        try {
            setLoading(true);

            await login({
                email: email.trim(),
                senha,
            });

            toast.success("Login realizado com sucesso!");
            navigate("/dashboard", { replace: true });
        } catch (error) {
            console.error("Erro ao fazer login:", error);

            if (error.response?.status === 401) {
                toast.error("E-mail ou senha incorretos.");
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
            eyebrow="Acesso seguro"
            title="Entre na sua conta"
            description="Utilize suas credenciais para acessar o ambiente de produção."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <AuthField
                    label="E-mail"
                    icon={Mail}
                    type="email"
                    placeholder="seu.email@empresa.com"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                    disabled={loading}
                    required
                    autoFocus
                />

                <AuthField
                    label="Senha"
                    icon={Lock}
                    type="password"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={setSenha}
                    autoComplete="current-password"
                    disabled={loading}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="group mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.2)] transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? (
                        <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Autenticando...
                        </>
                    ) : (
                        <>
                            Entrar no sistema
                            <ArrowRight
                                size={16}
                                className="transition-transform group-hover:translate-x-0.5"
                            />
                        </>
                    )}
                </button>
            </form>
        </AuthLayout>
    );
}

export default LoginPage;
