import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext.jsx";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

import EquipamentosPage from "./pages/EquipamentosPage";
import LoginPage from "./pages/LoginPage";
import PrimeiroAcessoPage from "./pages/PrimeiroAcessoPage";
import UsuariosPage from "./pages/UsuariosPage.jsx";

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
                  <Route path="/" element={<Navigate to="/login" replace />} />

                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/primeiro-acesso" element={<PrimeiroAcessoPage />} />

                  <Route
                      path="/equipamentos"
                      element={
                          <ProtectedRoute>
                              <EquipamentosPage />
                          </ProtectedRoute>
                      }
                  />

                  <Route
                      path="/usuarios"
                      element={
                          <AdminRoute>
                              <UsuariosPage />
                          </AdminRoute>
                      }
                  />
              </Routes>
          </BrowserRouter>
      </AuthProvider>
  );

}

export default App;