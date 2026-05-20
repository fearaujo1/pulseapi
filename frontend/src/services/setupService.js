import { api } from "./api";

export const setupService = {
    async verificarStatus() {
        const response = await api.get("/setup/status");
        return response.data;
    },

    async criarSetupInicial(payload) {
        const response = await api.post("/setup/inicial", payload);
        return response.data;
    },
};