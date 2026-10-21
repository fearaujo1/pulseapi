import {
    ArrowLeft,
    House,
    LockKeyhole,
    ShieldX,
} from "lucide-react";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import Button from "../components/common/Button.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

const LOGO_PULSEAPI =
    "/branding/png/pulseapi-horizontal-white.png";

/**
 * @param {{
 *     previewMode?: boolean
 * }} props
 */
function AcessoNegadoPage({
                              previewMode = false,
                          }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { usuario } = useAuth();

    const rotaSolicitada =
        location.state?.origem ||
        (previewMode
            ? "/configuracoes"
            : null);

    const perfilAtual =
        usuario?.perfil?.nome ||
        usuario?.perfil ||
        (previewMode
            ? "OPERADOR"
            : "NÃO IDENTIFICADO");

    const destinoPrincipal = previewMode
        ? "/preview/setup"
        : "/dashboard";

    function voltar() {
        if (previewMode) {
            navigate("/preview/setup");
            return;
        }

        if (window.history.length > 1) {
            navigate(-1);
            return;
        }

        navigate("/dashboard", {
            replace: true,
        });
    }

    function irAoInicio() {
        navigate(destinoPrincipal, {
            replace: true,
        });
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#0b1220]">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
            >
                <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-blue-600/10 blur-3xl" />

                <div className="absolute -bottom-52 -right-40 h-[34rem] w-[34rem] rounded-full bg-red-500/[0.07] blur-3xl" />

                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
            </div>

            <div className="relative flex min-h-screen flex-col">
                <header className="flex h-20 items-center justify-between border-b border-white/[0.06] px-5 sm:px-8 lg:px-12">
                    <button
                        type="button"
                        onClick={irAoInicio}
                        className="rounded-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
                        aria-label="Ir para a página inicial"
                    >
                        <img
                            src={LOGO_PULSEAPI}
                            alt="PulseAPI — Smart Production Manager"
                            className="h-auto w-[190px] object-contain object-left sm:w-[220px]"
                        />
                    </button>

                    <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-medium text-slate-400 sm:flex">
                        <LockKeyhole size={14} />
                        Ambiente protegido
                    </div>
                </header>

                <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
                    <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                        <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
                            <aside className="relative hidden overflow-hidden bg-slate-950 p-8 lg:flex lg:flex-col lg:justify-between">
                                <div
                                    aria-hidden="true"
                                    className="absolute -right-24 -top-24 h-64 w-64 rounded-full border-[40px] border-white/[0.03]"
                                />

                                <div
                                    aria-hidden="true"
                                    className="absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl"
                                />

                                <div className="relative">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-blue-400">
                                        <LockKeyhole
                                            size={20}
                                            strokeWidth={1.8}
                                        />
                                    </div>
                                </div>

                                <div className="relative mt-20">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                                        Segurança de acesso
                                    </p>

                                    <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-white">
                                        Recursos protegidos por
                                        perfil e permissão.
                                    </h2>

                                    <p className="mt-4 text-[12px] leading-6 text-slate-400">
                                        O PulseAPI controla quais
                                        áreas e operações ficam
                                        disponíveis para cada tipo
                                        de usuário.
                                    </p>
                                </div>
                            </aside>

                            <div className="p-6 sm:p-8 lg:p-10">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
                                    <ShieldX
                                        size={24}
                                        strokeWidth={1.8}
                                    />
                                </div>

                                <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-600">
                                    Acesso negado
                                </p>

                                <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-slate-950">
                                    Você não possui permissão para
                                    acessar esta página.
                                </h1>

                                <p className="mt-3 text-[13px] leading-6 text-slate-500">
                                    O recurso solicitado não está
                                    disponível para o seu nível de
                                    acesso. Se precisar utilizá-lo,
                                    entre em contato com um
                                    administrador.
                                </p>

                                <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                    <div className="flex items-center justify-between gap-4 px-4 py-3">
                                        <span className="text-[11px] font-medium text-slate-500">
                                            Perfil atual
                                        </span>

                                        <span className="rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white">
                                            {String(
                                                perfilAtual
                                            ).toUpperCase()}
                                        </span>
                                    </div>

                                    {rotaSolicitada && (
                                        <div className="border-t border-slate-200 px-4 py-3">
                                            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                                Rota solicitada
                                            </p>

                                            <p className="mt-1 break-all font-mono text-[11px] text-slate-600">
                                                {
                                                    rotaSolicitada
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="large"
                                        icon={ArrowLeft}
                                        onClick={voltar}
                                        className="flex-1"
                                    >
                                        Voltar
                                    </Button>

                                    <Button
                                        type="button"
                                        size="large"
                                        icon={House}
                                        onClick={irAoInicio}
                                        className="flex-1"
                                    >
                                        {previewMode
                                            ? "Sair"
                                            : "Ir ao dashboard"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="px-5 pb-6 text-center text-[10px] text-slate-600">
                    © 2026 PulseAPI · Smart Production Manager
                </footer>
            </div>
        </main>
    );
}

export default AcessoNegadoPage;