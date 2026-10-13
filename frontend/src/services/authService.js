import { api } from "./api";

export const authService = {
    async login(payload) {
        const response =
            await api.post(
                "/auth/login",
                payload
            );

        return response.data;
    },

    async buscarUsuarioAutenticado() {
        const response =
            await api.get(
                "/auth/me"
            );

        return response.data;
    },
};