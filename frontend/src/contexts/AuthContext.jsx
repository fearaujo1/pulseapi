import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { authService } from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({
                                 children,
                             }) {
    const [token, setToken] =
        useState(() =>
            localStorage.getItem("token")
        );

    const [usuario, setUsuario] =
        useState(null);

    const [loadingAuth, setLoadingAuth] =
        useState(true);

    const limparAutenticacao =
        useCallback(() => {
            localStorage.removeItem("token");

            /*
             * Remove também o formato antigo,
             * que armazenava o perfil no navegador.
             */
            localStorage.removeItem("usuario");

            setToken(null);
            setUsuario(null);
        }, []);

    const recarregarUsuario =
        useCallback(async () => {
            const tokenAtual =
                localStorage.getItem("token");

            if (!tokenAtual) {
                setToken(null);
                setUsuario(null);
                return null;
            }

            const usuarioAutenticado =
                await authService
                    .buscarUsuarioAutenticado();

            setToken(tokenAtual);
            setUsuario(usuarioAutenticado);

            return usuarioAutenticado;
        }, []);

    useEffect(() => {
        let ativo = true;

        async function validarSessao() {
            const tokenAtual =
                localStorage.getItem("token");

            /*
             * O objeto de usuário antigo não deve
             * mais ser utilizado como fonte de permissão.
             */
            localStorage.removeItem("usuario");

            if (!tokenAtual) {
                if (ativo) {
                    setToken(null);
                    setUsuario(null);
                    setLoadingAuth(false);
                }

                return;
            }

            try {
                const usuarioAutenticado =
                    await authService
                        .buscarUsuarioAutenticado();

                if (!ativo) {
                    return;
                }

                setToken(tokenAtual);
                setUsuario(usuarioAutenticado);
            } catch (error) {
                console.error(
                    "Não foi possível validar a sessão:",
                    error
                );

                if (!ativo) {
                    return;
                }

                limparAutenticacao();
            } finally {
                if (ativo) {
                    setLoadingAuth(false);
                }
            }
        }

        validarSessao();

        return () => {
            ativo = false;
        };
    }, [limparAutenticacao]);

    async function login(payload) {
        const data =
            await authService.login(payload);

        const usuarioLogado = {
            id: data.id,
            nome: data.nome,
            email: data.email,
            perfil: data.perfil,
        };

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.removeItem("usuario");

        setToken(data.token);
        setUsuario(usuarioLogado);
        setLoadingAuth(false);

        return {
            ...data,
            usuario: usuarioLogado,
        };
    }

    function logout() {
        limparAutenticacao();
    }

    const isAuthenticated =
        Boolean(token && usuario);

    const value =
        useMemo(() => ({
            usuario,
            token,
            loadingAuth,
            isAuthenticated,
            login,
            logout,
            recarregarUsuario,
        }), [
            usuario,
            token,
            loadingAuth,
            isAuthenticated,
            recarregarUsuario,
        ]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth deve ser utilizado dentro de AuthProvider."
        );
    }

    return context;
}