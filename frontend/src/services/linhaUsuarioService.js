import { api } from "./api.js";

export const linhaUsuarioService = {
    async listarPorLinha(linhaId) {
        const response = await api.get(
            `/linhas/${linhaId}/responsaveis`
        );

        return response.data;
    },

    async listarPorUsuario(usuarioId) {
        const response = await api.get(
            `/linhas/usuarios/${usuarioId}`
        );

        return response.data;
    },

    async vincular(
        linhaId,
        usuarioId,
        papelNaLinha
    ) {
        const response = await api.post(
            `/linhas/${linhaId}/responsaveis`,
            {
                usuarioId,
                papelNaLinha,
            }
        );

        return response.data;
    },

    async remover(
        linhaId,
        vinculoId
    ) {
        await api.delete(
            `/linhas/${linhaId}/responsaveis/${vinculoId}`
        );
    },
};