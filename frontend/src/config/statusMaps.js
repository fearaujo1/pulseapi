/*
 * Configurações visuais centralizadas dos badges do sistema.
 *
 * Cada mapa representa um domínio específico para evitar conflitos
 * entre status que possuem o mesmo valor, mas significados diferentes.
 */

const styles = {
    emerald:
        "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    blue:
        "bg-blue-50 text-blue-700 ring-blue-600/20",
    violet:
        "bg-violet-50 text-violet-700 ring-violet-600/20",
    amber:
        "bg-amber-50 text-amber-700 ring-amber-600/20",
    orange:
        "bg-orange-50 text-orange-700 ring-orange-600/20",
    fuchsia:
        "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-600/20",
    red:
        "bg-red-50 text-red-700 ring-red-600/20",
    indigo:
        "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
    slate:
        "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export const equipamentoStatusMap = {
    ATIVO: {
        label: "Ativo",
        className: styles.emerald,
    },
    INATIVO: {
        label: "Inativo",
        className: styles.slate,
    },
    EM_MANUTENCAO: {
        label: "Em manutenção",
        className: styles.amber,
    },
    PARADO: {
        label: "Parado",
        className: styles.orange,
    },
};

export const conexaoStatusMap = {
    CONECTADO: {
        label: "Conectado",
        className: styles.emerald,
    },
    SEM_CONEXAO: {
        label: "Sem conexão",
        className: styles.red,
    },
};

export const statusMaps = {
    ...equipamentoStatusMap,
    ...conexaoStatusMap,

    ATIVA: {
        label: "Ativa",
        className: styles.emerald,
    },
    INATIVA: {
        label: "Inativa",
        className: styles.slate,
    },
};

export const estruturaStatusMap = {
    ATIVA: {
        label: "Ativa",
        className: styles.emerald,
    },
    INATIVA: {
        label: "Inativa",
        className: styles.slate,
    },
};

export const producaoStatusMap = {
    AGUARDANDO_DADOS: {
        label: "Aguardando dados",
        className: styles.amber,
        dotClass: "bg-amber-500",
    },
    PRONTA: {
        label: "Pronta",
        className: styles.blue,
        dotClass: "bg-blue-500",
    },
    EM_ANDAMENTO: {
        label: "Em andamento",
        className: styles.emerald,
        dotClass: "bg-emerald-500",
    },
    PAUSADA: {
        label: "Pausada",
        className: styles.orange,
        dotClass: "bg-orange-500",
    },
    AGUARDANDO_AVALIACAO: {
        label: "Aguardando avaliação",
        className: styles.violet,
        dotClass: "bg-violet-500",
    },
    EM_RETRABALHO: {
        label: "Em retrabalho",
        className: styles.fuchsia,
        dotClass: "bg-fuchsia-500",
    },
    CONCLUIDA: {
        label: "Concluída",
        className: styles.slate,
        dotClass: "bg-slate-500",
    },
    CANCELADA: {
        label: "Cancelada",
        className: styles.red,
        dotClass: "bg-red-500",
    },
};

export function obterStatusProducao(status) {
    return (
        producaoStatusMap[status] || {
            label: formatarStatus(status),
            className: styles.slate,
            dotClass: "bg-slate-400",
        }
    );
}

export const ocorrenciaStatusMap = {
    ABERTA: {
        label: "Aberta",
        className: styles.red,
    },
    EM_ANALISE: {
        label: "Em análise",
        className: styles.blue,
    },
    EM_ATENDIMENTO: {
        label: "Em atendimento",
        className: styles.amber,
    },
    RESOLVIDA: {
        label: "Resolvida",
        className: styles.emerald,
    },
    CANCELADA: {
        label: "Cancelada",
        className: styles.slate,
    },
};

export const eventoStatusMap =
    ocorrenciaStatusMap;

export const eventoTipoMap = {
    FALHA_EQUIPAMENTO: {
        label: "Falha de equipamento",
        className: styles.red,
    },
    PARADA_LINHA: {
        label: "Parada de linha",
        className: styles.amber,
    },
    MANUTENCAO: {
        label: "Manutenção",
        className: styles.blue,
    },
    OUTRO: {
        label: "Outro",
        className: styles.slate,
    },
};

export const usuarioStatusMap = {
    ATIVO: {
        label: "Ativo",
        className: styles.emerald,
    },
    INATIVO: {
        label: "Inativo",
        className: styles.slate,
    },
};

export const perfilMap = {
    ADMIN: {
        label: "Administrador",
        className: styles.violet,
    },
    GESTOR: {
        label: "Gestor",
        className: styles.blue,
    },
    SUPERVISOR: {
        label: "Supervisor",
        className: styles.amber,
    },
    OPERADOR: {
        label: "Operador",
        className: styles.slate,
    },
};

export const perfilStatusMap =
    perfilMap;

export const turnoStatusMap = {
    ATIVO: {
        label: "Ativo",
        className: styles.emerald,
    },
    INATIVO: {
        label: "Inativo",
        className: styles.slate,
    },
};

export const layoutStatusMap = {
    ATIVO: {
        label: "Ativo",
        className: styles.emerald,
    },
    INATIVO: {
        label: "Inativo",
        className: styles.slate,
    },
};

export const layoutStrategyMap = {
    DELIMITADO: {
        label: "Delimitador",
        className: styles.blue,
    },
    OFFSET_FIXO: {
        label: "Offset fixo",
        className: styles.violet,
    },
};

export const strategyMap =
    layoutStrategyMap;

export const filaStatusMap = {
    PENDENTE: {
        label: "Pendente",
        className: styles.amber,
    },
    ENVIANDO: {
        label: "Enviando",
        className: styles.blue,
    },
    ENVIADO_FIFO: {
        label: "Enviado ao FIFO",
        className: styles.violet,
    },
    PRONTO_IMPRESSAO: {
        label: "Pronto para impressão",
        className: styles.indigo,
    },
    IMPRESSO: {
        label: "Impresso",
        className: styles.emerald,
    },
    ERRO: {
        label: "Erro",
        className: styles.red,
    },
    CANCELADO: {
        label: "Cancelado",
        className: styles.slate,
    },
};

export const producaoItemStatusMap = {
    AGUARDANDO: {
        label: "Aguardando",
        className:
            "bg-slate-100 text-slate-700 ring-slate-500/20",
    },

    EM_IMPRESSAO: {
        label: "Em impressão",
        className:
            "bg-blue-50 text-blue-700 ring-blue-600/20",
    },

    AGUARDANDO_VALIDACAO: {
        label: "Aguardando validação",
        className:
            "bg-amber-50 text-amber-700 ring-amber-600/20",
    },

    AGUARDANDO_RETRABALHO: {
        label: "Aguardando retrabalho",
        className:
            "bg-orange-50 text-orange-700 ring-orange-600/20",
    },

    EM_RETRABALHO: {
        label: "Em retrabalho",
        className:
            "bg-violet-50 text-violet-700 ring-violet-600/20",
    },

    CONCLUIDO: {
        label: "Concluído",
        className:
            "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    },

    ERRO: {
        label: "Erro",
        className:
            "bg-red-50 text-red-700 ring-red-600/20",
    },

    CANCELADO: {
        label: "Cancelado",
        className:
            "bg-slate-100 text-slate-600 ring-slate-500/20",
    },
};

export function formatarStatus(status) {
    if (!status) {
        return "Não informado";
    }

    return String(status)
        .toLowerCase()
        .split("_")
        .map(
            (palavra) =>
                palavra.charAt(0).toUpperCase() +
                palavra.slice(1)
        )
        .join(" ");
}