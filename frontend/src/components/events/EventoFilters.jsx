import { Search } from "lucide-react";
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

function EventoFilters({
    search,
    onSearchChange,
    tipoFilter,
    onTipoChange,
    statusFilter,
    onStatusChange,
}) {
    return (
        <div className="flex flex-col gap-4 xl:flex-row">
            <div className="flex h-14 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition
            focus-within:border-blue-500 focus-within:bg-white">
                <Search size={18} className="text-slate-400" />

                <input
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Buscar por título, descrição ou equipamento..."
                    className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-slate-400"
                />
            </div>

            <div className="flex flex-wrap gap-4">
                <CustomFilterSelect
                    value={tipoFilter}
                    onChange={onTipoChange}
                    options={tipoOptions}
                    placeholder="Todos os tipos"
                />

                <CustomFilterSelect
                    value={statusFilter}
                    onChange={onStatusChange}
                    option={statusOptions}
                    placeholder="Todos os status"
                />
            </div>
        </div>
    );
}

export default EventoFilters;