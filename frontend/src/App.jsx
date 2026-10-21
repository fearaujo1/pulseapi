import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import {
    AuthProvider,
} from "./contexts/AuthContext.jsx";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import SetupRoute from "./routes/SetupRoute";
import InitialRoute from "./routes/InitialRoute";
import RoleRoute from "./routes/RoleRoute";

import AppLayout from "./components/layout/AppLayout.jsx";
import { ACESSOS } from "./config/accessControl.js";
import AcessoNegadoPage from "./pages/AcessoNegadoPage.jsx";
import ConfiguracoesPage from "./pages/ConfiguracoesPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import EmDesenvolvimentoPage from "./pages/EmDesenvolvimentoPage.jsx";
import EquipamentosPage from "./pages/EquipamentosPage";
import EventosPage from "./pages/EventosPage.jsx";
import LayoutsImpressaoPage from "./pages/LayoutsImpressaoPage.jsx";
import LoginPage from "./pages/LoginPage";
import PlantasLinhasPage from "./pages/PlantasLinhasPage.jsx";
import ProducoesPage from "./pages/ProducoesPage.jsx";
import RegistrarOcorrenciaPage from "./pages/RegistrarOcorrenciaPage.jsx";
import RelatoriosPage from "./pages/RelatoriosPage.jsx";
import SetupPage from "./pages/SetupPage.jsx";
import UsuariosPage from "./pages/UsuariosPage.jsx";

function protegerPorPerfil(
    componente,
    perfis
) {
    return (
        <RoleRoute
            allowedProfiles={perfis}
        >
            {componente}
        </RoleRoute>
    );
}

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
                    {/* ================================== */}
                    {/* ROTAS PÚBLICAS                    */}
                    {/* ================================== */}

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

                    {import.meta.env.DEV && (
                        <Route
                            path="/preview/setup"
                            element={
                                <SetupPage previewMode />
                            }
                        />
                    )}

                    {import.meta.env.DEV && (
                        <Route
                            path="/preview/acesso-negado"
                            element={
                                <AcessoNegadoPage previewMode />
                            }
                        />
                    )}

                    {import.meta.env.DEV && (
                        <Route
                            path="/preview/em-desenvolvimento"
                            element={
                                <EmDesenvolvimentoPage previewMode />
                            }
                        />
                    )}

                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        }
                    />

                    {/* ================================== */}
                    {/* ÁREA AUTENTICADA                   */}
                    {/* ================================== */}

                    <Route
                        element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route
                            path="/acesso-negado"
                            element={
                                <AcessoNegadoPage />
                            }
                        />

                        {/* ============================== */}
                        {/* TODOS OS PERFIS                */}
                        {/* ============================== */}

                        <Route
                            path="/dashboard"
                            element={protegerPorPerfil(
                                <DashboardPage />,
                                ACESSOS.DASHBOARD
                            )}
                        />

                        <Route
                            path="/equipamentos"
                            element={protegerPorPerfil(
                                <EquipamentosPage />,
                                ACESSOS.EQUIPAMENTOS
                            )}
                        />

                        <Route
                            path="/producoes"
                            element={protegerPorPerfil(
                                <ProducoesPage />,
                                ACESSOS.PRODUCOES
                            )}
                        />

                        <Route
                            path="/linhas"
                            element={protegerPorPerfil(
                                <PlantasLinhasPage />,
                                ACESSOS.LINHAS
                            )}
                        />

                        <Route
                            path="/produtos"
                            element={protegerPorPerfil(
                                <EmDesenvolvimentoPage />,
                                ACESSOS.PRODUTOS
                            )}
                        />


                        <Route
                            path="/registrar-parada"
                            element={protegerPorPerfil(
                                <RegistrarOcorrenciaPage />,
                                ACESSOS.REGISTRAR_PARADA
                            )}
                        />

                        {/* ============================== */}
                        {/* GESTÃO                         */}
                        {/* ADMIN/GESTOR/SUPERVISOR        */}
                        {/* ============================== */}

                        <Route
                            path="/eventos"
                            element={protegerPorPerfil(
                                <EventosPage />,
                                ACESSOS.EVENTOS
                            )}
                        />

                        <Route
                            path="/layouts-impressao"
                            element={protegerPorPerfil(
                                <LayoutsImpressaoPage />,
                                ACESSOS.LAYOUTS_IMPRESSAO
                            )}
                        />

                        <Route
                            path="/relatorios"
                            element={protegerPorPerfil(
                                <RelatoriosPage />,
                                ACESSOS.RELATORIOS
                            )}
                        />

                        <Route
                            path="/historico"
                            element={protegerPorPerfil(
                                <EmDesenvolvimentoPage />,
                                ACESSOS.HISTORICO
                            )}
                        />

                        {/* ============================== */}
                        {/* ADMINISTRAÇÃO                  */}
                        {/* SOMENTE ADMIN                  */}
                        {/* ============================== */}

                        <Route
                            path="/usuarios"
                            element={protegerPorPerfil(
                                <UsuariosPage />,
                                ACESSOS.USUARIOS
                            )}
                        />

                        <Route
                            path="/configuracoes"
                            element={protegerPorPerfil(
                                <ConfiguracoesPage />,
                                ACESSOS.CONFIGURACOES
                            )}
                        />
                    </Route>

                    {/* ================================== */}
                    {/* ROTA DESCONHECIDA                  */}
                    {/* ================================== */}

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