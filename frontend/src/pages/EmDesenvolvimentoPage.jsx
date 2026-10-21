import {
    ArrowLeft,
    Construction,
    LayoutDashboard,
    Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../components/common/Button.jsx";
import Topbar from "../components/layout/Topbar.jsx";

function EmDesenvolvimentoPage({
                                   previewMode = false,
                               }) {
    const navigate = useNavigate();

    function voltar() {
        navigate(
            previewMode
                ? "/preview/setup"
                : "/dashboard",
            {
                replace: true,
            }
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            {!previewMode && <Topbar />}

            <main
                className={`flex items-center justify-center px-4 py-10 sm:px-6 ${
                    previewMode
                        ? "min-h-screen"
                        : "min-h-[calc(100vh-64px)]"
                }`}
            >
                <section className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
                    <div className="border-b border-slate-100 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <Construction
                                    size={19}
                                    strokeWidth={1.8}
                                />
                            </div>

                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600">
                                    PulseAPI
                                </p>

                                <h1 className="mt-0.5 text-lg font-semibold text-slate-950">
                                    Módulo em desenvolvimento
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-8 text-center sm:px-10 sm:py-10">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
                            <Wrench
                                size={28}
                                strokeWidth={1.7}
                            />
                        </div>

                        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
                            Estamos preparando esta funcionalidade
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-[13px] leading-6 text-slate-500">
                            Este módulo ainda está sendo
                            implementado e ficará disponível em
                            uma próxima atualização do sistema.
                        </p>

                        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left">
                            <div className="flex items-start gap-3">
                                <Construction
                                    size={16}
                                    className="mt-0.5 shrink-0 text-slate-400"
                                />

                                <div>
                                    <p className="text-xs font-semibold text-slate-700">
                                        Funcionalidade indisponível
                                    </p>

                                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                        As demais áreas do sistema
                                        continuam funcionando
                                        normalmente.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-center text-[10px] text-slate-400 sm:text-left">
                            Smart Production Manager
                        </p>

                        <Button
                            type="button"
                            size="medium"
                            icon={
                                previewMode
                                    ? ArrowLeft
                                    : LayoutDashboard
                            }
                            onClick={voltar}
                            className="w-full sm:w-auto"
                        >
                            {previewMode
                                ? "Sair da visualização"
                                : "Ir ao dashboard"}
                        </Button>
                    </footer>
                </section>
            </main>
        </div>
    );
}

export default EmDesenvolvimentoPage;