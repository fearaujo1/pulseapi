import {
    Eye,
    Factory,
} from "lucide-react";

import {
    obterStatusProducao,
} from "./producaoStatusMap.js";

function ProducoesTable({
                            producoes = [],
                            loading = false,
                            onSelect,
                        }) {
    if (loading) {
        return (
            <EmptyState message="Carregando produções..." />
        );
    }

    if (producoes.length === 0) {
        return (
            <EmptyState message="Nenhuma produção encontrada." />
        );
    }

    return (
        <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[70rem]">
                    <thead className="border-b border-slate-200 bg-slate-50">
                    <tr className="text-left">
                        <Header>Ordem</Header>
                        <Header>Linha</Header>
                        <Header>Equipamento</Header>
                        <Header>Quantidade</Header>
                        <Header>Status</Header>
                        <Header>Criada em</Header>
                        <Header>Ações</Header>
                    </tr>
                    </thead>

                    <tbody>
                    {producoes.map((producao) => {
                        const status =
                            obterStatusProducao(
                                producao.status
                            );

                        return (
                            <tr
                                key={producao.id}
                                className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                            >
                                <td className="px-4 py-4">
                                    <p className="text-sm font-semibold text-slate-900">
                                        {producao.codigoOrdem}
                                    </p>
                                </td>

                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <Factory
                                            size={16}
                                            className="shrink-0 text-slate-400"
                                        />

                                        <span>
                                                {producao.linhaNome ||
                                                    `Linha #${producao.linhaId}`}
                                            </span>
                                    </div>
                                </td>

                                <td className="px-4 py-4">
                                    <p className="text-sm font-medium text-slate-700">
                                        {producao.equipamentoPrincipalNome ||
                                            "Não informado"}
                                    </p>

                                    {producao.equipamentoRetrabalhoNome && (
                                        <p className="mt-1 text-xs text-slate-500">
                                            Retrabalho:{" "}
                                            {
                                                producao.equipamentoRetrabalhoNome
                                            }
                                        </p>
                                    )}
                                </td>

                                <td className="px-4 py-4">
                                    <p className="text-lg font-semibold text-slate-800">
                                        {producao.quantidadeTotal ??
                                            "—"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        itens
                                    </p>
                                </td>

                                <td className="px-4 py-4">
                                        <span
                                            className={`
                                                inline-flex whitespace-nowrap
                                                rounded-full px-3 py-1
                                                text-xs font-semibold
                                                ring-1 ring-inset
                                                ${status.className}
                                            `}
                                        >
                                            {status.label}
                                        </span>
                                </td>

                                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                                    {formatarData(
                                        producao.criadoEm
                                    )}
                                </td>

                                <td className="px-4 py-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onSelect?.(
                                                producao
                                            )
                                        }
                                        className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                        title="Visualizar produção"
                                    >
                                        <Eye size={15} />
                                        Visualizar
                                    </button>
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
        <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-600">
            {children}
        </th>
    );
}

function EmptyState({ message }) {
    return (
        <div className="w-full rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
            {message}
        </div>
    );
}

function formatarData(data) {
    if (!data) {
        return "—";
    }

    return new Date(data).toLocaleString(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short",
        }
    );
}

export default ProducoesTable;