import { Search, X } from "lucide-react";
import CustomFilterSelect from "../common/CustomFilterSelect";

const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "true", label: "Ativos" },
    { value: "false", label: "Inativos" },
];

function LayoutImpressaoFilters({
                                    search,
                                    onSearchChange,
                                    equipamentoFilter,
                                    onEquipamentoChange,
                                    statusFilter,
                                    onStatusChange,
                                    equipamentos = [],
                                }) {
    const equipamentoOptions = [
        { value: "", label: "Todos os equipamentos" },
        ...equipamentos.map((equipamento) => ({
            value: String(equipamento.id),
            label: equipamento.nome,
        })),
    ];

    const possuiFiltros = Boolean(
        search || equipamentoFilter || statusFilter
    );

    function limparFiltros() {
        onSearchChange("");
        onEquipamentoChange("");
        onStatusChange("");
    }

    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex h-10 w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 lg:max-w-md">
                <Search size={15} className="shrink-0 text-slate-400" />

                <input
                    type="search"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Buscar por layout ou equipamento"
                    className="min-w-0 flex-1 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
                />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <CustomFilterSelect
                    value={equipamentoFilter}
                    onChange={onEquipamentoChange}
                    options={equipamentoOptions}
                    placeholder="Todos os equipamentos"
                    className="sm:w-52"
                />

                <CustomFilterSelect
                    value={statusFilter}
                    onChange={onStatusChange}
                    options={statusOptions}
                    placeholder="Todos os status"
                />

                {possuiFiltros && (
                    <button
                        type="button"
                        onClick={limparFiltros}
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    >
                        <X size={14} />
                        Limpar
                    </button>
                )}
            </div>
        </div>
    );
}

export default LayoutImpressaoFilters;
