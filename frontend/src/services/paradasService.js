import { api } from "./api";

export const paradasService = {
    async listar() {
        const response = await api.get("/paradas");
        return response.data;
    },

    async buscarPorId(id) {
        const response = await api.get(`/paradas/${id}`);
        return response.data;
    },

    async listarPorEquipamento(equipamentoId) {
        const response = await api.get(`/paradas/equipamento/${equipamentoId}`);
        return response.data;
    },

    async criar(payload) {
        const response = await api.post("/paradas", payload);
        return response.data;
    },

    async atualizar(id, payload) {
        const response = await api.put(`/paradas/${id}`, payload);
        return response.data;
    },

    async deletar(id) {
        await api.delete(`/paradas/${id}`);
    },
};