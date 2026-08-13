import { api } from "./api";

export const dominoService = {
    async consultarStatus(equipamentoId) {
        const response = await api.get(
            `/equipamentos/${equipamentoId}/domino/status`
        );
        return response.data;
    },

    async consultarIdentidade(equipamentoId) {
        const response = await api.get(
            `/equipamentos/${equipamentoId}/domino/identidade`
        );
        return response.data;
    },

    async consultarConfiguracao(equipamentoId) {
        const response = await api.get(
            `/equipamentos/${equipamentoId}/domino/configuracao`
        );
        return response.data;
    },

    async consultarQuantidadeFifo(equipamentoId) {
        const response = await api.get(
            `/equipamentos/${equipamentoId}/domino/fifo/quantidade`
        );
        return response.data;
    },

    async consultarLayoutOnline(equipamentoId) {
        const response = await api.get(
            `/equipamentos/${equipamentoId}/domino/layout-online`
        );
        return response.data;
    },

    async consultarContadorProdutos(equipamentoId) {
        const response = await api.get(
            `/equipamentos/${equipamentoId}/domino/contador-produtos`
        );
        return response.data;
    },

    async listarHistorico(equipamentoId) {
        const response = await api.get(
            `/equipamentos/${equipamentoId}/domino/historico`
        );
        return response.data;
    },

    async selecionarLayout(equipamentoId, nomeLayout) {
        await api.post(
            `/equipamentos/${equipamentoId}/domino/layout-online`,
            null,
            {
                params: {
                    nome: nomeLayout,
                },
            }
        );
    },
};