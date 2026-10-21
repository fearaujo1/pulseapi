import { Search, X } from "lucide-react";
import CustomFilterSelect from "../common/CustomFilterSelect.jsx";

const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "ABERTA", label: "Aberta" },
    { value: "EM_ANALISE", label: "Em análise" },
    { value: "EM_ATENDIMENTO", label: "Em atendimento" },
    { value: "RESOLVIDA", label: "Resolvida" },
    { value: "CANCELADA", label: "Cancelada" },
];

const tipoOptions = [
    { value: "", label: "Todos os tipos" },
    { value: "FALHA_EQUIPAMENTO", label: "Falha de equipamento" },
    { value: "PARADA_LINHA", label: "Parada de linha" },
    { value: "MANUTENCAO", label: "Manutenção" },
    { value: "OUTRO", label: "Outro" },
];

function EventoFilters({ search, onSearchChange, tipoFilter, onTipoChange, statusFilter, onStatusChange }) {
    const possuiFiltros = Boolean(search || tipoFilter || statusFilter);

    function limparFiltros() {
        onSearchChange("");
        onTipoChange("");
        onStatusChange("");
    }

    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10">
                <Search size={15} className="shrink-0 text-slate-400" />
                <input
                    type="search"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Buscar por título, descrição ou equipamento..."
                    className="min-w-0 flex-1 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
                />
            </div>

            <div className="flex flex-wrap gap-2">
                <CustomFilterSelect value={tipoFilter} onChange={onTipoChange} options={tipoOptions} placeholder="Todos os tipos" className="sm:w-48" />
                <CustomFilterSelect value={statusFilter} onChange={onStatusChange} options={statusOptions} placeholder="Todos os status" className="sm:w-44" />

                {possuiFiltros && (
                    <button type="button" onClick={limparFiltros} className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
                        <X size={14} /> Limpar
                    </button>
                )}
            </div>
        </div>
    );
}

export default EventoFilters;
