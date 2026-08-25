import { Search } from "lucide-react";
import CustomFilterSelect from "../common/CustomFilterSelect.jsx"

const perfilOptions = [
    { value: "", label: "Todos os perfis" },
    { value: "1", label: "Administrador" },
    { value: "2", label: "Gestor" },
    { value: "3", label: "Supervisor" },
    { value: "4", label: "Operador" },
];

const statusOptions =[
    { value: "", label: "Todos os status" },
    { value: "ATIVO", label: "Ativo" },
    { value: "INATIVO", label: "Inativo" },
];

function UserFilters({
    search,
    onSearchChange,
    perfilFilter,
    onPerfilChange,
    statusFilter,
    onStatusChange,
}) {
    return (
        <div className="flex flex-col gap-3 xl:flex-row">
            <div className="flex h-12 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition
            focus-within:border-blue-500 focus-within:bg-white">
                <Search size={18} className="text-slate-400" />

                <input
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Buscar por nome ou e-mail"
                    className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-slate-400"
                />
            </div>
            <div className="flex flex-wrap gap-4">
                <CustomFilterSelect
                    value={perfilFilter}
                    onChange={onPerfilChange}
                    options={perfilOptions}
                    placeholder="Todos os perfis"
                />

                <CustomFilterSelect
                    value={statusFilter}
                    onChange={onStatusChange}
                    options={statusOptions}
                    placeholder="Todos os status"
                />
            </div>
        </div>
    );
}

export default UserFilters;