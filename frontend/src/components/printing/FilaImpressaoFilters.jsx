import { Search } from "lucide-react";
import CustomFilterSelect from "../common/CustomFilterSelect";

const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "PENDENTE", label: "Pendente" },
    { value: "ENVIANDO", label: "Enviando" },
    { value: "ENVIADO_FIFO", label: "Enviado ao FIFO" },
    {
        value: "PRONTO_IMPRESSAO",
        label: "Pronto para impressão",
    },
    { value: "IMPRESSO", label: "Impresso" },
    { value: "ERRO", label: "Erro" },
    { value: "CANCELADO", label: "Cancelado" },
];

function FilaImpressaoFilters({
                                  search,
                                  onSearchChange,
                                  equipamentoFilter,
                                  onEquipamentoChange,
                                  statusFilter,
                                  onStatusChange,
                                  equipamentos = [],
                              }) {
    const equipamentoOptions = [
        {
            value: "",
            label: "Todos os equipamentos",
        },
        ...equipamentos.map((equipamento) => ({
            value: String(equipamento.id),
            label: equipamento.nome,
        })),
    ];

    return (
        <div className="flex flex-col gap-4 xl:flex-row">
            <div className="flex h-14 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white">
                <Search
                    size={18}
                    className="shrink-0 text-slate-400"
                />

                <input
                    value={search}
                    onChange={(event) =>
                        onSearchChange(event.target.value)
                    }
                    placeholder="Buscar equipamento, layout ou payload..."
                    className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-slate-400"
                />
            </div>

            <div className="flex flex-wrap gap-4">
                <CustomFilterSelect
                    value={equipamentoFilter}
                    onChange={onEquipamentoChange}
                    options={equipamentoOptions}
                    placeholder="Todos os equipamentos"
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

export default FilaImpressaoFilters;