import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { DashboardLayout } from './components/layout/DashboardLayout.js';
import { LoadingSpinner } from './components/common/LoadingSpinner.js';

// Páginas
import { Login } from './pages/Login.js';
import { Dashboard } from './pages/Dashboard.js';
import { Citas } from './pages/Citas.js';
import { Propietarios } from './pages/Propietarios.js';
import { Pacientes } from './pages/Pacientes.js';
import { Veterinarios } from './pages/Veterinarios.js';
import { Especialidades } from './pages/Especialidades.js';
import { Servicios } from './pages/Servicios.js';
import { HistorialClinico } from './pages/HistorialClinico.js';
import { Usuarios } from './pages/Usuarios.js';
import { Reportes } from './pages/Reportes.js';
import { Perfil } from './pages/Perfil.js';

// Componente para Proteger Rutas Privadas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Verificando sesión segura..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para Restringir Rutas a Rol ADMIN
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || user.rol !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Ruta Pública de Login */}
            <Route path="/login" element={<Login />} />

            {/* Rutas Privadas dentro del Layout del Dashboard */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="citas" element={<Citas />} />
              <Route path="propietarios" element={<Propietarios />} />
              <Route path="pacientes" element={<Pacientes />} />
              <Route path="veterinarios" element={<Veterinarios />} />
              <Route path="especialidades" element={<Especialidades />} />
              <Route path="servicios" element={<Servicios />} />
              <Route path="historial" element={<HistorialClinico />} />
              <Route
                path="usuarios"
                element={
                  <AdminRoute>
                    <Usuarios />
                  </AdminRoute>
                }
              />
              <Route path="reportes" element={<Reportes />} />
              <Route path="perfil" element={<Perfil />} />
            </Route>

            {/* Redirección por Defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
