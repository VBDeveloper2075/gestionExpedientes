import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/index.css';
import './styles/Expedientes.css';
import './styles/Tables.css';

// Context
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';

// Componentes comunes
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Alerts from './components/common/Alerts';
import Loader from './components/common/Loader';

// Componentes de autenticación
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UserProfile from './components/auth/UserProfile';

// Páginas
import Dashboard from './pages/Dashboard';
import Docentes from './pages/Docentes';
import Escuelas from './pages/Escuelas';
import Expedientes from './pages/Expedientes';
import Disposiciones from './pages/Disposiciones';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="app-container d-flex flex-column min-vh-100">
            <Routes>
              {/* Ruta de login (sin navbar/footer) */}
              <Route path="/login" element={<Login />} />
              
              {/* Rutas protegidas (con navbar/footer) */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <Navbar />
                  <UserProfile />
                  <Alerts />
                  
                  <main className="main-container flex-grow-1">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      
                      {/* Rutas de Docentes */}
                      <Route path="/docentes" element={<Docentes />} />
                      <Route path="/docentes/nuevo" element={
                        <ProtectedRoute requireAdmin={true}>
                          <Docentes action="nuevo" />
                        </ProtectedRoute>
                      } />
                      <Route path="/docentes/editar/:id" element={
                        <ProtectedRoute requireAdmin={true}>
                          <Docentes action="editar" />
                        </ProtectedRoute>
                      } />
                      <Route path="/docentes/:id" element={<Docentes action="ver" />} />
                      
                      {/* Rutas de Escuelas */}
                      <Route path="/escuelas" element={<Escuelas />} />
                      <Route path="/escuelas/nueva" element={
                        <ProtectedRoute requireAdmin={true}>
                          <Escuelas action="nueva" />
                        </ProtectedRoute>
                      } />
                      <Route path="/escuelas/editar/:id" element={
                        <ProtectedRoute requireAdmin={true}>
                          <Escuelas action="editar" />
                        </ProtectedRoute>
                      } />
                      <Route path="/escuelas/:id" element={<Escuelas action="ver" />} />
                      
                      {/* Rutas de Expedientes */}
                      <Route path="/expedientes" element={<Expedientes />} />
                      <Route path="/expedientes/nuevo" element={
                        <ProtectedRoute requireAdmin={true}>
                          <Expedientes action="nuevo" />
                        </ProtectedRoute>
                      } />
                      <Route path="/expedientes/editar/:id" element={
                        <ProtectedRoute requireAdmin={true}>
                          <Expedientes action="editar" />
                        </ProtectedRoute>
                      } />
                      <Route path="/expedientes/:id" element={<Expedientes action="ver" />} />
                      
                      {/* Rutas de Disposiciones */}
                      <Route path="/disposiciones" element={<Disposiciones />} />
                      <Route path="/disposiciones/nueva" element={
                        <ProtectedRoute requireAdmin={true}>
                          <Disposiciones action="nueva" />
                        </ProtectedRoute>
                      } />
                      <Route path="/disposiciones/editar/:id" element={
                        <ProtectedRoute requireAdmin={true}>
                          <Disposiciones action="editar" />
                        </ProtectedRoute>
                      } />
                      <Route path="/disposiciones/:id" element={<Disposiciones action="ver" />} />
                      
                      {/* Ruta por defecto */}
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </main>
                  
                  <Footer />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
