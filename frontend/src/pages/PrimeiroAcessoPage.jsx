import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authService } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import { Lock } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import AuthField from "../components/auth/AuthField";
import PasswordRequirements from "../components/auth/PasswordRequirements";

function PrimeiroAcessoPage() {
    const navigate = useNavigate();
    const { usuario, logout } = useAuth();

    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [loading, setLoading] = useState(false);

    function validarSenha(senha) {
        const temMinimo = senha.length >= 8;
        const temMaiuscula = /[A-Z]/.test(senha);
        const temMinuscula = /[a-z]/.test(senha);
        const temNumero = /\d/.test(senha);
        const temEspecial = /[^A-Za-z0-9]/.test(senha);

        return temMinimo &&
            temMaiuscula &&
            temMinuscula &&
            temNumero &&
            temEspecial;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!novaSenha || !confirmarSenha) {
            toast.error("Preencha todos os campos.");
            return;
        }

        if (novaSenha !== confirmarSenha) {
            toast.error("As senhas não coincidem.")
            return;
        }

        if (!validarSenha(novaSenha)) {
            toast.error("A senha não atende aos critérios de segurança.");
            return;
        }

        try {
            setLoading(true);

            await authService.primeiroAcesso({
                novaSenha,
                confirmarSenha,
            });

            toast.success("Senha alterada com sucesso. Faça login novamente.");

            logout();
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Erro ao primeiro acesso:", error);
            console.error("Resposta:", error.response?.data);

            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Erro ao alterar senha."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout
            title="Primeiro Acesso"
            description={`Olá, ${
                usuario?.nome || "usuário"
            }. Defina uma nova senha para continuar.`}
        >
            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >
                <AuthField
                    label="Nova Senha"
                    icon={Lock}
                    type="password"
                    placeholder="Digite sua nova senha"
                    value={novaSenha}
                    onChange={setNovaSenha}
                    autoComplete="new-password"
                    disabled={loading}
                />

                <AuthField
                    label="Confirmar Senha"
                    icon={Lock}
                    type="password"
                    placeholder="Confirme sua nova senha"
                    value={confirmarSenha}
                    onChange={setConfirmarSenha}
                    autoComplete="new-password"
                    disabled={loading}
                />

                <PasswordRequirements />

                <button
                    type="submit"
                    disabled={loading}
                    className="h-14 w-full rounded-xl bg-blue-600 text-lg font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {loading ? "Alterando..." : "Alterar Senha"}
                </button>
            </form>
        </AuthLayout>
    );
}

export default PrimeiroAcessoPage;