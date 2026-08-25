import { CircleHelp } from "lucide-react";

function EventoHelpPopover({
                               isOpen,
                               onToggle,
                           }) {
    return (
        <div className="relative">
            <button
                type="button"
                onClick={onToggle}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-200 bg-white text-blue-600 shadow-sm transition hover:bg-blue-50"
                title="Orientações"
                aria-label="Exibir orientações"
                aria-expanded={isOpen}
            >
                <CircleHelp size={22} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-14 z-50 w-[320px] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
                    <h2 className="mb-4 text-[18px] font-bold text-slate-950">
                        Orientações
                    </h2>

                    <div className="space-y-4 text-[13.5px] text-slate-600">
                        <p>
                            <strong className="text-slate-900">
                                Falha:
                            </strong>{" "}
                            problema em equipamento que impacta a produção.
                        </p>

                        <p>
                            <strong className="text-slate-900">
                                Parada:
                            </strong>{" "}
                            interrupção operacional da linha.
                        </p>

                        <p>
                            <strong className="text-slate-900">
                                Manutenção:
                            </strong>{" "}
                            ação preventiva ou corretiva registrada.
                        </p>
                    </div>

                    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-[13px] font-semibold text-amber-700">
                            Atenção
                        </p>

                        <p className="mt-1 text-[12.5px] text-amber-700/90">
                            Registre informações claras para facilitar o
                            acompanhamento da equipe responsável.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EventoHelpPopover;