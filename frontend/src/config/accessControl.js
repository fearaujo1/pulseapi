export const PERFIS = Object.freeze({
    ADMIN: "ADMIN",
    GESTOR: "GESTOR",
    SUPERVISOR: "SUPERVISOR",
    OPERADOR: "OPERADOR",
});

const TODOS = Object.freeze([
    PERFIS.ADMIN,
    PERFIS.GESTOR,
    PERFIS.SUPERVISOR,
    PERFIS.OPERADOR,
]);

const GESTAO = Object.freeze([
    PERFIS.ADMIN,
    PERFIS.GESTOR,
    PERFIS.SUPERVISOR,
]);

const ADMIN_E_GESTOR = Object.freeze([
    PERFIS.ADMIN,
    PERFIS.GESTOR,
]);

const SOMENTE_ADMIN = Object.freeze([
    PERFIS.ADMIN,
]);

/*
 * Permissões para acessar páginas.
 */
export const ACESSOS = Object.freeze({
    DASHBOARD: TODOS,

    EQUIPAMENTOS: TODOS,
    INTEGRACAO_EQUIPAMENTO: GESTAO,

    PRODUCOES: TODOS,

    LINHAS: TODOS,
    PRODUTOS: TODOS,

    NOVA_IMPRESSAO: TODOS,
    REGISTRAR_PARADA: TODOS,

    EVENTOS: GESTAO,
    FILA_IMPRESSAO: GESTAO,
    LAYOUTS_IMPRESSAO: GESTAO,
    RELATORIOS: ADMIN_E_GESTOR,
    HISTORICO: GESTAO,

    USUARIOS: SOMENTE_ADMIN,
    CONFIGURACOES: SOMENTE_ADMIN,
});

/*
 * Permissões para ações dentro das páginas.
 */
export const ACOES = Object.freeze({
    /*
     * Equipamentos
     */
    EQUIPAMENTO_CRIAR: GESTAO,
    EQUIPAMENTO_EDITAR: GESTAO,
    EQUIPAMENTO_INTEGRAR: GESTAO,
    EQUIPAMENTO_EXCLUIR: ADMIN_E_GESTOR,

    /*
     * Produções
     */
    PRODUCAO_CRIAR: GESTAO,
    PRODUCAO_EDITAR: GESTAO,
    PRODUCAO_IMPORTAR_ITENS: GESTAO,
    PRODUCAO_FINALIZAR_CARGA: GESTAO,
    PRODUCAO_CANCELAR: GESTAO,
    PRODUCAO_EXCLUIR: ADMIN_E_GESTOR,

    /*
     * Ações operacionais da produção.
     *
     * O OPERADOR pode executar essas ações porque elas
     * representam o trabalho diário realizado na linha.
     */
    PRODUCAO_INICIAR: TODOS,
    PRODUCAO_PAUSAR: TODOS,
    PRODUCAO_RETOMAR: TODOS,
    PRODUCAO_FINALIZAR_AVALIACAO: TODOS,
    PRODUCAO_MARCAR_RETRABALHO: TODOS,

    /*
     * Plantas e linhas
     */
    ESTRUTURA_CRIAR: GESTAO,
    ESTRUTURA_EDITAR: ADMIN_E_GESTOR,
    ESTRUTURA_EXCLUIR: ADMIN_E_GESTOR,
    LINHA_GERENCIAR_RESPONSAVEIS: ADMIN_E_GESTOR,

    /*
     * Eventos e ocorrências
     */
    EVENTO_CRIAR: GESTAO,
    EVENTO_REGISTRAR: TODOS,
    EVENTO_EDITAR: GESTAO,
    EVENTO_ALTERAR_STATUS: GESTAO,
    EVENTO_EXCLUIR: GESTAO,

    /*
     * Administração
     */
    USUARIO_GERENCIAR: SOMENTE_ADMIN,
    CONFIGURACAO_GERENCIAR: SOMENTE_ADMIN,
});

/*
 * Retorna true quando o perfil estiver presente
 * na lista de perfis autorizados.
 */
export function possuiAcesso(
    perfil,
    perfisPermitidos = []
) {
    if (!perfil) {
        return false;
    }

    if (!Array.isArray(perfisPermitidos)) {
        return false;
    }

    return perfisPermitidos.includes(perfil);
}

/*
 * Alias semantico para verificacoes de acoes.
 *
 * Exemplo:
 *
 * podeExecutar(
 *     usuario?.perfil,
 *     ACOES.EQUIPAMENTO_EDITAR
 * );
 */
export function podeExecutar(
    perfil,
    perfisPermitidos = []
) {
    return possuiAcesso(
        perfil,
        perfisPermitidos
    );
}