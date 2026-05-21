import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function RoleRoute({ children, allowedProfiles = [] }) {
    const { usuario, isAuthenticated, loadingAuth } = useAuth();

    if (loadingAuth) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedProfiles.includes(usuario?.perfil)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default RoleRoute;