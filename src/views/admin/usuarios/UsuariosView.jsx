import React, { useEffect, useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUsers, createUser } from '../../../services/api';
import ModalRegistroUsuario from '../../../components/usuarios/ModalRegistroUsuario';
import NotificacionOperacion from '../../../components/NotificacionOperacion';
import Paginacion from '../../../components/Paginacion';

const UsuariosView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    correo: '',
    password: '',
    rol: 'empleado',
    activo: true,
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const usuarios = await getUsers();
      setUsers(usuarios || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setToast({ mostrar: true, mensaje: 'Error cargando usuarios', tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const manejoCambioInput = (event) => {
    const { name, value } = event.target;
    setNuevoUsuario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const agregarUsuario = async () => {
    try {
      await createUser(nuevoUsuario);
      setMostrarModal(false);
      setNuevoUsuario({ nombre: '', correo: '', password: '', rol: 'empleado', activo: true });
      await cargarUsuarios();
      setToast({ mostrar: true, mensaje: 'Usuario creado con éxito', tipo: 'exito' });
    } catch (error) {
      console.error('Error creando usuario:', error);
      setToast({ mostrar: true, mensaje: 'Error creando usuario', tipo: 'error' });
    }
  };

  const indiceUltimoRegistro = paginaActual * registrosPorPagina;
  const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
  const usuariosPaginados = users.slice(indicePrimerRegistro, indiceUltimoRegistro);

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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-black mb-0 text-dark fs-4">Gestión de Usuarios</h3>
            <button
              className="btn btn-pizza-primary rounded-pill px-4 py-2 fw-bold text-uppercase x-small shadow-sm d-flex align-items-center gap-2"
              onClick={() => setMostrarModal(true)}
            >
              <Plus size={18} /> Agregar Usuario
            </button>
          </div>
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
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      <div className="spinner-border text-pizza-red" role="status"></div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">No hay usuarios registrados aún.</td>
                  </tr>
                ) : usuariosPaginados.map(user => (
                  <tr key={user.id}>
                    <td className="py-4 px-4 fw-bold">{user.nombre}</td>
                    <td className="py-4 px-4 text-muted">{user.correo}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`badge rounded-pill px-3 py-1 text-uppercase x-small ${user.rol === 'admin' ? 'bg-danger text-white' : user.rol === 'empleado' ? 'bg-primary text-white' : 'bg-light text-dark'}`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-end text-muted small">{user.creado_en ? new Date(user.creado_en).toLocaleDateString() : '---'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ModalRegistroUsuario
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoUsuario={nuevoUsuario}
        manejoCambioInput={manejoCambioInput}
        agregarUsuario={agregarUsuario}
      />
      <Paginacion
        registrosPorPagina={registrosPorPagina}
        totalRegistros={users.length}
        paginaActual={paginaActual}
        establecerPaginaActual={setPaginaActual}
        establecerRegistrosPorPagina={setRegistrosPorPagina}
      />
      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </motion.div>
  );
};

export default UsuariosView;
