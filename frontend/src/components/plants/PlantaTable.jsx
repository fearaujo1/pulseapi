import {
    ChevronRight,
    Pencil,
    Trash2,
} from "lucide-react";

function PlantaTable({
                         plantas = [],
                         plantaSelecionada,
                         onSelect,
                         onEdit,
                         onDelete,
                         canManage = false,
                     }) {
    if (plantas.length === 0) {
        return (
            <EmptyState message="Nenhuma planta cadastrada." />
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[44rem]">
                    <thead className="border-b border-slate-200 bg-slate-50">
                    <tr className="text-left">
                        <Header>Planta</Header>
                        <Header>Localização</Header>
                        <Header>Status</Header>
                        <Header>Ações</Header>
                    </tr>
                    </thead>

                    <tbody>
                    {plantas.map((planta) => {
                        const selecionada =
                            plantaSelecionada?.id ===
                            planta.id;

                        return (
                            <tr
                                key={planta.id}
                                onClick={() =>
                                    onSelect(planta)
                                }
                                className={`cursor-pointer border-b border-slate-100 transition last:border-b-0 ${
                                    selecionada
                                        ? "bg-blue-50"
                                        : "hover:bg-slate-50"
                                }`}
                            >
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                                selecionada
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            <ChevronRight
                                                size={16}
                                            />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {planta.nome}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {planta.codigo}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-4 py-4">
                                    <p className="text-sm text-slate-700">
                                        {planta.cidade ||
                                            "Cidade não informada"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {planta.estado ||
                                            "Estado não informado"}
                                    </p>
                                </td>

                                <td className="px-4 py-4">
                                    <StatusLocal
                                        status={
                                            planta.status
                                        }
                                    />
                                </td>

                                <td className="px-4 py-4">
                                    {canManage && (
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={(
                                                    event
                                                ) => {
                                                    event.stopPropagation();
                                                    onEdit(
                                                        planta
                                                    );
                                                }}
                                                className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                                                title="Editar planta"
                                            >
                                                <Pencil
                                                    size={15}
                                                />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={(
                                                    event
                                                ) => {
                                                    event.stopPropagation();
                                                    onDelete(
                                                        planta
                                                    );
                                                }}
                                                className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50"
                                                title="Excluir planta"
                                            >
                                                <Trash2
                                                    size={15}
                                                />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Header({ children }) {
    return (
        <th className="px-4 py-3 text-sm font-semibold text-slate-600">
            {children}
        </th>
    );
}

function StatusLocal({ status }) {
    const ativa = status === "ATIVA";

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                ativa
                    ? "bg-green-50 text-green-600"
                    : "bg-slate-100 text-slate-500"
            }`}
        >
            {ativa ? "Ativa" : "Inativa"}
        </span>
    );
}

function EmptyState({ message }) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
            {message}
        </div>
    );
}

export default PlantaTable;