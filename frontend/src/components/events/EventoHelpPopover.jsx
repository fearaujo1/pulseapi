import { CircleHelp } from "lucide-react";

function EventoHelpPopover({ isOpen, onToggle }) {
    return (
        <div className="relative">
            <button type="button" onClick={onToggle} className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600" title="Orientações" aria-label="Exibir orientações" aria-expanded={isOpen}><CircleHelp size={18} /></button>
            {isOpen && (
                <div className="absolute right-0 top-12 z-50 w-[300px] rounded-xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10">
                    <h2 className="text-sm font-bold text-slate-900">Orientações</h2>
                    <div className="mt-3 space-y-2.5 text-xs leading-5 text-slate-600">
                        <p><strong className="text-slate-800">Falha:</strong> problema em um equipamento que afeta a produção.</p>
                        <p><strong className="text-slate-800">Parada:</strong> interrupção operacional de uma linha.</p>
                        <p><strong className="text-slate-800">Manutenção:</strong> ação preventiva ou corretiva registrada.</p>
                    </div>
                    <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] leading-4 text-amber-800">Use um título objetivo e descreva os sintomas observados.</p>
                </div>
            )}
        </div>
    );
}
export default EventoHelpPopover;
