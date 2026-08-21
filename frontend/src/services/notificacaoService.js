import { api } from './api';

export const notificacaoService = {
    async listar() {
        const response = await api.get("/notificacoes");
        return response.data
    },

    async listarNaoLidas() {
        const response = await api.get("/notificacoes/nao-lidas");
        return response.data
    },

    async contarNaoLidas() {
        const response = await api.get("/notificacoes/nao-lidas/quantidade");
        return response.data;
    },

    async marcarComoLida() {
        const response = await api.patch(`/notificacoes/${id}/lida`);
        return response.data;
    },
};