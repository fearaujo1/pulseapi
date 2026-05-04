import { Navigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext.jsx";

function ProtectedRoute({children}) {
    const { isAuthenticated, loadingAuth, usuario } = useAuth();

    if (loadingAuth) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (usuario?.primeiroAcesso) {
        return <Navigate to="/primeiro-acesso" replace />;
    }

    return children;
}

export default ProtectedRoute;