import ContentCard from "../common/ContentCard.jsx";

function ResultadoGeral({ resultado }) {
    const secoes = [
        {
            titulo: "Produções",
            total: resultado.producoes?.total,
            itens: [
                ["Em andamento", resultado.producoes?.emAndamento],
                ["Pausadas", resultado.producoes?.pausadas],
                ["Em avaliação", resultado.producoes?.aguardandoAvaliacao],
                ["Em retrabalho", resultado.producoes?.emRetrabalho],
                ["Concluídas", resultado.producoes?.concluidas],
                ["Canceladas", resultado.producoes?.canceladas],
            ],
        },
        {
            titulo: "Impressões",
            total: resultado.impressoes?.total,
            itens: [
                ["Pendentes", resultado.impressoes?.pendentes],
                ["Processando", resultado.impressoes?.emProcessamento],
                ["Impressos", resultado.impressoes?.impressos],
                ["Erros", resultado.impressoes?.erros],
                ["Cancelados", resultado.impressoes?.cancelados],
            ],
        },
        {
            titulo: "Ocorrências",
            total: resultado.ocorrencias?.total,
            itens: [
                ["Abertas", resultado.ocorrencias?.abertas],
                ["Em análise", resultado.ocorrencias?.emAnalise],
                ["Em atendimento", resultado.ocorrencias?.emAtendimento],
                ["Resolvidas", resultado.ocorrencias?.resolvidas],
                ["Canceladas", resultado.ocorrencias?.canceladas],
            ],
        },
        {
            titulo: "Equipamentos",
            total: resultado.equipamentos?.total,
            itens: [
                ["Ativos", resultado.equipamentos?.ativos],
                ["Inativos", resultado.equipamentos?.inativos],
                ["Em manutenção", resultado.equipamentos?.emManutencao],
                ["Sem conexão", resultado.equipamentos?.semConexao],
                ["Parados", resultado.equipamentos?.parados],
            ],
        },
    ];

    return (
        <ContentCard
            title="Visão consolidada"
            subtitle={
                resultado.geradoEm
                    ? `Atualizado em ${formatarData(resultado.geradoEm)}`
                    : "Distribuição dos registros encontrados"
            }
        >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {secoes.map((secao) => (
                    <section
                        key={secao.titulo}
                        className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                    >
                        <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
                            <h3 className="text-sm font-bold text-slate-800">
                                {secao.titulo}
                            </h3>

                            <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                                {secao.total ?? 0}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-3">
                            {secao.itens.map(([label, value]) => (
                                <div
                                    key={label}
                                    className="flex min-w-0 items-center justify-between gap-2"
                                >
                                    <span className="truncate text-[11px] text-slate-500">
                                        {label}
                                    </span>
                                    <strong className="text-xs text-slate-800">
                                        {value ?? 0}
                                    </strong>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </ContentCard>
    );
}

function formatarData(data) {
    const valor = new Date(data);

    if (Number.isNaN(valor.getTime())) return "data não informada";

    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(valor);
}

export default ResultadoGeral;
