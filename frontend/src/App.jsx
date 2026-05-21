import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext.jsx";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import SetupRoute from "./routes/SetupRoute";
import InitialRoute from "./routes/InitialRoute";
import RoleRoute from "./routes/RoleRoute";

import EquipamentosPage from "./pages/EquipamentosPage";
import LoginPage from "./pages/LoginPage";
import PrimeiroAcessoPage from "./pages/PrimeiroAcessoPage";
import UsuariosPage from "./pages/UsuariosPage.jsx";
import SetupPage from "./pages/SetupPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import EventosPage from "./pages/EventosPage.jsx";
import RegistrarParadaPage from "./pages/RegistrarParadaPage.jsx";


function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            borderRadius: "12px",
                            padding: "14px 16px",
                            fontSize: "14px",
                        },
                    }}
                />

                <Routes>
                    <Route path="/" element={<InitialRoute />} />

                    <Route
                        path="/setup"
                        element={
                            <SetupRoute>
                                <SetupPage />
                            </SetupRoute>
                        }
                    />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/primeiro-acesso" element={<PrimeiroAcessoPage />} />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/equipamentos"
                        element={
                            <ProtectedRoute>
                                <EquipamentosPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/ops"
                        element={
                            <ProtectedRoute>
                                <EquipamentosPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/linhas"
                        element={
                            <ProtectedRoute>
                                <EquipamentosPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/produtos"
                        element={
                            <ProtectedRoute>
                                <EquipamentosPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/eventos"
                        element={
                            <RoleRoute allowedProfiles={["ADMIN", "GESTOR", "SUPERVISOR"]}>
                                <EventosPage />
                            </RoleRoute>
                        }
                    />

                    <Route
                        path="/historico"
                        element={
                            <ProtectedRoute>
                                <EquipamentosPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/configuracoes"
                        element={
                            <ProtectedRoute>
                                <EquipamentosPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/usuarios"
                        element={
                            <RoleRoute allowedProfiles={["ADMIN"]}>
                                <UsuariosPage />
                            </RoleRoute>
                        }
                    />

                    <Route
                        path="/registrar-parada"
                        element={
                            <ProtectedRoute>
                                <RegistrarParadaPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;