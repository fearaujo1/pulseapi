import { api } from "./api";

export const layoutImpressaoService = {
    async listar() {
        const response = await api.get("/layouts-impressao");
        return response.data;
    },

    async buscarPorId(id) {
        const response = await api.get(`/layouts-impressao/${id}`);
        return response.data;
    },

    async listarPorEquipamento(equipamentoId) {
        const response = await api.get(
            `/layouts-impressao/equipamento/${equipamentoId}`
        );
        return response.data;
    },

    async criar(payload) {
        const response = await api.post(
            "/layouts-impressao",
            payload
        );
        return response.data;
    },

    async atualizar(id, payload) {
        const response = await api.put(
            `/layouts-impressao/${id}`,
            payload
        );
        return response.data;
    },

    async excluir(id) {
        await api.delete(
            `/layouts-impressao/${id}`
        );
    },

    async montarPayload(payload) {
        const response = await api.post(
            "/layouts-impressao/montar-payload",
            payload
        );
        return response.data;
    },
};