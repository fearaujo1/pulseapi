import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext.jsx";

import ProtectedRoute from "./routes/ProtectedRoute";
import SetupRoute from "./routes/SetupRoute";
import InitialRoute from "./routes/InitialRoute";
import RoleRoute from "./routes/RoleRoute";

import AppLayout from "./components/layout/AppLayout.jsx";

import EquipamentosPage from "./pages/EquipamentosPage";
import LoginPage from "./pages/LoginPage";
import PrimeiroAcessoPage from "./pages/PrimeiroAcessoPage";
import UsuariosPage from "./pages/UsuariosPage.jsx";
import SetupPage from "./pages/SetupPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import EventosPage from "./pages/EventosPage.jsx";
import RegistrarOcorrenciaPage from "./pages/RegistrarOcorrenciaPage.jsx";
import EmDesenvolvimentoPage from "./pages/EmDesenvolvimentoPage.jsx";
import EquipamentoIntegracaoPage from "./pages/EquipamentoIntegracaoPage.jsx";
import FilaImpressaoPage from "./pages/FilaImpressaoPage";
import LayoutsImpressaoPage from "./pages/LayoutsImpressaoPage.jsx";
import NovaImpressaoPage from "./pages/NovaImpressaoPage.jsx";
import RelatoriosPage from "./pages/RelatoriosPage.jsx";
import ConfiguracoesPage from "./pages/ConfiguracoesPage.jsx";
import PlantasLinhasPage from "./pages/PlantasLinhasPage.jsx";


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

                    {/* ==================================== */}
                    {/* ROTAS PÚBLICAS / CONFIGURAÇÃO       */}
                    {/* ==================================== */}

                    <Route
                        path="/"
                        element={<InitialRoute />}
                    />

                    <Route
                        path="/setup"
                        element={
                            <SetupRoute>
                                <SetupPage />
                            </SetupRoute>
                        }
                    />

                    <Route
                        path="/login"
                        element={<LoginPage />}
                    />

                    <Route
                        path="/primeiro-acesso"
                        element={<PrimeiroAcessoPage />}
                    />


                    {/* ==================================== */}
                    {/* ÁREA INTERNA DO SISTEMA              */}
                    {/*                                     */}
                    {/* AppLayout reserva 270px à esquerda  */}
                    {/* para a Sidebar no desktop.           */}
                    {/*                                     */}
                    {/* Cada página continua possuindo      */}
                    {/* sua própria Topbar.                  */}
                    {/* ==================================== */}

                    <Route
                        element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }
                    >

                        {/* ================================ */}
                        {/* ROTAS GERAIS                     */}
                        {/* ================================ */}

                        <Route
                            path="/dashboard"
                            element={<DashboardPage />}
                        />

                        <Route
                            path="/equipamentos"
                            element={<EquipamentosPage />}
                        />

                        <Route
                            path="/equipamentos/:id/integracao"
                            element={<EquipamentoIntegracaoPage />}
                        />

                        <Route
                            path="/producoes"
                            element={<EmDesenvolvimentoPage />}
                        />

                        <Route
                            path="/linhas"
                            element={<PlantasLinhasPage />}
                        />
                        <Route
                            path="/produtos"
                            element={<EmDesenvolvimentoPage />}
                        />

                        {/*
                            OPERADOR pode criar impressão.

                            O POST /fila-impressao permite:
                            ADMIN / GESTOR / SUPERVISOR / OPERADOR
                        */}
                        <Route
                            path="/fila-impressao/nova"
                            element={<NovaImpressaoPage />}
                        />

                        <Route
                            path="/registrar-parada"
                            element={<RegistrarOcorrenciaPage />}
                        />


                        {/* ================================ */}
                        {/* ADMIN / GESTOR / SUPERVISOR      */}
                        {/* ================================ */}

                        <Route
                            path="/eventos"
                            element={
                                <RoleRoute
                                    allowedProfiles={[
                                        "ADMIN",
                                        "GESTOR",
                                        "SUPERVISOR",
                                    ]}
                                >
                                    <EventosPage />
                                </RoleRoute>
                            }
                        />

                        {/*
                            Por enquanto a tela usa
                            GET /fila-impressao,
                            que é uma listagem GLOBAL.

                            OPERADOR será incluído depois,
                            quando filtrarmos pela linha dele.
                        */}
                        <Route
                            path="/fila-impressao"
                            element={
                                <RoleRoute
                                    allowedProfiles={[
                                        "ADMIN",
                                        "GESTOR",
                                        "SUPERVISOR",
                                    ]}
                                >
                                    <FilaImpressaoPage />
                                </RoleRoute>
                            }
                        />

                        <Route
                            path="/layouts-impressao"
                            element={
                                <RoleRoute
                                    allowedProfiles={[
                                        "ADMIN",
                                        "GESTOR",
                                        "SUPERVISOR",
                                    ]}
                                >
                                    <LayoutsImpressaoPage />
                                </RoleRoute>
                            }
                        />

                        <Route
                            path="/relatorios"
                            element={
                                <RoleRoute
                                    allowedProfiles={[
                                        "ADMIN",
                                        "GESTOR",
                                        "SUPERVISOR",
                                    ]}
                                >
                                    <RelatoriosPage />
                                </RoleRoute>
                            }
                        />

                        <Route
                            path="/historico"
                            element={
                                <RoleRoute
                                    allowedProfiles={[
                                        "ADMIN",
                                        "GESTOR",
                                        "SUPERVISOR",
                                    ]}
                                >
                                    <EmDesenvolvimentoPage />
                                </RoleRoute>
                            }
                        />


                        {/* ================================ */}
                        {/* ADMIN                            */}
                        {/* ================================ */}

                        <Route
                            path="/usuarios"
                            element={
                                <RoleRoute
                                    allowedProfiles={["ADMIN"]}
                                >
                                    <UsuariosPage />
                                </RoleRoute>
                            }
                        />

                        <Route
                            path="/configuracoes"
                            element={
                                <RoleRoute
                                    allowedProfiles={["ADMIN"]}
                                >
                                    <ConfiguracoesPage />
                                </RoleRoute>
                            }
                        />

                    </Route>


                    {/* ==================================== */}
                    {/* FALLBACK                             */}
                    {/* ==================================== */}

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        }
                    />

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;