import {
    Navigate,
    useLocation,
} from "react-router-dom";

import { useAuth } from "../contexts/AuthContext.jsx";

function RoleRoute({
                       children,
                       allowedProfiles = [],
                   }) {
    const location = useLocation();

    const {
        usuario,
        isAuthenticated,
        loadingAuth,
    } = useAuth();

    if (loadingAuth) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    const perfil =
        usuario?.perfil?.toUpperCase();

    const perfisPermitidos =
        allowedProfiles.map(
            (item) => item.toUpperCase()
        );

    if (
        !perfil ||
        !perfisPermitidos.includes(perfil)
    ) {
        return (
            <Navigate
                to="/acesso-negado"
                replace
                state={{
                    origem: location.pathname,
                }}
            />
        );
    }

    return children;
}

export default RoleRoute;