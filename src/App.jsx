import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CarritoProvider } from './context/CarritoContext';
import Encabezado from './components/navegacion/Encabezado';
import EmployeeDashboard from './views/employee/EmployeeDashboard';

// IMPORTACIONES CORRECTAS según tu estructura
import CatalogoCliente from './views/client/menu/CatalogoCliente';
import CarritoView from './views/client/CarritoView';
import MisPedidosView from './views/client/pedidos/MisPedidosView';
import ProductosView from './views/admin/productos/ProductosView';
import UsuariosView from './views/admin/usuarios/UsuariosView';
import IngredientsView from './views/admin/ingredientes/IngredientesView';
import PromocionesView from './views/admin/promociones/PromocionesView';
import PedidosAdminView from './views/admin/pedidos/PedidosAdminView';
import ReportesAdminView from './views/admin/reportes/ReportesAdminView';

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
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />
        <Route path="/cliente/catalogo" element={<CatalogoCliente />} />
        <Route path="/cliente/carrito" element={<CarritoView />} />
        <Route path="/cliente/mis-pedidos" element={<MisPedidosView />} />

        {/* ========== RUTAS DE ADMIN ========== */}
        <Route path="/admin" element={<Navigate to="/admin/reportes" replace />} />
        <Route path="/admin/reportes" element={<ReportesAdminView />} />
        <Route path="/admin/productos" element={<ProductosView />} />
        <Route path="/admin/usuarios" element={<UsuariosView />} />
        <Route path="/admin/ingredientes" element={<IngredientsView />} />
        <Route path="/admin/promociones" element={<PromocionesView />} />
        <Route path="/admin/pedidos" element={<PedidosAdminView />} />

        {/* ========== RUTAS DE EMPLEADO ========== */}
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/employee/pedidos" element={<PedidosAdminView />} />

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