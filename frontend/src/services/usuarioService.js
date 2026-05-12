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
};