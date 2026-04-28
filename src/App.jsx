import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './views/LoginPage';
import RegisterPage from './views/RegisterPage';
import ClientDashboard from './views/ClientDashboard';
import EmployeeDashboard from './views/EmployeeDashboard';
import AdminDashboard from './views/AdminDashboard';
import ProtectedRoute from './components/rutas/ProtectedRoute';
import './App.css';

const AppContent = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Public Client Dashboard */}
        <Route path="/" element={<ClientDashboard />} />

        {/* MODO PRUEBA: Sin protección de rutas */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/employee" element={<EmployeeDashboard />} />


        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;