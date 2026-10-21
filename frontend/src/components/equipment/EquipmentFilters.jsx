import { Search, X } from "lucide-react";
import CustomFilterSelect from "../common/CustomFilterSelect.jsx";

function EquipmentFilters({
                              search,
                              setSearch,
                              statusFilter,
                              setStatusFilter,
                              typeFilter,
                              setTypeFilter,
                              tipos = [],
                          }) {
    const typeOptions = [
        { value: "", label: "Todos os tipos" },
        ...tipos.map((tipo) => ({ value: tipo, label: tipo })),
    ];

    const statusOptions = [
        { value: "", label: "Todos os status" },
        { value: "ATIVO", label: "Ativo" },
        { value: "INATIVO", label: "Inativo" },
        { value: "EM_MANUTENCAO", label: "Em manutenção" },
    ];

    const possuiFiltros = Boolean(search || typeFilter || statusFilter);

    function limparFiltros() {
        setSearch("");
        setTypeFilter("");
        setStatusFilter("");
    }

    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex h-10 w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 lg:max-w-md">
                <Search size={15} className="shrink-0 text-slate-400" />

                <input
                    type="search"
                    placeholder="Buscar por nome ou código"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
                />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <CustomFilterSelect
                    value={typeFilter}
                    onChange={setTypeFilter}
                    options={typeOptions}
                    placeholder="Todos os tipos"
                />

                <CustomFilterSelect
                    value={statusFilter}
                    onChange={setStatusFilter}
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

export default EquipmentFilters;
