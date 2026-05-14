import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService.js"

const AuthContext = createContext(null);

export function AuthProvider({children}) {
    const [usuario, setUsuario] = useState(null);
    const [token, setToken] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUsuario = localStorage.getItem("usuario");

        if (storedToken && storedUsuario) {
            setToken(storedToken);
            setUsuario(JSON.parse(storedUsuario));
        }

        setLoadingAuth(false);
    }, []);

    async function login(payload) {
        const data = await authService.login(payload);

        const usuarioLogado = {
            id: data.id,
            nome: data.nome,
            email: data.email,
            perfil: data.perfil,
            primeiroAcesso: data.primeiroAcesso,
        };

        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(usuarioLogado));

        setToken(data.token);
        setUsuario(usuarioLogado);

        return {
            ...data,
            usuario: usuarioLogado,
        };
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        setToken(null);
        setUsuario(null);
    }

    const isAuthenticated = Boolean(token);

    return (
        <AuthContext.Provider
            value={{
                usuario,
                token,
                loadingAuth,
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}