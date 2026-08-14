import { api } from "./api";

export const relatorioService = {
    async gerarRelatorioImpressoes(params) {
        const response = await api.get(
            "/relatorios/impressoes",
            { params }
        );

        return response.data;
    },

    async gerarRelatorioOcorrencias(params) {
        const response = await api.get(
            "/relatorios/ocorrencias",
            { params }
        );

        return response.data;
    },

    async gerarRelatorioEquipamentos() {
        const response = await api.get(
            "/relatorios/equipamentos"
        );

        return response.data;
    },

    async exportarPdfImpressoes(params) {
        const response = await api.get(
            "/relatorios/impressoes/pdf",
            {
                params,
                responseType: "blob",
            }
        );

        return response.data;
    },

    async exportarPdfOcorrencias(params) {
        const response = await api.get(
            "/relatorios/ocorrencias/pdf",
            {
                params,
                responseType: "blob",
            }
        );

        return response.data;
    },

    async exportarPdfEquipamentos() {
        const response = await api.get(
            "/relatorios/equipamentos/pdf",
            {
                responseType: "blob",
            }
        );

        return response.data;
    },
};