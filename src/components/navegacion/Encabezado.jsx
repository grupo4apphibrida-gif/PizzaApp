import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  Pizza, LayoutDashboard, ChefHat, LogOut, User, ShoppingCart, 
  ClipboardList, Box, Users, Tag, BarChart3, Menu, X,
  Home, Settings, Award, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Encabezado = () => {
  const { profile, tienePermiso, signOut, cargando } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuAbierto(false);
  }, [location]);

  const handleLogout = useCallback(async () => {
    setMenuAbierto(false);
    await signOut();
  }, [signOut]);

  if (cargando) {
    return (
      <nav className="navbar-professional">
        <div className="nav-container">
          <div className="logo-wrapper">
            <div className="logo-icon"><Pizza size={28} /></div>
            <span className="logo-text">PizzApp</span>
          </div>
        </div>
      </nav>
    );
  }

  const isAdmin = profile && (profile.role === 'admin' || profile.role === 'administrador');
  const isCliente = profile && profile.role === 'cliente';
  
  // TODAS LAS VISTAS COMPLETAS
  const menuItems = [
    // Vistas para clientes (todos pueden ver)
    { label: 'Inicio', path: '/', icon: <Home size={22} />, permission: 'ver_inicio', tooltip: 'Ir al inicio', soloCliente: true },
    { label: 'Mi Carrito', path: '/cliente/carrito', icon: <ShoppingCart size={22} />, permission: 'ver_carrito', tooltip: 'Ver mi carrito de compras', soloCliente: true },
    { label: 'Mis Pedidos', path: '/cliente/mis-pedidos', icon: <ClipboardList size={22} />, permission: 'ver_pedidos', tooltip: 'Historial de mis pedidos', soloCliente: true },
    
    // Vistas de administración
    { label: 'Dashboard', path: '/admin/dashboard', icon: <BarChart3 size={22} />, permission: 'ver_inicio', adminOnly: true, tooltip: 'Panel de control y estadísticas' },
    { label: 'Productos', path: '/admin/productos', icon: <Box size={22} />, permission: 'ver_productos', adminOnly: true, tooltip: 'Gestionar productos del menú' },
    { label: 'Ingredientes', path: '/admin/ingredientes', icon: <Tag size={22} />, permission: 'ver_ingredientes', adminOnly: true, tooltip: 'Administrar ingredientes' },
    { label: 'Promociones', path: '/admin/promociones', icon: <Award size={22} />, permission: 'ver_promociones', adminOnly: true, tooltip: 'Crear y gestionar promociones' },
    { label: 'Pedidos Admin', path: '/admin/pedidos', icon: <CreditCard size={22} />, permission: 'ver_pedidos', adminOnly: true, tooltip: 'Gestionar todos los pedidos' },
    { label: 'Cocina', path: '/admin/cocina', icon: <ChefHat size={22} />, permission: 'ver_pedidos', adminOnly: true, tooltip: 'Vista de cocina para preparar pedidos' },
    { label: 'Clientes', path: '/admin/clientes', icon: <User size={22} />, permission: 'ver_clientes', adminOnly: true, tooltip: 'Gestionar clientes' },
    { label: 'Empleados', path: '/admin/empleados', icon: <User size={22} />, permission: 'ver_empleados', adminOnly: true, tooltip: 'Gestionar personal' },
    { label: 'Permisos', path: '/admin/permisos', icon: <LayoutDashboard size={22} />, permission: 'ver_permisos', adminOnly: true, tooltip: 'Configurar permisos y roles' },
    { label: 'Reportes', path: '/admin/reportes', icon: <BarChart3 size={22} />, permission: 'ver_inicio', adminOnly: true, tooltip: 'Ver reportes y estadísticas' },
    
    // Configuración
    { label: 'Configuración', path: '/settings', icon: <Settings size={22} />, permission: 'ver_inicio', adminOnly: false, tooltip: 'Ajustes del sistema' },
  ];

  // Filtrar items según el rol del usuario
  const visibleItems = menuItems.filter((item) => {
    // Si es administrador, mostrar todo (admin y cliente)
    if (isAdmin) {
      return true;
    }
    // Si es cliente, solo mostrar items de cliente y configuración
    if (isCliente) {
      return item.soloCliente === true || item.label === 'Configuración';
    }
    // Para otros roles (empleados), mostrar items sin adminOnly
    if (item.adminOnly) return false;
    if (!item.permission) return true;
    return profile && tienePermiso(item.permission);
  });

  // Separar items para móvil
  const mainItems = visibleItems.filter(item => !item.adminOnly);
  const adminItems = visibleItems.filter(item => item.adminOnly);

  return (
    <>
      <nav className={`navbar-professional ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link className="logo-wrapper" to="/">
            <div className="logo-icon"><Pizza size={28} /></div>
            <span className="logo-text">PizzApp</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="desktop-nav">
            <ul className="nav-list">
              {visibleItems.map((item) => (
                <li key={item.path} className="nav-item">
                  <div 
                    className="tooltip-container"
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Link 
                      className={`nav-icon-btn ${location.pathname === item.path ? 'active' : ''}`}
                      to={item.path}
                    >
                      {item.icon}
                    </Link>
                    {hoveredItem === item.path && (
                      <div className="tooltip-below">
                        <div className="tooltip-title">{item.label}</div>
                        <div className="tooltip-desc">{item.tooltip}</div>
                        <div className="tooltip-arrow"></div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="user-area">
              {profile ? (
                <>
                  <div 
                    className="tooltip-container"
                    onMouseEnter={() => setHoveredItem('avatar')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className="user-avatar">
                      <span className="avatar-initials">
                        {profile.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                      <div className="user-status"></div>
                    </div>
                    {hoveredItem === 'avatar' && (
                      <div className="tooltip-below">
                        <div className="tooltip-title">{profile.name}</div>
                        <div className="tooltip-desc">{profile.email}</div>
                        <div className="tooltip-arrow"></div>
                      </div>
                    )}
                  </div>
                  <div 
                    className="tooltip-container"
                    onMouseEnter={() => setHoveredItem('logout')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <button className="logout-btn" onClick={handleLogout}>
                      <LogOut size={18} />
                    </button>
                    {hoveredItem === 'logout' && (
                      <div className="tooltip-below">
                        <div className="tooltip-title">Cerrar Sesión</div>
                        <div className="tooltip-desc">Salir de la aplicación</div>
                        <div className="tooltip-arrow"></div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div 
                  className="tooltip-container"
                  onMouseEnter={() => setHoveredItem('login')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link to="/login" className="login-icon-btn">
                    <User size={18} />
                  </Link>
                  {hoveredItem === 'login' && (
                    <div className="tooltip-below">
                      <div className="tooltip-title">Iniciar Sesión</div>
                      <div className="tooltip-desc">Acceder a tu cuenta</div>
                      <div className="tooltip-arrow"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="menu-btn" onClick={() => setMenuAbierto(!menuAbierto)}>
            {menuAbierto ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuAbierto && (
          <>
            <div className="mobile-overlay" onClick={() => setMenuAbierto(false)} />
            <motion.div 
              className="mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="drawer-header">
                <div className="drawer-header-content">
                  <div className="drawer-logo"><Pizza size={28} /></div>
                  <div><h3>PizzApp</h3><p>Tu pizzería favorita</p></div>
                </div>
                <button className="drawer-close" onClick={() => setMenuAbierto(false)}><X size={22} /></button>
              </div>

              {profile && (
                <div className="user-profile-card">
                  <div className="profile-avatar">
                    <span className="profile-initials">{profile.name?.charAt(0).toUpperCase() || 'U'}</span>
                  </div>
                  <div className="profile-info">
                    <span className="profile-name">{profile.name}</span>
                    <span className="profile-email">{profile.email}</span>
                    <span className="profile-role">{profile.role === 'cliente' ? 'Cliente' : profile.role}</span>
                  </div>
                </div>
              )}

              <div className="drawer-menu">
                {mainItems.length > 0 && (
                  <div className="menu-section">
                    <span className="section-title">Principal</span>
                    <ul className="section-list">
                      {mainItems.map((item) => (
                        <li key={item.path}>
                          <Link to={item.path} onClick={() => setMenuAbierto(false)}>
                            <span className="menu-icon">{item.icon}</span>
                            <div className="menu-text">
                              <span className="menu-label">{item.label}</span>
                              <span className="menu-desc">{item.tooltip}</span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {adminItems.length > 0 && (
                  <div className="menu-section">
                    <span className="section-title">Administración</span>
                    <ul className="section-list">
                      {adminItems.map((item) => (
                        <li key={item.path}>
                          <Link to={item.path} onClick={() => setMenuAbierto(false)}>
                            <span className="menu-icon">{item.icon}</span>
                            <div className="menu-text">
                              <span className="menu-label">{item.label}</span>
                              <span className="menu-desc">{item.tooltip}</span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="drawer-footer">
                {profile ? (
                  <button className="drawer-logout" onClick={handleLogout}>
                    <LogOut size={18} /> Cerrar Sesión
                  </button>
                ) : (
                  <Link to="/login" className="drawer-login" onClick={() => setMenuAbierto(false)}>
                    <User size={18} /> Iniciar Sesión
                  </Link>
                )}
                <div className="drawer-version">
                  <span>© 2024 PizzApp</span>
                  <span>v3.0</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        /* Navbar */
        .navbar-professional {
          position: sticky;
          top: 16px;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          margin: 0 16px 24px 16px;
          padding: 0.5rem 0;
          transition: all 0.3s ease;
          border: 1px solid rgba(220, 53, 69, 0.1);
        }

        .navbar-professional.scrolled {
          top: 0;
          margin: 0;
          border-radius: 0;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Logo */
        .logo-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .logo-icon {
          background: linear-gradient(135deg, #dc3545, #ff6b6b);
          border-radius: 14px;
          padding: 8px;
          color: white;
          display: flex;
        }

        .logo-text {
          font-size: 1.3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #dc3545, #ff6b6b);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        /* Desktop Nav */
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-list {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 4px;
          flex-wrap: wrap;
        }

        .nav-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 14px;
          color: #6c757d;
          text-decoration: none;
          transition: all 0.2s;
        }

        .nav-icon-btn:hover {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        }

        .nav-icon-btn.active {
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
        }

        /* TOOLTIP */
        .tooltip-container {
          position: relative;
          display: inline-block;
        }

        .tooltip-below {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 12px;
          background: #1a1a2e;
          color: white;
          padding: 8px 14px;
          border-radius: 12px;
          min-width: 130px;
          text-align: center;
          z-index: 9999;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          pointer-events: none;
          white-space: nowrap;
        }

        .tooltip-title {
          font-weight: 700;
          font-size: 0.75rem;
          color: #ff6b6b;
          margin-bottom: 2px;
        }

        .tooltip-desc {
          font-size: 0.65rem;
          opacity: 0.9;
        }

        .tooltip-arrow {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 6px solid #1a1a2e;
        }

        /* User Area */
        .user-area {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #dc3545, #ff6b6b);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
        }

        .avatar-initials {
          color: white;
          font-weight: 700;
          font-size: 1rem;
        }

        .user-status {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 10px;
          height: 10px;
          background: #28a745;
          border-radius: 50%;
          border: 2px solid white;
        }

        .logout-btn {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          border: none;
          background: transparent;
          color: #6c757d;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logout-btn:hover {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        }

        .login-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
          border-radius: 14px;
          text-decoration: none;
        }

        /* Menu Button Mobile */
        .menu-btn {
          display: none;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: none;
          background: #f8f9fa;
          cursor: pointer;
          align-items: center;
          justify-content: center;
        }

        /* Mobile Drawer */
        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1100;
        }

        .mobile-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 85%;
          max-width: 360px;
          background: white;
          box-shadow: -5px 0 30px rgba(0,0,0,0.15);
          z-index: 1101;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .drawer-header {
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
          padding: 24px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .drawer-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .drawer-logo {
          background: rgba(255,255,255,0.2);
          border-radius: 14px;
          padding: 8px;
        }

        .drawer-header h3 { margin: 0; font-size: 1.1rem; }
        .drawer-header p { margin: 0; font-size: 0.7rem; opacity: 0.9; }
        .drawer-close {
          background: rgba(255,255,255,0.2);
          border: none;
          border-radius: 12px;
          width: 36px;
          height: 36px;
          color: white;
          cursor: pointer;
        }

        .user-profile-card {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          margin: 16px;
          padding: 16px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .profile-avatar {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #dc3545, #ff6b6b);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-initials { color: white; font-size: 1.2rem; font-weight: 700; }
        .profile-name { display: block; font-weight: 800; font-size: 0.95rem; }
        .profile-email { display: block; font-size: 0.7rem; color: #6c757d; }
        .profile-role { display: inline-block; background: #dc3545; color: white; padding: 2px 10px; border-radius: 20px; font-size: 0.65rem; }

        .drawer-menu { flex: 1; padding: 8px 16px; }
        .menu-section { margin-bottom: 24px; }
        .section-title { display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #6c757d; margin-bottom: 12px; padding-left: 12px; }
        .section-list { list-style: none; padding: 0; margin: 0; }
        .section-list li { margin-bottom: 4px; }
        .section-list a { display: flex; align-items: center; gap: 14px; padding: 12px 14px; color: #495057; text-decoration: none; border-radius: 14px; transition: all 0.2s; }
        .section-list a:hover { background: #f8f9fa; transform: translateX(4px); }
        .menu-icon { width: 24px; display: flex; align-items: center; justify-content: center; color: #dc3545; }
        .menu-text { flex: 1; }
        .menu-label { display: block; font-weight: 600; font-size: 0.85rem; }
        .menu-desc { display: block; font-size: 0.65rem; color: #6c757d; }

        .drawer-footer { padding: 16px; border-top: 1px solid #e9ecef; background: #f8f9fa; }
        .drawer-logout, .drawer-login { width: 100%; padding: 12px; border: none; border-radius: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; text-decoration: none; }
        .drawer-logout { background: #dc3545; color: white; }
        .drawer-login { background: #007bff; color: white; }
        .drawer-version { display: flex; justify-content: space-between; margin-top: 12px; font-size: 0.65rem; color: #6c757d; }

        /* Responsive */
        @media (max-width: 991px) {
          .desktop-nav { display: none; }
          .menu-btn { display: flex; }
          .navbar-professional { margin: 12px; }
        }

        .mobile-drawer::-webkit-scrollbar { width: 4px; }
        .mobile-drawer::-webkit-scrollbar-track { background: #f1f1f1; }
        .mobile-drawer::-webkit-scrollbar-thumb { background: #dc3545; border-radius: 4px; }
      `}</style>
    </>
  );
};

export default Encabezado;