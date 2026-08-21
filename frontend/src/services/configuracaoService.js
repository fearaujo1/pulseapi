import { api } from "./api";

export const configuracaoService = {

    // =====================================================
    // EMPRESA
    // =====================================================

    async buscarEmpresa() {
        const response = await api.get(
            "/configuracoes/empresa"
        );

        return response.data;
    },

    async atualizarEmpresa(id, payload) {
        const response = await api.put(
            `/configuracoes/empresa/${id}`,
            payload
        );

        return response.data;
    },


    // =====================================================
    // CONFIGURAÇÃO GERAL
    // =====================================================

    async buscarConfiguracaoGeral() {
        const response = await api.get(
            "/configuracoes/geral"
        );

        return response.data;
    },

    async atualizarConfiguracaoGeral(payload) {
        const response = await api.put(
            "/configuracoes/geral",
            payload
        );

        return response.data;
    },


    // =====================================================
    // TURNOS
    // =====================================================

    async listarTurnos() {
        const response = await api.get(
            "/configuracoes/turnos"
        );

        return response.data;
    },

    async criarTurno(payload) {
        const response = await api.post(
            "/configuracoes/turnos",
            payload
        );

        return response.data;
    },

    async atualizarTurno(id, payload) {
        const response = await api.put(
            `/configuracoes/turnos/${id}`,
            payload
        );

        return response.data;
    },

    async excluirTurno(id) {
        await api.delete(
            `/configuracoes/turnos/${id}`
        );
    },
};