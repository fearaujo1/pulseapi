import { api } from "./api";

export const plantaService = {
    async listar() {
        const response =
            await api.get("/plantas");

        return response.data;
    },

    async buscarPorId(id) {
        const response =
            await api.get(`/plantas/${id}`);

        return response.data;
    },

    async cadastrar(payload) {
        const response =
            await api.post("/plantas", payload);

        return response.data;
    },

    async atualizar(id, payload) {
        const response =
            await api.put(
                `/plantas/${id}`,
                payload
            );

        return response.data;
    },

    async deletar(id) {
        await api.delete(`/plantas/${id}`);
    },
};