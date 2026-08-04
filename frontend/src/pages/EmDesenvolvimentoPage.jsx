import { Construction, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/layout/Topbar";

function EmDesenvolvimentoPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f5f7fb]">
            <Topbar />

            <main className="flex min-h-[calc(100vh-64px)] items-center justify-center p-6">
                <section className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <Construction size={34} />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-950">
                        Página em desenvolvimento
                    </h1>

                    <p className="mt-3 text-[15px] text-slate-600">
                        Este módulo ainda está sendo implementado e fará parte das próximas etapas do sistema.
                    </p>
                    
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="mx-auto mt-8 flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-6 text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                        <ArrowLeft size={16} />
                        Voltar ao Dashboard
                    </button>
                </section>
            </main>
        </div>
    );
}

export default EmDesenvolvimentoPage;