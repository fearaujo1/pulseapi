import {
    FileText,
    Search,
} from "lucide-react";

import ContentCard from "../common/ContentCard.jsx";
import StatusBadge from "../common/StatusBadge.jsx";
import Pagination from "../common/Pagination.jsx";
import {
    DataTable,
    TablePrimaryText,
    TableSecondaryText,
    TableText,
} from "../common/table/index.js";

function ResultadoDetalhado({
                                tipo,
                                total = 0,
                                itens = [],
                                search = "",
                                onSearchChange,
                                currentPage = 1,
                                totalPages = 1,
                                onPageChange,
                            }) {
    return (
        <ContentCard
            title="Resultado detalhado"
            subtitle={`${total} ${
                total === 1
                    ? "registro encontrado"
                    : "registros encontrados"
            }`}
            headerActions={
                <Busca
                    value={search}
                    onChange={onSearchChange}
                />
            }
        >
            {tipo === "IMPRESSOES" && (<TabelaImpressoes itens={itens}/>)}
            {tipo === "OCORRENCIAS" && (<TabelaOcorrencias itens={itens}/>)}
            {tipo === "EQUIPAMENTOS" && (<TabelaEquipamentos itens={itens}/>)}

            {![
                "IMPRESSOES",
                "OCORRENCIAS",
                "EQUIPAMENTOS",
            ].includes(tipo) && (
                <DataTable
                    columns={[]}
                    data={[]}
                    emptyIcon={FileText}
                    emptyTitle="Selecione um relatório"
                    emptyDescription="Escolha o tipo de relatório que deseja consultar."
                />
            )}

            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            )}
        </ContentCard>
    );
}

function Busca({
                   value,
                   onChange,
               }) {
    return (
        <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 sm:w-72">
            <Search
                size={15}
                className="shrink-0 text-slate-400"
            />

            <input
                type="search"
                value={value}
                onChange={(event) =>
                    onChange?.(
                        event.target.value
                    )
                }
                placeholder="Buscar no resultado..."
                className="min-w-0 flex-1 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            />
        </div>
    );
}

function TabelaImpressoes({
                              itens = [],
                          }) {
    const columns = [
        {
            key: "data",
            header: "Data",
            width: "10rem",
            render: (item) => (
                <DataRegistro
                    value={item.criadoEm}
                />
            ),
        },
        {
            key: "equipamento",
            header: "Equipamento",
            width: "14rem",
            render: (item) => (
                <TablePrimaryText
                    title={item.equipamentoNome}
                >
                    {item.equipamentoNome || "Não informado"}
                </TablePrimaryText>
            ),
        },
        {
            key: "layout",
            header: "Layout",
            width: "13rem",
            render: (item) => (
                <TableText
                    title={item.layoutNome}
                >
                    {item.layoutNome ||
                        "Não informado"}
                </TableText>
            ),
        },
        {
            key: "payload",
            header: "Payload",
            width: "20rem",
            render: (item) => (
                <code
                    className="block max-w-80 truncate rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-600"
                    title={
                        item.payloadMontado
                    }
                >
                    {item.payloadMontado ||
                        "—"}
                </code>
            ),
        },
        {
            key: "status",
            header: "Status",
            width: "10rem",
            render: (item) => (
                <StatusBadge
                    status={item.status}
                    showDot
                />
            ),
        },
        {
            key: "tentativas",
            header: "Tentativas",
            align: "right",
            width: "7rem",
            render: (item) => (
                <span className="font-semibold tabular-nums text-slate-700">
                    {item.tentativas ?? 0}
                </span>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={itens}
            minWidth="64rem"
            rowKey={(item, index) =>
                item.id ??
                `impressao-${index}`
            }
            emptyIcon={FileText}
            emptyTitle="Nenhuma impressão encontrada"
            emptyDescription="Tente alterar os filtros utilizados."
        />
    );
}

function TabelaOcorrencias({
                               itens = [],
                           }) {
    const columns = [
        {
            key: "data",
            header: "Data",
            width: "10rem",
            render: (item) => (
                <DataRegistro
                    value={item.criadoEm}
                />
            ),
        },
        {
            key: "equipamento",
            header: "Equipamento",
            width: "14rem",
            render: (item) => (
                <TablePrimaryText
                    title={
                        item.equipamentoNome
                    }
                >
                    {item.equipamentoNome ||
                        "Não informado"}
                </TablePrimaryText>
            ),
        },
        {
            key: "titulo",
            header: "Título",
            width: "15rem",
            render: (item) => (
                <TablePrimaryText
                    title={item.titulo}
                >
                    {item.titulo ||
                        "Sem título"}
                </TablePrimaryText>
            ),
        },
        {
            key: "tipo",
            header: "Tipo",
            width: "12rem",
            render: (item) => (
                <TableText>
                    {formatarStatus(
                        item.tipo
                    )}
                </TableText>
            ),
        },
        {
            key: "status",
            header: "Status",
            width: "10rem",
            render: (item) => (
                <StatusBadge
                    status={item.status}
                    showDot
                />
            ),
        },
        {
            key: "descricao",
            header: "Descrição",
            width: "20rem",
            render: (item) => (
                <TableText
                    title={item.descricao}
                >
                    {item.descricao ||
                        "Sem descrição"}
                </TableText>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={itens}
            minWidth="68rem"
            rowKey={(item, index) =>
                item.id ??
                `ocorrencia-${index}`
            }
            emptyIcon={FileText}
            emptyTitle="Nenhuma ocorrência encontrada"
            emptyDescription="Tente alterar os filtros utilizados."
        />
    );
}

function TabelaEquipamentos({
                                itens = [],
                            }) {
    const columns = [
        {
            key: "equipamento",
            header: "Equipamento",
            width: "16rem",
            render: (item) => (
                <div className="min-w-0">
                    <TablePrimaryText
                        title={item.nome}
                    >
                        {item.nome ||
                            "Sem nome"}
                    </TablePrimaryText>

                    <TableSecondaryText>
                        {item.codigo ||
                            "Sem código"}
                    </TableSecondaryText>
                </div>
            ),
        },
        {
            key: "tipo",
            header: "Tipo",
            width: "11rem",
            render: (item) => (
                <TableText
                    title={item.tipo}
                >
                    {item.tipo ||
                        "Não informado"}
                </TableText>
            ),
        },
        {
            key: "modelo",
            header: "Modelo",
            width: "12rem",
            render: (item) => (
                <TableText
                    title={item.modelo}
                >
                    {item.modelo ||
                        "Não informado"}
                </TableText>
            ),
        },
        {
            key: "status",
            header: "Status",
            width: "10rem",
            render: (item) => (
                <StatusBadge
                    status={item.status}
                    showDot
                />
            ),
        },
        {
            key: "conexao",
            header: "Conexão",
            width: "11rem",
            render: (item) => (
                <StatusBadge
                    status={
                        item.statusConexao ||
                        "SEM_CONEXAO"
                    }
                    showDot
                />
            ),
        },
        {
            key: "ip",
            header: "IP",
            width: "10rem",
            render: (item) => (
                <code className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-700">
                    {item.ip || "—"}
                </code>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={itens}
            minWidth="60rem"
            rowKey={(item, index) =>
                item.id ??
                item.codigo ??
                `equipamento-${index}`
            }
            emptyIcon={FileText}
            emptyTitle="Nenhum equipamento encontrado"
            emptyDescription="Tente alterar os filtros utilizados."
        />
    );
}

function DataRegistro({
                          value,
                      }) {
    const data = criarDataValida(
        value
    );

    if (!data) {
        return (
            <TableText>
                —
            </TableText>
        );
    }

    return (
        <div className="whitespace-nowrap">
            <TablePrimaryText>
                {data.toLocaleDateString(
                    "pt-BR"
                )}
            </TablePrimaryText>

            <TableSecondaryText>
                {data.toLocaleTimeString(
                    "pt-BR",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                    }
                )}
            </TableSecondaryText>
        </div>
    );
}

function criarDataValida(valor) {
    if (!valor) {
        return null;
    }

    const data = new Date(valor);

    return Number.isNaN(
        data.getTime()
    )
        ? null
        : data;
}

function formatarStatus(valor) {
    if (!valor) {
        return "—";
    }

    return valor
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            (letra) =>
                letra.toUpperCase()
        );
}

export default ResultadoDetalhado;