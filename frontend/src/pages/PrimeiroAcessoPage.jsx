import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Factory, Lock, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

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

        return temMinimo && temMaiuscula && temMinuscula && temNumero&& temEspecial;
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
            navigate("/login");
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center px-4">
            <div className="mb-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-sm mb-6">
                    <Factory size={42} className="text-white" />
                </div>

                <h1 className="text-4xl font-bold text-slate-950">Primeiro Acesso</h1>

                <p className="mt-3 text-xl text-slate-600">
                    Olá, {usuario?.nome || "usuário"}. Defina uma nova senha para continuar.
                </p>
            </div>

            <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-8">
                <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                        <label className="mb-2 block text-lg font-semibold text-slate-900">
                            Nova Senha
                        </label>

                        <div className="h-14 rounded-2xl bg-slate-100 flex items-center gap-3 px-4 focus-within:ring-2 focus-within:ring-blue-500">
                            <Lock size={22} className="text-slate-400" />
                            <input
                                type="password"
                                placeholder="Digite sua nova senha"
                                value={novaSenha}
                                onChange={(e) => setNovaSenha(e.target.value)}
                                className="w-full bg-transparent outline-none text-lg text-slate-700 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="mb-2 block text-lg font-semibold text-slate-900">
                            Confirmar Senha
                        </label>

                        <div className="h-14 rounded-2xl bg-slate-100 flex items-center gap-3 px-4 focus-within:ring-2 focus-within:ring-blue-500">
                            <Lock size={22} className="text-slate-400" />
                            <input
                                type="password"
                                placeholder="Confirme sua nova senha"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                className="w-full bg-transparent outline-none text-lg text-slate-700 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                        <div className="flex gap-3">
                            <CheckCircle2 size={20} className="text-blue-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-blue-700">Critérios da senha:</p>
                                <p className="mt-1 text-blue-700/90">
                                    Mínimo de 8 caracteres, letra maiúscula, letra minúscula,
                                    número e caractere especial.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-xl bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Alterando..." : "Alterar Senha"}
                    </button>
                </form>
            </div>

            <p className="mt-8 max-w-xl text-center text-lg text-slate-600">
                © 2026 PulseAPI - Smart Production Manager. Todos os direitos reservados.
            </p>
        </div>
    );
}

export default PrimeiroAcessoPage;