import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

function PublicRoute({
                         children,
                     }) {
    const {
        usuario,
        isAuthenticated,
        loadingAuth,
    } = useAuth();

    if (loadingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            </div>
        );
    }

    if (isAuthenticated) {
        if (usuario?.primeiroAcesso) {
            return (
                <Navigate
                    to="/primeiro-acesso"
                    replace
                />
            );
        }

        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    return children;
}

export default PublicRoute;