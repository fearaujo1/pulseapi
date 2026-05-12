import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Factory, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext.jsx';

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [lembrar, setLembrar] = useState(false);
    const [loading, setLoading] = useState(false);

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

            console.log("Retorno login:", data);
            console.log("Usuário logado:", data.usuario);


            toast.success("Login realizado com sucesso!");

            if (data.usuario?.primeiroAcesso) {
                navigate("/primeiro-acesso", { replace: true });
            } else {
                navigate("/equipamentos", { replace: true });
            }
        } catch (error) {
            console.error("Erro ao fazer login: ", error);
            console.error("Resposta: ", error.response?.data);

            toast.error(
                error.response?.data.detail ||
                error.response?.data?.message ||
                "E-mail ou senha inválidos."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center px-4">
            <div className="mb-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-sm mb-6">
                    <Factory size={42} className="text-white" />
                </div>

                <h1 className="text-3xl font-bold text-slate-950">PulseAPI</h1>

                <p className="mt-3 text-slate-600">
                    Sistema de Gestão de Produção Industrial
                </p>
            </div>

            <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-8">
                <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                        <label className="mb-2 block text-lg font-semibold text-slate-900">
                            E-mail
                        </label>

                        <div className="h-14 rounded-2xl bg-slate-100 flex items-center gap-3 px-4 focus-within:ring-2 focus-within:ring-blue-500">
                            <Mail size={22} className="text-slate-400" />
                            <input
                                type="email"
                                placeholder="seu.email@empresa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent outline-none text-l text-slate-700 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="mb-2 block text-lg font-semibold text-slate-900">
                            Senha
                        </label>

                        <div className="h-14 rounded-2xl bg-slate-100 flex items-center gap-3 px-4 focus-within:ring-2 focus-within:ring-blue-500">
                            <Lock size={22} className="text-slate-400" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                className="w-full bg-transparent outline-none text-l text-slate-700 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="mb-7 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={lembrar}
                                onChange={(e) => setLembrar(e.target.checked)}
                                className="w-4 h-4 accent-blue-600"
                            />
                            Lembrar-me
                        </label>

                        <button
                            type="button"
                            className="text-blue-600 hover:underline"
                            onClick={() => toast("Recuperação de senha será implementada em breve.")}
                        >
                            Esqueceu a senha?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-xl bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>

            <p className="mt-8 max-w-xl text-center text-slate-600">
                © 2026 PulseAPI - Smart Production Manager. Todos os direitos reservados.
            </p>
        </div>
    );
}

export default LoginPage;