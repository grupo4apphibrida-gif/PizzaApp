import React from 'react';
import { Alert } from 'react-bootstrap';

const NotificacionOperacion = ({ mostrar = false, mensaje = '', tipo = 'exito', onCerrar }) => {
  if (!mostrar) return null;

  const variant = tipo === 'error' ? 'danger' : tipo === 'advertencia' ? 'warning' : 'success';

  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050, minWidth: '280px' }}>
      <Alert variant={variant} dismissible onClose={onCerrar} className="shadow-sm">
        {mensaje}
      </Alert>
    </div>
  );
};

export default NotificacionOperacion;
