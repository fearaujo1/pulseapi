import { api } from "./api";

export const equipamentosService = {
    async listar() {
        const response = await api.get("/equipamentos");
        return response.data;
    },

    async buscarPorId(id) {
        const response = await api.get(`/equipamentos/${id}`);
        return response.data;
    },

    async criar(payload) {
        const response = await api.post(`/equipamentos`, payload);
        return response.data;
    },

    async atualizar(id, payload) {
        const response = await api.put(`/equipamentos/${id}`, payload);
        return response.data;
    },

    async deletar(id) {
        await api.delete(`/equipamentos/${id}`);
    },

    async atualizarStatus(id, status) {
        const response = await api.patch(`/equipamentos/${id}/status`, { status });
        return response.data;
    },

};