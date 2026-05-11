import React from 'react';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

const UsuariosView = ({ users }) => {
  return (
    <motion.div 
      key="usuarios"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="row g-4"
    >
      <div className="col-12">
        <div className="bg-white p-4 rounded-4 shadow-sm">
          <h3 className="fw-black mb-4 text-dark fs-4">Gestión de Usuarios</h3>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-light text-muted x-small text-uppercase fw-bold tracking-widest border-0">
                <tr>
                  <th className="py-3 border-0 px-4">Usuario</th>
                  <th className="py-3 border-0 px-4">Correo</th>
                  <th className="py-3 border-0 px-4 text-center">Rol</th>
                  <th className="py-3 border-0 px-4 text-end">Registro</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="py-4 px-4 fw-bold">{user.nombre}</td>
                    <td className="py-4 px-4 text-muted">{user.correo}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`badge rounded-pill px-3 py-1 text-uppercase x-small ${user.rol === 'admin' ? 'bg-danger text-white' : user.rol === 'empleado' ? 'bg-primary text-white' : 'bg-light text-dark'}`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-end text-muted small">{new Date(user.creado_en).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UsuariosView;
