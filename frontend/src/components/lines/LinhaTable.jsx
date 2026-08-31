import {
    Pencil,
    Trash2,
} from "lucide-react";

function LinhaTable({
                        linhas = [],
                        plantaSelecionada,
                        onEdit,
                        onDelete,
                        canManage = false,
                        loading = false,
                    }) {
    if (!plantaSelecionada) {
        return (
            <EmptyState message="Selecione uma planta para visualizar suas linhas." />
        );
    }

    if (loading) {
        return (
            <EmptyState message="Carregando linhas..." />
        );
    }

    if (linhas.length === 0) {
        return (
            <EmptyState
                message={`Nenhuma linha cadastrada em ${plantaSelecionada.nome}.`}
            />
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[42rem]">
                    <thead className="border-b border-slate-200 bg-slate-50">
                    <tr className="text-left">
                        <Header>Linha</Header>
                        <Header>Descrição</Header>
                        <Header>Status</Header>
                        <Header>Ações</Header>
                    </tr>
                    </thead>

                    <tbody>
                    {linhas.map((linha) => (
                        <tr
                            key={linha.id}
                            className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                        >
                            <td className="px-4 py-4">
                                <p className="text-sm font-semibold text-slate-800">
                                    {linha.nome}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    {linha.codigo}
                                </p>
                            </td>

                            <td className="max-w-sm px-4 py-4 text-sm text-slate-600">
                                {linha.descricao ||
                                    "Sem descrição"}
                            </td>

                            <td className="px-4 py-4">
                                <StatusLocal
                                    status={linha.status}
                                />
                            </td>

                            <td className="px-4 py-4">
                                {canManage && (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onEdit(
                                                    linha
                                                )
                                            }
                                            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                                            title="Editar linha"
                                        >
                                            <Pencil
                                                size={15}
                                            />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                onDelete(
                                                    linha
                                                )
                                            }
                                            className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50"
                                            title="Excluir linha"
                                        >
                                            <Trash2
                                                size={15}
                                            />
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
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

export default LinhaTable;