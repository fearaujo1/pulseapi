import { api } from "./api";

export const producaoService = {
    async listar() {
        const response =
            await api.get("/producoes");

        return response.data;
    },

    async buscarPorId(id) {
        const response =
            await api.get(`/producoes/${id}`);

        return response.data;
    },

    async cadastrar(payload) {
        const response =
            await api.post(
                "/producoes",
                payload
            );

        return response.data;
    },

    async atualizar(id, payload) {
        const response =
            await api.put(
                `/producoes/${id}`,
                payload
            );

        return response.data;
    },

    async deletar(id) {
        await api.delete(`/producoes/${id}`);
    },

    async importarItens(id, payload) {
        const response =
            await api.post(
                `/producoes/${id}/itens/lote`,
                payload
            );

        return response.data;
    },

    async listarItens(id) {
        const response =
            await api.get(
                `/producoes/${id}/itens`
            );

        return response.data;
    },

    async finalizarCarga(id) {
        const response =
            await api.patch(
                `/producoes/${id}/finalizar-carga`
            );

        return response.data;
    },

    async iniciar(id) {
        const response =
            await api.patch(
                `/producoes/${id}/iniciar`
            );

        return response.data;
    },

    async pausar(id) {
        const response =
            await api.patch(
                `/producoes/${id}/pausar`
            );

        return response.data;
    },

    async retomar(id) {
        const response =
            await api.patch(
                `/producoes/${id}/retomar`
            );

        return response.data;
    },

    async finalizarAvaliacao(id) {
        const response =
            await api.patch(
                `/producoes/${id}/finalizar-avaliacao`
            );

        return response.data;
    },

    async marcarRetrabalho(
        producaoId,
        itemId
    ) {
        const response =
            await api.patch(
                `/producoes/${producaoId}/itens/${itemId}/marcar-retrabalho`
            );

        return response.data;
    },

    async desmarcarRetrabalho(
        producaoId,
        itemId
    ) {
        const response =
            await api.patch(
                `/producoes/${producaoId}/itens/${itemId}/desmarcar-retrabalho`
            );

        return response.data;
    },

    async cancelar(id, motivo) {
        const response =
            await api.patch(
                `/producoes/${id}/cancelar`,
                { motivo }
            );

        return response.data;
    },
};