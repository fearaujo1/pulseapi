export const producaoStatusMap = {
    AGUARDANDO_DADOS: {
        label: "Aguardando dados",
        className:
            "bg-amber-50 text-amber-700 ring-amber-600/20",
    },

    PRONTA: {
        label: "Pronta",
        className:
            "bg-blue-50 text-blue-700 ring-blue-600/20",
    },

    EM_ANDAMENTO: {
        label: "Em andamento",
        className:
            "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    },

    PAUSADA: {
        label: "Pausada",
        className:
            "bg-orange-50 text-orange-700 ring-orange-600/20",
    },

    AGUARDANDO_AVALIACAO: {
        label: "Aguardando avaliação",
        className:
            "bg-violet-50 text-violet-700 ring-violet-600/20",
    },

    EM_RETRABALHO: {
        label: "Em retrabalho",
        className:
            "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-600/20",
    },

    CONCLUIDA: {
        label: "Concluída",
        className:
            "bg-slate-100 text-slate-700 ring-slate-600/20",
    },

    CANCELADA: {
        label: "Cancelada",
        className:
            "bg-red-50 text-red-700 ring-red-600/20",
    },
};

export function obterStatusProducao(status) {
    return (
        producaoStatusMap[status] || {
            label: status || "Não informado",
            className:
                "bg-slate-100 text-slate-600 ring-slate-500/20",
        }
    );
}