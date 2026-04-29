import { Search } from "lucide-react";
import CustomFilterSelect from "./CustomFilterSelect";

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
        ...tipos.map((tipo) => ({
            value: tipo,
            label: tipo,
        })),
    ];

    const statusOptions = [
        { value: "", label: "Todos os status" },
        { value: "ATIVO", label: "Ativo" },
        { value: "INATIVO", label: "Inativo" },
        { value: "EM_MANUTENCAO", label: "Em manutenção" },
    ];

    return (
        <div className="flex flex-col xl:flex-row gap-4">
            <div className="flex items-center gap-3 flex-1 h-12 rounded-2xl bg-slate-50 border border-slate-200 px-4 transition-all duration-200 focus-within:border-blue-500 focus-within:bg-white">
                <Search size={18} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar por nome ou código..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent outline-none text-[13.5px] placeholder:text-slate-400"
                />
            </div>

            <div className="flex gap-4 flex-wrap">
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
            </div>
        </div>
    );
}

export default EquipmentFilters;