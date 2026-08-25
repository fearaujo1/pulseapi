import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Mail, Lock } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import AuthField from "../components/auth/AuthField";

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [lembrar, setLembrar] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const emailLembrado =
            localStorage.getItem("emailLembrado");

        if (emailLembrado) {
            setEmail(emailLembrado);
            setLembrar(true);
        }
    }, []);


    async function handleSubmit(event) {
        event.preventDefault();

        if (!email || !senha) {
            toast.error("Informe e-mail e senha.");
            return;
        }

        try {
            setLoading(true);

            const data = await login({
                email,
                senha,
            });
            
            toast.success("Login realizado com sucesso!");

            if (lembrar) {
                localStorage.setItem(
                    "emailLembrado",
                    email
                );
            } else {
                localStorage.removeItem(
                    "emailLembrado"
                );
            }

            if (data.usuario?.primeiroAcesso) {
                navigate("/primeiro-acesso", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }
        } catch (error) {
            console.error("Erro ao fazer login: ", error);
            console.error("Resposta: ", error.response?.data);

            if(error.response?.status === 401) {
                toast.error("E-mail ou senha incorretos.");
                return;
            }

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "E-mail ou senha inválidos."
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

                <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-slate-700">
                        <input
                            type="checkbox"
                            checked={lembrar}
                            onChange={(event) =>
                                setLembrar(event.target.checked)
                            }
                            disabled={loading}
                            className="h-4 w-4 accent-blue-600"
                        />

                        Lembrar-me
                    </label>

                    <button
                        type="button"
                        onClick={() =>
                            toast(
                                "Recuperação de senha será implementada em breve."
                            )
                        }
                        className="text-blue-600 hover:underline"
                    >
                        Esqueceu a senha?
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="h-14 w-full rounded-xl bg-blue-600 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {loading ? "Entrando..." : "Entrar"}
                </button>
            </form>
        </AuthLayout>
    );
}

export default LoginPage;