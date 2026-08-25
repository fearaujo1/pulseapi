import {
    createContext,
    useContext,
    useState,
} from "react";
import { authService } from "../services/authService.js"

const AuthContext = createContext(null);

export function AuthProvider({children}) {


    const [token, setToken] = useState(() =>
        localStorage.getItem("token")
    );

    const [usuario, setUsuario] = useState(() => {
        const storedUsuario = localStorage.getItem("usuario");

        if (!storedUsuario) return null;

        try {
            return JSON.parse(storedUsuario);
        } catch {
            localStorage.removeItem("usuario");
            return null;
        }
    });

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
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth deve ser utilizado dentro de AuthProvider."
        );
    }

    return context;
}