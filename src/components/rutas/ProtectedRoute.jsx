import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole, requiredPermission, allowAdmin = true }) => {
  const { usuario, cargando, tienePermiso } = useAuth();

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <div className="spinner-border text-danger" role="status">
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

  // Verificar si es administrador (con ambas variantes)
  const esAdmin = usuario.rol === 'admin' || usuario.rol === 'administrador';

  // Si es administrador y allowAdmin es true, permitir acceso directo
  if (esAdmin && allowAdmin) {
    console.log(`ProtectedRoute: Admin ${usuario.rol} tiene acceso permitido`);
    return children;
  }

  // Validar rol específico
  if (requiredRole) {
    const rolesValidos = requiredRole === 'admin' ? ['admin', 'administrador'] : [requiredRole];
    if (!rolesValidos.includes(usuario.rol)) {
      console.log(`ProtectedRoute: Rol ${usuario.rol} no coincide con ${requiredRole}, redirigiendo a /`);
      return <Navigate to="/" replace />;
    }
    console.log(`ProtectedRoute: Rol ${usuario.rol} validado correctamente`);
  }

  // Validar permiso específico
  if (requiredPermission && !tienePermiso(requiredPermission)) {
    if (esAdmin) {
      console.log(`ProtectedRoute: Usuario admin ${usuario.rol}, permitiendo acceso aun sin permiso ${requiredPermission}`);
    } else {
      console.log(`ProtectedRoute: Permiso ${requiredPermission} no encontrado, redirigiendo a /`);
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;