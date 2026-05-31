import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole, requiredPermission }) => {
  const { usuario, cargando, tienePermiso } = useAuth();

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    console.log('ProtectedRoute: No hay usuario, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  // Validar rol con ambas variantes: "admin" y "administrador"
  if (requiredRole) {
    const rolesValidos = requiredRole === 'admin' ? ['admin', 'administrador'] : [requiredRole];
    if (!rolesValidos.includes(usuario.rol)) {
      console.log(`ProtectedRoute: Rol ${usuario.rol} no coincide con ${requiredRole}, redirigiendo a /`);
      return <Navigate to="/" replace />;
    }
    console.log(`ProtectedRoute: Rol ${usuario.rol} validado correctamente`);
  }

  if (requiredPermission && !tienePermiso(requiredPermission)) {
    console.log(`ProtectedRoute: Permiso ${requiredPermission} no encontrado, redirigiendo a /`);
    return <Navigate to="/" replace />;
  }

  return children;
};


export default ProtectedRoute;
