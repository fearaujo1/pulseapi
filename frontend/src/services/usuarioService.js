import { api } from "./api.js";

export const usuarioService = {
    async listar() {
        const response = await api.get("/usuarios");
        return response.data;
    },

    async buscarPorId(id) {
     const response = await api.get(`/usuarios/${id}`);
     return response.data;
    },

    async criar(payload) {
        const response = await api.post("/usuarios", payload);
        return response.data;
    },

    async atualizar(id, payload) {
        const response = await api.put(`/usuarios/${id}`, payload);
        return response.data;
    },

    async atualizarStatus(id, status) {
        const response = await api.patch(`/usuarios/${id}/status`, {status});
        return response.data;
    },

    async deletar(id) {
        await api.delete(`/usuarios/${id}`);
    },
};
