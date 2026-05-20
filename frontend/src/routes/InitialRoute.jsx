import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { setupService } from "../services/setupService";

function InitialRoute() {
    const [loading, setLoading] = useState(true);
    const [configurado, setConfigurado] = useState(null);

    useEffect(() => {
        async function verificarSetup() {
            try {
                const data = await setupService.verificarStatus();
                setConfigurado(data.configurado);
            } catch (error) {
                console.error("Erro ao verificar setup:", error);
                setConfigurado(true);
            } finally {
                setLoading(false);
            }
        }

        verificarSetup();
    }, []);


    if (loading) return null;

    return configurado ? (
        <Navigate to="/login" replace />
    ) : (
        <Navigate to="/setup" replace />
    );
}

export default InitialRoute;