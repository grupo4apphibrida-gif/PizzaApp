import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Pizza, LayoutDashboard, ChefHat, LogOut, User, ShoppingCart, ClipboardList, Box, Users, Tag, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const Encabezado = () => {
  const { profile, tienePermiso, signOut, cargando } = useAuth();

  const menuItems = [
    { label: 'Menú', path: '/', icon: <Pizza size={18} />, permission: 'ver_inicio' },
    { label: 'Mis Pedidos', path: '/cliente/mis-pedidos', icon: <ClipboardList size={18} />, permission: 'ver_pedidos' },
    { label: 'Admin', path: '/admin/reportes', icon: <BarChart3 size={18} />, permission: 'ver_inicio', adminOnly: true },
    { label: 'Productos', path: '/admin/productos', icon: <Box size={18} />, permission: 'ver_productos', adminOnly: true },
    { label: 'Usuarios', path: '/admin/usuarios', icon: <Users size={18} />, permission: 'ver_usuarios', adminOnly: true },
    { label: 'Empleados', path: '/admin/empleados', icon: <User size={18} />, permission: 'ver_empleados', adminOnly: true },
    { label: 'Permisos', path: '/admin/permisos', icon: <LayoutDashboard size={18} />, permission: 'ver_permisos', adminOnly: true },
    { label: 'Ingredientes', path: '/admin/ingredientes', icon: <Tag size={18} />, permission: 'ver_ingredientes', adminOnly: true },
    { label: 'Promociones', path: '/admin/promociones', icon: <Tag size={18} />, permission: 'ver_promociones', adminOnly: true },
    { label: 'Pedidos', path: '/admin/pedidos', icon: <ClipboardList size={18} />, permission: 'ver_pedidos', adminOnly: true },
    { label: 'Cocina', path: '/employee', icon: <ChefHat size={18} />, permission: 'ver_pedidos' },
  ];

  if (cargando) return null;

  const isAdmin = profile && ['admin', 'administrador'].includes(profile.role);
  const visibleItems = menuItems.filter((item) => {
    if (!item.permission) return true;
    if (item.adminOnly && !isAdmin) return false;
    return profile && tienePermiso(item.permission);
  });

  return (
    <nav className="navbar navbar-expand-lg navbar-pizza sticky-top shadow-sm py-3 px-4 mb-4 rounded-4 mx-3 mt-3">
      <div className="container-fluid">
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link className="navbar-brand fw-black text-pizza-red fs-3 d-flex align-items-center gap-2" to="/">
            <Pizza size={32} /> PizzApp
          </Link>
        </motion.div>

        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 fw-bold text-dark">
            {visibleItems.map((item) => (
              <li key={item.path} className="nav-item px-2">
                <Link className="nav-link d-flex align-items-center gap-2" to={item.path}>
                  {item.icon} {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {profile && tienePermiso('ver_catalogo') && (
              <Link to="/cliente/carrito" className="btn btn-outline-secondary rounded-circle p-2 shadow-sm" title="Carrito">
                <ShoppingCart size={20} />
              </Link>
            )}

            {profile ? (
              <>
                <div className="text-end d-none d-md-block">
                  <p className="mb-0 fw-black small text-dark">{profile.name}</p>
                  <span className="badge bg-pizza-gradient text-white rounded-pill px-3 py-1 text-uppercase x-small">{profile.role}</span>
                </div>
                <button
                  className="btn btn-light rounded-circle p-2 shadow-sm text-danger"
                  onClick={signOut}
                  title="Cerrar Sesión"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="btn btn-pizza-primary rounded-pill px-4 py-2 fw-bold text-uppercase x-small shadow-sm d-flex align-items-center gap-2"
              >
                <User size={16} /> Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Encabezado;
