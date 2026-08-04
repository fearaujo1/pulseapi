import { api } from "./api";

export const ocorrenciaService = {
    async listar() {
        const response = await api.get("/ocorrencias");
        return response.data;
    },

    async buscarPorId(id) {
        const response = await api.get(`/ocorrencias/${id}`);
        return response.data;
    },

    async listarPorEquipamento(equipamentoId) {
        const response = await api.get(`/ocorrencias/equipamento/${equipamentoId}`);
        return response.data;
    },

    async criar(payload) {
        const response = await api.post("/ocorrencias", payload);
        return response.data;
    },

    async atualizar(id, payload) {
        const response = await api.put(`/ocorrencias/${id}`, payload);
        return response.data;
    },

    async atualizarStatus(id, status) {
        const response = await api.patch(`/ocorrencias/${id}/status`, { status });
        return response.data;
    },

    async deletar(id) {
        await api.delete(`/ocorrencias/${id}`);
    },
};