import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  Pizza, LayoutDashboard, ChefHat, LogOut, User, ShoppingCart, 
  ClipboardList, Box, Tag, BarChart3, Menu, X,
  Home, Settings, Award, CreditCard, Star, Bell, Check, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../database/supabaseconfig';

const Encabezado = () => {
  const { profile, tienePermiso, signOut, cargando } = useAuth();
  const { profileColor, profileLetter, notifications, addNotification, markAllRead, clearNotifications, notifPedidos } = useSettings();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [pedidosPendientes, setPedidosPendientes] = useState(0);
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuAbierto(false); setShowNotif(false); }, [location]);

  const handleLogout = useCallback(async () => {
    setMenuAbierto(false);
    await signOut();
  }, [signOut]);

  const isAdmin = profile && (profile.role === 'admin' || profile.role === 'administrador');
  const isCliente = profile && profile.role === 'cliente';

  // Suscripción Realtime a pedidos
  useEffect(() => {
    if (!profile || !notifPedidos) return;

    let channel;

    if (isAdmin) {
      channel = supabase
        .channel('admin-pedidos')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, (payload) => {
          addNotification({
            type: 'nuevo_pedido',
            title: 'Nuevo Pedido',
            body: `Pedido #${String(payload.new.id).substring(0, 8)} — ${payload.new.nombre_cliente || payload.new.email_cliente || 'Cliente'}`,
            icon: '🍕',
            time: new Date().toLocaleTimeString(),
          });
        })
        .subscribe();
    } else if (isCliente) {
      const email = profile.email;
      channel = supabase
        .channel('cliente-pedido-status')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `email_cliente=eq.${email}` }, (payload) => {
          if (payload.new.estado === 'entregado') {
            addNotification({
              type: 'pedido_entregado',
              title: 'Pedido Entregado',
              body: `Tu pedido #${String(payload.new.id).substring(0, 8)} ya está listo 🎉`,
              icon: '✅',
              time: new Date().toLocaleTimeString(),
            });
          }
        })
        .subscribe();
    }

    return () => { if (channel) supabase.removeChannel(channel); };
  }, [profile, isAdmin, isCliente, addNotification, notifPedidos]);

  // Badge pedidos pendientes (solo admin)
  useEffect(() => {
    if (!isAdmin) return;
    const fetchPendientes = async () => {
      const { count } = await supabase
        .from('pedidos')
        .select('id', { count: 'exact', head: true })
        .eq('estado', 'pendiente');
      setPedidosPendientes(count || 0);
    };
    fetchPendientes();
    const ch = supabase.channel('pendientes-badge')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, fetchPendientes)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [isAdmin]);

  if (cargando) {
    return (
      <nav className="navbar-professional">
        <div className="nav-container">
          <div className="logo-wrapper">
            <div className="logo-icon"><Pizza size={28} /></div>
            <span className="logo-text" style={{ fontFamily: "'Pacifico', cursive" }}>PizzApp</span>
          </div>
        </div>
      </nav>
    );
  }

  const menuItems = [
    { label: 'Inicio', path: '/', icon: <Home size={22} />, tooltip: 'Inicio', soloCliente: true },
    { label: 'Mi Carrito', path: '/cliente/carrito', icon: <ShoppingCart size={22} />, permission: 'ver_carrito', tooltip: 'Mi Carrito', soloCliente: true },
    { label: 'Mis Pedidos', path: '/cliente/mis-pedidos', icon: <ClipboardList size={22} />, permission: 'ver_pedidos', tooltip: 'Mis Pedidos', soloCliente: true },
    { label: 'Dashboard', path: '/admin/dashboard', icon: <BarChart3 size={22} />, permission: 'ver_inicio', adminOnly: true, tooltip: 'Dashboard' },
    { label: 'Productos', path: '/admin/productos', icon: <Box size={22} />, permission: 'ver_productos', adminOnly: true, tooltip: 'Productos' },
    { label: 'Ingredientes', path: '/admin/ingredientes', icon: <Tag size={22} />, permission: 'ver_ingredientes', adminOnly: true, tooltip: 'Ingredientes' },
    { label: 'Promociones', path: '/admin/promociones', icon: <Award size={22} />, permission: 'ver_promociones', adminOnly: true, tooltip: 'Promociones' },
    { label: 'Pedidos', path: '/admin/pedidos', icon: <CreditCard size={22} />, permission: 'ver_pedidos', adminOnly: true, tooltip: 'Pedidos' },
    {
      label: 'Cocina', path: '/admin/cocina',
      icon: (
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <ChefHat size={22} />
          {pedidosPendientes > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -8,
              background: '#dc3545', color: 'white', borderRadius: '50%',
              width: 16, height: 16, fontSize: '0.6rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid white', lineHeight: 1,
            }}>{pedidosPendientes > 9 ? '9+' : pedidosPendientes}</span>
          )}
        </div>
      ),
      permission: 'ver_pedidos', adminOnly: true, tooltip: 'Cocina'
    },
    { label: 'Clientes', path: '/admin/clientes', icon: <User size={22} />, permission: 'ver_clientes', adminOnly: true, tooltip: 'Clientes' },
    { label: 'Empleados', path: '/admin/empleados', icon: <User size={22} />, permission: 'ver_empleados', adminOnly: true, tooltip: 'Empleados' },
    { label: 'Calificaciones', path: '/admin/calificaciones', icon: <Star size={22} />, permission: 'ver_calificaciones', adminOnly: true, tooltip: 'Calificaciones' },
    { label: 'Permisos', path: '/admin/permisos', icon: <LayoutDashboard size={22} />, permission: 'ver_permisos', adminOnly: true, tooltip: 'Permisos' },
    { label: 'Reportes', path: '/admin/reportes', icon: <BarChart3 size={22} />, permission: 'ver_inicio', adminOnly: true, tooltip: 'Reportes' },
    { label: 'Configuración', path: '/settings', icon: <Settings size={22} />, tooltip: 'Configuración' },
  ];

  const visibleItems = menuItems.filter((item) => {
    if (isAdmin) return true;
    if (isCliente) return item.soloCliente === true || item.path === '/settings';
    if (item.adminOnly) return false;
    if (!item.permission) return true;
    return profile && tienePermiso(item.permission);
  });

  const mainItems = visibleItems.filter(item => !item.adminOnly);
  const adminItems = visibleItems.filter(item => item.adminOnly);

  const displayLetter = profileLetter || profile?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <>
      <nav className={`navbar-professional ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link className="logo-wrapper" to="/">
            <div className="logo-icon"><Pizza size={28} /></div>
            <span className="logo-text" style={{ fontFamily: "'Pacifico', cursive" }}>PizzApp</span>
          </Link>

          <div className="desktop-nav">
            <ul className="nav-list">
              {visibleItems.map((item) => (
                <li key={item.path} className="nav-item">
                  <div className="tooltip-container" onMouseEnter={() => setHoveredItem(item.path)} onMouseLeave={() => setHoveredItem(null)}>
                    <Link className={`nav-icon-btn ${location.pathname === item.path ? 'active' : ''}`} to={item.path}>
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
              {profile && (
                <>
                  {/* Campana de notificaciones */}
                  <div className="tooltip-container" style={{ position: 'relative' }}>
                    <button
                      className="notif-btn"
                      onClick={() => { setShowNotif(v => !v); if (!showNotif) markAllRead(); }}
                      title="Notificaciones"
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                      )}
                    </button>
                    <AnimatePresence>
                      {showNotif && (
                        <motion.div
                          className="notif-dropdown"
                          initial={{ opacity: 0, y: -8, scale: .96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: .96 }}
                          transition={{ duration: .15 }}
                        >
                          <div className="notif-header">
                            <span className="fw-bold">Notificaciones</span>
                            {notifications.length > 0 && (
                              <button className="notif-clear" onClick={clearNotifications}><Trash2 size={14} /></button>
                            )}
                          </div>
                          <div className="notif-list">
                            {notifications.length === 0 ? (
                              <p className="notif-empty">Sin notificaciones nuevas</p>
                            ) : (
                              notifications.map(n => (
                                <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`}>
                                  <span className="notif-icon">{n.icon}</span>
                                  <div className="notif-body">
                                    <strong>{n.title}</strong>
                                    <p>{n.body}</p>
                                    <small>{n.time}</small>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Avatar */}
                  <div className="tooltip-container" onMouseEnter={() => setHoveredItem('avatar')} onMouseLeave={() => setHoveredItem(null)}>
                    <div className="user-avatar" style={{ background: profileColor }}>
                      <span className="avatar-initials">{displayLetter}</span>
                      <div className="user-status"></div>
                    </div>
                    {hoveredItem === 'avatar' && (
                      <div className="tooltip-below">
                        <p className="mb-0 fw-bold">{profile.name}</p>
                      <p className="text-muted small mb-0">{profile.email}</p>
                        <div className="tooltip-arrow"></div>
                      </div>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="tooltip-container" onMouseEnter={() => setHoveredItem('logout')} onMouseLeave={() => setHoveredItem(null)}>
                    <button className="logout-btn" onClick={handleLogout}><LogOut size={18} /></button>
                    {hoveredItem === 'logout' && (
                      <div className="tooltip-below">
                        <div className="tooltip-title">Cerrar Sesión</div>
                        <div className="tooltip-arrow"></div>
                      </div>
                    )}
                  </div>
                </>
              )}
              {!profile && (
                <div className="tooltip-container" onMouseEnter={() => setHoveredItem('login')} onMouseLeave={() => setHoveredItem(null)}>
                  <Link to="/login" className="login-icon-btn"><User size={18} /></Link>
                  {hoveredItem === 'login' && (
                    <div className="tooltip-below">
                      <div className="tooltip-title">Iniciar Sesión</div>
                      <div className="tooltip-arrow"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

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
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="drawer-header">
                <div className="drawer-header-content">
                  <div className="drawer-logo"><Pizza size={28} /></div>
                  <div><h3 style={{ fontFamily: "'Pacifico', cursive" }}>PizzApp</h3><p>Tu pizzería favorita</p></div>
                </div>
                <button className="drawer-close" onClick={() => setMenuAbierto(false)}><X size={22} /></button>
              </div>

              {profile && (
                <div className="user-profile-card">
                  <div className="profile-avatar" style={{ background: profileColor }}>
                    <span className="profile-initials">{displayLetter}</span>
                  </div>
                  <div className="profile-info">
                    <span className="profile-name">{profile.name}</span>
                    <span className="profile-email">{profile.email}</span>
                    <span className="profile-role" style={{ background: profileColor }}>{profile.role === 'cliente' ? 'Cliente' : profile.role}</span>
                  </div>
                </div>
              )}

              <div className="drawer-menu">
                {mainItems.length > 0 && (
                  <div className="menu-section">
                    <span className="section-title">Principal</span>
                    <ul className="section-list">
                      {mainItems.map(item => (
                        <li key={item.path}>
                          <Link to={item.path} onClick={() => setMenuAbierto(false)}>
                            <span className="menu-icon">{item.icon}</span>
                            <div className="menu-text"><span className="menu-label">{item.label}</span></div>
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
                      {adminItems.map(item => (
                        <li key={item.path}>
                          <Link to={item.path} onClick={() => setMenuAbierto(false)}>
                            <span className="menu-icon">{item.icon}</span>
                            <div className="menu-text"><span className="menu-label">{item.label}</span></div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="drawer-footer">
                {profile ? (
                  <button className="drawer-logout" onClick={handleLogout}><LogOut size={18} /> Cerrar Sesión</button>
                ) : (
                  <Link to="/login" className="drawer-login" onClick={() => setMenuAbierto(false)}><User size={18} /> Iniciar Sesión</Link>
                )}
                <div className="drawer-version"><span>© 2024 PizzApp</span><span>v3.0</span></div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .navbar-professional {
          position: sticky; top: 16px; z-index: 1000;
          background: rgba(255,255,255,.98); backdrop-filter: blur(20px);
          border-radius: 28px; margin: 0 16px 24px 16px;
          padding: .5rem 0; transition: all .3s;
          border: 1px solid rgba(220,53,69,.1);
        }
        [data-bs-theme="dark"] .navbar-professional {
          background: rgba(26,26,46,.98);
          border-color: rgba(220,53,69,.2);
        }
        .navbar-professional.scrolled { top: 0; margin: 0; border-radius: 0; }
        .nav-container { max-width: 1400px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; }
        .logo-wrapper { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .logo-icon { background: linear-gradient(135deg,#dc3545,#ff6b6b); border-radius: 14px; padding: 8px; color: white; display: flex; }
        .logo-text { font-size: 1.3rem; font-weight: 800; background: linear-gradient(135deg,#dc3545,#ff6b6b); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .desktop-nav { display: flex; align-items: center; gap: 32px; }
        .nav-list { display: flex; list-style: none; margin: 0; padding: 0; gap: 4px; flex-wrap: wrap; }
        .nav-icon-btn { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 14px; color: #6c757d; text-decoration: none; transition: all .2s; }
        .nav-icon-btn:hover { background: rgba(220,53,69,.1); color: #dc3545; }
        .nav-icon-btn.active { background: linear-gradient(135deg,#dc3545,#c82333); color: white; }
        .tooltip-container { position: relative; display: inline-block; }
        .tooltip-below { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 12px; background: #1a1a2e; color: white; padding: 8px 14px; border-radius: 12px; min-width: 130px; text-align: center; z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,.2); pointer-events: none; white-space: nowrap; }
        .tooltip-title { font-weight: 700; font-size: .75rem; color: #ff6b6b; margin-bottom: 2px; }
        .tooltip-desc { font-size: .65rem; opacity: .9; }
        .tooltip-arrow { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 6px solid #1a1a2e; }
        .user-area { display: flex; align-items: center; gap: 12px; }
        .user-avatar { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; transition: background .3s; }
        .avatar-initials { color: white; font-weight: 700; font-size: 1rem; }
        .user-status { position: absolute; bottom: 2px; right: 2px; width: 10px; height: 10px; background: #28a745; border-radius: 50%; border: 2px solid white; }
        .logout-btn { width: 44px; height: 44px; border-radius: 14px; border: none; background: transparent; color: #6c757d; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .2s; }
        .logout-btn:hover { background: rgba(220,53,69,.1); color: #dc3545; }
        .login-icon-btn { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: linear-gradient(135deg,#dc3545,#c82333); color: white; border-radius: 14px; text-decoration: none; }
        /* Notif */
        .notif-btn { position: relative; width: 44px; height: 44px; border-radius: 14px; border: none; background: transparent; color: #6c757d; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .2s; }
        .notif-btn:hover { background: rgba(220,53,69,.1); color: #dc3545; }
        .notif-badge { position: absolute; top: 6px; right: 6px; width: 18px; height: 18px; background: #dc3545; color: white; border-radius: 50%; font-size: .6rem; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid white; }
        .notif-dropdown { position: absolute; top: calc(100% + 12px); right: 0; width: 320px; background: white; border-radius: 20px; box-shadow: 0 8px 40px rgba(0,0,0,.15); z-index: 9999; overflow: hidden; }
        [data-bs-theme="dark"] .notif-dropdown { background: #1a1a2e; }
        .notif-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.06); }
        .notif-clear { background: none; border: none; color: #6c757d; cursor: pointer; padding: 4px; border-radius: 8px; }
        .notif-clear:hover { background: rgba(220,53,69,.1); color: #dc3545; }
        .notif-list { max-height: 320px; overflow-y: auto; }
        .notif-empty { text-align: center; color: #6c757d; padding: 32px 20px; margin: 0; font-size: .85rem; }
        .notif-item { display: flex; gap: 12px; padding: 14px 20px; border-bottom: 1px solid rgba(0,0,0,.04); transition: background .15s; }
        .notif-item.unread { background: rgba(220,53,69,.04); }
        .notif-icon { font-size: 1.5rem; flex-shrink: 0; }
        .notif-body strong { display: block; font-size: .82rem; color: inherit; }
        .notif-body p { font-size: .75rem; color: #6c757d; margin: 2px 0 0; }
        .notif-body small { font-size: .65rem; color: #adb5bd; }
        /* Mobile */
        .menu-btn { display: none; width: 44px; height: 44px; border-radius: 12px; border: none; background: #f8f9fa; cursor: pointer; align-items: center; justify-content: center; }
        .mobile-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,.5); backdrop-filter: blur(4px); z-index: 1100; }
        .mobile-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 85%; max-width: 360px; background: white; box-shadow: -5px 0 30px rgba(0,0,0,.15); z-index: 1101; display: flex; flex-direction: column; overflow-y: auto; }
        [data-bs-theme="dark"] .mobile-drawer { background: #1a1a2e; }
        .drawer-header { background: linear-gradient(135deg,#dc3545,#c82333); color: white; padding: 24px 20px; display: flex; justify-content: space-between; align-items: center; }
        .drawer-header-content { display: flex; align-items: center; gap: 12px; }
        .drawer-logo { background: rgba(255,255,255,.2); border-radius: 14px; padding: 8px; }
        .drawer-header h3 { margin: 0; font-size: 1.1rem; } .drawer-header p { margin: 0; font-size: .7rem; opacity: .9; }
        .drawer-close { background: rgba(255,255,255,.2); border: none; border-radius: 12px; width: 36px; height: 36px; color: white; cursor: pointer; display:flex; align-items:center; justify-content:center; }
        .user-profile-card { background: linear-gradient(135deg,#f8f9fa,#e9ecef); margin: 16px; padding: 16px; border-radius: 20px; display: flex; align-items: center; gap: 14px; }
        [data-bs-theme="dark"] .user-profile-card { background: rgba(255,255,255,.05); }
        .profile-avatar { width: 56px; height: 56px; border-radius: 18px; display: flex; align-items: center; justify-content: center; transition: background .3s; }
        .profile-initials { color: white; font-size: 1.2rem; font-weight: 700; }
        .profile-name { display: block; font-weight: 800; font-size: .95rem; }
        .profile-email { display: block; font-size: .7rem; color: #6c757d; }
        .profile-role { display: inline-block; color: white; padding: 2px 10px; border-radius: 20px; font-size: .65rem; transition: background .3s; }
        .drawer-menu { flex: 1; padding: 8px 16px; }
        .menu-section { margin-bottom: 24px; }
        .section-title { display: block; font-size: .7rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #6c757d; margin-bottom: 12px; padding-left: 12px; }
        .section-list { list-style: none; padding: 0; margin: 0; }
        .section-list li { margin-bottom: 4px; }
        .section-list a { display: flex; align-items: center; gap: 14px; padding: 12px 14px; color: inherit; text-decoration: none; border-radius: 14px; transition: all .2s; }
        .section-list a:hover { background: #f8f9fa; transform: translateX(4px); }
        [data-bs-theme="dark"] .section-list a:hover { background: rgba(255,255,255,.05); }
        .menu-icon { width: 24px; display: flex; align-items: center; justify-content: center; color: #dc3545; }
        .menu-text { flex: 1; } .menu-label { display: block; font-weight: 600; font-size: .85rem; } .menu-desc { display: block; font-size: .65rem; color: #6c757d; }
        .drawer-footer { padding: 16px; border-top: 1px solid #e9ecef; background: #f8f9fa; }
        [data-bs-theme="dark"] .drawer-footer { background: rgba(255,255,255,.03); border-color: rgba(255,255,255,.05); }
        .drawer-logout, .drawer-login { width: 100%; padding: 12px; border: none; border-radius: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; text-decoration: none; }
        .drawer-logout { background: #dc3545; color: white; }
        .drawer-login { background: #007bff; color: white; }
        .drawer-version { display: flex; justify-content: space-between; margin-top: 12px; font-size: .65rem; color: #6c757d; }
        @media (max-width: 991px) { .desktop-nav { display: none; } .menu-btn { display: flex; } .navbar-professional { margin: 12px; } }
        .mobile-drawer::-webkit-scrollbar { width: 4px; }
        .mobile-drawer::-webkit-scrollbar-thumb { background: #dc3545; border-radius: 4px; }
      `}</style>
    </>
  );
};

export default Encabezado;