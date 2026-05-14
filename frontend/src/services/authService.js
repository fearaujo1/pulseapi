import { api } from './api';

export const authService = {
    async login(payload) {
        const response = await api.post('/auth/login', payload);
        return response.data;
    },

    async primeiroAcesso(payload) {
        const response = await api.patch('/auth/primeiro-acesso', payload);
        return response.data;
    }
}