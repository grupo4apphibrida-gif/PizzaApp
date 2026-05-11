import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Pizza, LayoutDashboard, ChefHat, LogOut, User, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

const Encabezado = () => {
  const { profile, signOut } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-pizza sticky-top shadow-sm py-3 px-4 mb-4 rounded-4 mx-3 mt-3">
      <div className="container-fluid">
        <motion.a 
          whileHover={{ scale: 1.05 }}
          className="navbar-brand fw-black text-pizza-red fs-3 d-flex align-items-center gap-2" 
          href="/"
        >
          <Pizza size={32} /> PizzApp
        </motion.a>
        
        <button 
          className="navbar-toggler border-0 shadow-none" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 fw-bold text-dark">
            <li className="nav-item px-2">
              <a className="nav-link" href="/">Menú</a>
            </li>
            <li className="nav-item px-2">
              <a className="nav-link text-pizza-red d-flex align-items-center gap-2" href="/admin">
                <LayoutDashboard size={18} /> Admin
              </a>
            </li>
            <li className="nav-item px-2">
              <a className="nav-link text-primary d-flex align-items-center gap-2" href="/employee">
                <ChefHat size={18} /> Cocina
              </a>
            </li>
          </ul>

          
          <div className="d-flex align-items-center gap-3">
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
              <a href="/login" className="btn btn-pizza-primary rounded-pill px-4 py-2 fw-bold text-uppercase x-small shadow-sm d-flex align-items-center gap-2">
                <User size={16} /> Iniciar Sesión
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Encabezado;
