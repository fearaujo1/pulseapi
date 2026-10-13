import {
    ArrowLeft,
    Factory,
    House,
    ShieldX,
} from "lucide-react";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../contexts/AuthContext.jsx";

function AcessoNegadoPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const { usuario } = useAuth();

    const rotaSolicitada =
        location.state?.origem;

    function voltar() {
        /*
         * Quando não existe uma página anterior,
         * direciona para o dashboard.
         */
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }

        navigate(
            "/dashboard",
            { replace: true }
        );
    }

    return (
        <main className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950">
            {/* Luzes decorativas */}

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

                <div className="absolute -bottom-40 -right-32 h-[30rem] w-[30rem] rounded-full bg-red-500/10 blur-3xl" />

                <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
            </div>

            <div className="relative flex min-h-screen flex-col">
                {/* Cabeçalho */}

                <header className="flex items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/dashboard",
                                { replace: true }
                            )
                        }
                        className="flex items-center gap-3 text-left"
                    >
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-950/40">
                            <Factory size={24} />
                        </span>

                        <span>
                            <span className="block text-lg font-bold text-white">
                                PulseAPI
                            </span>

                            <span className="block text-xs text-slate-400">
                                Smart Production Manager
                            </span>
                        </span>
                    </button>

                    <span className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 sm:inline-flex">
                        Ambiente protegido
                    </span>
                </header>

                {/* Conteúdo */}

                <section className="flex flex-1 items-center justify-center px-5 pb-12 pt-4 sm:px-8">
                    <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl shadow-black/40">
                        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                            {/* Área visual */}

                            <div className="relative hidden min-h-[29rem] overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-10 lg:flex lg:flex-col lg:justify-between">
                                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[42px] border-white/5" />

                                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full border-[42px] border-white/5" />

                                <div className="relative">
                                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20 backdrop-blur">
                                        <ShieldX size={34} />
                                    </span>
                                </div>

                                <div className="relative">
                                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
                                        Segurança
                                    </p>

                                    <h2 className="mt-3 text-3xl font-bold leading-tight text-white">
                                        Este ambiente possui acesso controlado.
                                    </h2>

                                    <p className="mt-4 text-sm leading-6 text-blue-100/80">
                                        Cada usuário visualiza somente os recursos permitidos para o seu perfil.
                                    </p>
                                </div>
                            </div>

                            {/* Informações */}

                            <div className="flex min-h-[29rem] flex-col justify-center p-7 sm:p-10 lg:p-12">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100 lg:hidden">
                                    <ShieldX size={29} />
                                </div>

                                <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-red-600 lg:mt-0">
                                    Acesso negado
                                </p>

                                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                                    Você não possui permissão para acessar esta página.
                                </h1>

                                <p className="mt-4 text-sm leading-6 text-slate-600">
                                    O recurso solicitado não está disponível para o seu nível de acesso. Caso precise utilizá-lo, procure um administrador.
                                </p>

                                <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-slate-500">
                                            Perfil atual
                                        </span>

                                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                                            {usuario?.perfil ||
                                                "NÃO IDENTIFICADO"}
                                        </span>
                                    </div>

                                    {rotaSolicitada && (
                                        <div className="mt-3 border-t border-slate-200 pt-3">
                                            <p className="text-xs font-medium text-slate-500">
                                                Rota solicitada
                                            </p>

                                            <p className="mt-1 break-all font-mono text-xs text-slate-700">
                                                {rotaSolicitada}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={voltar}
                                        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                    >
                                        <ArrowLeft size={18} />
                                        Voltar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                "/dashboard",
                                                { replace: true }
                                            )
                                        }
                                        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                                    >
                                        <House size={18} />
                                        Ir ao dashboard
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="relative px-6 pb-6 text-center text-xs text-slate-500">
                    PulseAPI · Controle seguro de produção
                </footer>
            </div>
        </main>
    );
}

export default AcessoNegadoPage;