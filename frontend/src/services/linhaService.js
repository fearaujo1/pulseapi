import { api } from "./api";

export const linhaService = {
    async listarPorPlanta(plantaId) {
        const response =
            await api.get("/linhas", {
                params: { plantaId },
            });

        return response.data;
    },

    async buscarPorId(id) {
        const response =
            await api.get(`/linhas/${id}`);

        return response.data;
    },

    async cadastrar(payload) {
        const response =
            await api.post("/linhas", payload);

        return response.data;
    },

    async atualizar(id, payload) {
        const response =
            await api.put(
                `/linhas/${id}`,
                payload
            );

        return response.data;
    },

    async deletar(id) {
        await api.delete(`/linhas/${id}`);
    },
};