import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function AdminRoute({ children }) {
    const { usuario, isAuthenticated, loadingAuth } = useAuth();

    if (loadingAuth) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (usuario?.perfil !== "ADMIN") {
        return <Navigate to="/equipamentos" replace />;
    }

    return children;
}

export default AdminRoute;