import { api } from "./api";

export const filaImpressaoService = {
    async listar() {
        const response = await api.get("/fila-impressao");
        return response.data;
    },

    async buscarPorId(id) {
        const response = await api.get(`/fila-impressao/${id}`);
        return response.data;
    },

    async listarPorEquipamento(equipamentoId) {
        const response = await api.get(
            `/fila-impressao/equipamento/${equipamentoId}`
        );
        return response.data;
    },

    async listarPendentes(equipamentoId) {
        const response = await api.get(
            `/fila-impressao/equipamento/${equipamentoId}/pendentes`
        );
        return response.data;
    },

    async adicionar(payload) {
        const response = await api.post(
            "/fila-impressao",
            payload
        );
        return response.data;
    },

    async cancelar(id) {
        const response = await api.patch(
            `/fila-impressao/${id}/cancelar`
        );
        return response.data;
    },

    async processarProximo(equipamentoId) {
        const response = await api.post(
            `/fila-impressao/equipamento/${equipamentoId}/processar-proximo`
        );
        return response.data;
    },

    async verificarConsumo(equipamentoId) {
        const response = await api.post(
            `/fila-impressao/equipamento/${equipamentoId}/verificar-consumo`
        );
        return response.data;
    },

    async sincronizar(equipamentoId) {
        const response = await api.post(
            `/fila-impressao/equipamento/${equipamentoId}/sincronizar`
        );
        return response.data;
    },
};