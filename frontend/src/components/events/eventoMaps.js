export const eventoStatusMap = {
    ABERTA: {
        label: "Aberta",
        className: "bg-red-50 text-red-600",
    },
    EM_ANALISE: {
        label: "Em análise",
        className: "bg-blue-50 text-blue-600",
    },
    EM_ATENDIMENTO: {
        label: "Em atendimento",
        className: "bg-amber-50 text-amber-600",
    },
    RESOLVIDA: {
        label: "Resolvida",
        className: "bg-green-50 text-green-600",
    },
    CANCELADA: {
        label: "Cancelada",
        className: "bg-slate-100 text-slate-500",
    },
};

export const eventoTipoMap = {
    FALHA_EQUIPAMENTO: {
        label: "Falha de equipamento",
        className: "bg-red-50 text-red-600",
    },
    PARADA_LINHA: {
        label: "Parada de linha",
        className: "bg-amber-50 text-amber-600",
    },
    MANUTENCAO: {
        label: "Manutenção",
        className: "bg-blue-50 text-blue-600",
    },
    OUTRO: {
        label: "Outro",
        className: "bg-slate-100 text-slate-500",
    },
};