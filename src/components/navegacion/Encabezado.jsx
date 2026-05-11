import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Pizza, ChefHat, LogOut, User, ShoppingCart, ClipboardList, Box, Users, Tag, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const Encabezado = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Menú', path: '/', icon: <Pizza size={18} /> },
    { label: 'Carrito', path: '/cliente/carrito', icon: <ShoppingCart size={18} /> },
    { label: 'Mis Pedidos', path: '/cliente/mis-pedidos', icon: <ClipboardList size={18} /> },
    { label: 'Admin', path: '/admin/reportes', icon: <BarChart3 size={18} /> },
    { label: 'Productos', path: '/admin/productos', icon: <Box size={18} /> },
    { label: 'Usuarios', path: '/admin/usuarios', icon: <Users size={18} /> },
    { label: 'Ingredientes', path: '/admin/ingredientes', icon: <Tag size={18} /> },
    { label: 'Promociones', path: '/admin/promociones', icon: <Tag size={18} /> },
    { label: 'Pedidos', path: '/admin/pedidos', icon: <ClipboardList size={18} /> },
    { label: 'Cocina', path: '/employee', icon: <ChefHat size={18} /> },
  ];

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
          onClick={() => setMenuOpen(!menuOpen)}
          aria-controls="navbarNav"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"><span></span></span>
        </button>

        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 fw-bold text-dark">
            {menuItems.map((item) => {
              const isActive = item.path === '/admin/reportes'
                ? location.pathname.startsWith('/admin')
                : location.pathname === item.path;
              return (
                <li key={item.path} className="nav-item px-2">
                  <Link
                    className={`nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.icon} {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {profile ? (
              <>
                <div className="text-end d-none d-md-block">
                  <p className="mb-0 fw-black small text-dark">{profile.name}</p>
                  <span className="badge bg-pizza-gradient text-white rounded-pill px-3 py-1 text-uppercase x-small">
                    {profile.role}
                  </span>
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
