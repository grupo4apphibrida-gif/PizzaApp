import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CarritoProvider } from './context/CarritoContext';
import Encabezado from './components/navegacion/Encabezado';
import EmployeeDashboard from './views/employee/EmployeeDashboard';
import ProtectedRoute from './components/rutas/ProtectedRoute';

// IMPORTACIONES
import CatalogoCliente from './views/client/menu/CatalogoCliente';
import CarritoView from './views/client/CarritoView';
import MisPedidosView from './views/client/pedidos/MisPedidosView';
import LoginPage from './views/LoginPage';
import RegisterPage from './views/RegisterPage';
import ProductosView from './views/admin/productos/ProductosView';
import UsuariosView from './views/admin/usuarios/UsuariosView';
import IngredientsView from './views/admin/ingredientes/IngredientesView';
import PromocionesView from './views/admin/promociones/PromocionesView';
import PedidosAdminView from './views/admin/pedidos/PedidosAdminView';
import AdminDashboard from './views/admin/AdminDashboard';
import ReportesAdminView from './views/admin/reportes/ReportesAdminView';
import EmpleadosView from './views/admin/empleados/EmpleadosView';
import PermisosView from './views/admin/permisos/PermisosView';
import ClientesView from './views/ClientesView'; // 👈 IMPORTAR CLIENTES

import './App.css';

const HomeView = () => {
  return <CatalogoCliente />;
};

const AppContent = () => {
  return (
    <Router>
      <Encabezado />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<HomeView />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cliente" element={<Navigate to="/cliente/catalogo" replace />} />
        <Route path="/cliente/catalogo" element={<CatalogoCliente />} />
        <Route path="/cliente/carrito" element={<CarritoView />} />
        <Route path="/cliente/mis-pedidos" element={<MisPedidosView />} />

        {/* ========== RUTAS DE ADMIN ========== */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Navigate to="/admin/dashboard" replace /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin" requiredPermission="ver_inicio"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/reportes" element={<ProtectedRoute requiredRole="admin" requiredPermission="ver_inicio"><ReportesAdminView /></ProtectedRoute>} />
        <Route path="/admin/productos" element={<ProtectedRoute requiredRole="admin" requiredPermission="ver_productos"><ProductosView /></ProtectedRoute>} />
        <Route path="/admin/usuarios" element={<ProtectedRoute requiredRole="admin" requiredPermission="ver_usuarios"><UsuariosView /></ProtectedRoute>} />
        <Route path="/admin/ingredientes" element={<ProtectedRoute requiredRole="admin" requiredPermission="ver_ingredientes"><IngredientsView /></ProtectedRoute>} />
        <Route path="/admin/promociones" element={<ProtectedRoute requiredRole="admin" requiredPermission="ver_promociones"><PromocionesView /></ProtectedRoute>} />
        <Route path="/admin/pedidos" element={<ProtectedRoute requiredRole="admin" requiredPermission="ver_pedidos"><PedidosAdminView /></ProtectedRoute>} />
        <Route path="/admin/clientes" element={<ProtectedRoute requiredRole="admin" requiredPermission="ver_clientes"><ClientesView /></ProtectedRoute>} /> {/* 👈 RUTA DE CLIENTES */}
        <Route path="/admin/empleados" element={<ProtectedRoute requiredRole="admin" requiredPermission="ver_empleados"><EmpleadosView /></ProtectedRoute>} />
        <Route path="/admin/permisos" element={<ProtectedRoute requiredRole="admin" requiredPermission="ver_permisos"><PermisosView /></ProtectedRoute>} />

        {/* ========== RUTAS DE EMPLEADO ========== */}
        <Route path="/employee" element={<ProtectedRoute requiredPermission="ver_pedidos"><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/employee/pedidos" element={<ProtectedRoute requiredPermission="ver_pedidos"><PedidosAdminView /></ProtectedRoute>} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CarritoProvider>
        <AppContent />
      </CarritoProvider>
    </AuthProvider>
  );
};

export default App;