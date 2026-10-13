import { api } from "./api";

export const dashboardService = {
    async buscarResumo() {
        const response = await api.get(
            "/dashboard/resumo"
        );

        return response.data;
    },
};