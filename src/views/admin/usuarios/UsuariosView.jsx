import React, { useEffect, useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUsers, createUser, updateUser, deleteUser } from '../../../services/api';
import ModalRegistroUsuario from '../../../components/usuarios/ModalRegistroUsuario';
import ModalEdicionUsuario from '../../../components/usuarios/ModalEdicionUsuario';
import ModalEliminacionUsuario from '../../../components/usuarios/ModalEliminacionUsuario';
import TablaUsuarios from '../../../components/usuarios/TablaUsuarios';
import NotificacionOperacion from '../../../components/NotificacionOperacion';
import CuadroBusquedas from '../../../components/busquedas/CuadroBusquedas';
import Paginacion from '../../../components/Paginacion';

const UsuariosView = () => {
  const [users, setUsers] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    correo: '',
    password: '',
    rol: 'cliente',
    activo: true,
  });
  const [usuarioEditar, setUsuarioEditar] = useState({
    nombre: '',
    rol: 'cliente',
    activo: true,
  });
  const [usuarioEliminar, setUsuarioEliminar] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setUsuariosFiltrados(users);
    } else {
      const texto = textoBusqueda.toLowerCase();
      const filtrados = users.filter(u =>
        u.nombre.toLowerCase().includes(texto) ||
        u.correo.toLowerCase().includes(texto) ||
        u.rol.toLowerCase().includes(texto)
      );
      setUsuariosFiltrados(filtrados);
    }
    setPaginaActual(1);
  }, [textoBusqueda, users]);

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

  const manejoCambioInputEdicion = (event) => {
    const { name, value, type, checked } = event.target;
    setUsuarioEditar((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const agregarUsuario = async () => {
    if (!nuevoUsuario.nombre.trim() || !nuevoUsuario.correo.trim() || !nuevoUsuario.password.trim()) {
      setToast({ mostrar: true, mensaje: 'Por favor completa todos los campos', tipo: 'error' });
      return;
    }
    try {
      await createUser(nuevoUsuario);
      setMostrarModal(false);
      setNuevoUsuario({ nombre: '', correo: '', password: '', rol: 'cliente', activo: true });
      await cargarUsuarios();
      setToast({ mostrar: true, mensaje: 'Usuario creado con éxito', tipo: 'exito' });
    } catch (error) {
      console.error('Error creando usuario:', error);
      setToast({ mostrar: true, mensaje: 'Error creando usuario', tipo: 'error' });
    }
  };

  const abrirModalEdicion = (usuario) => {
    setUsuarioEditar({ ...usuario });
    setMostrarModalEdicion(true);
  };

  const actualizarUsuario = async () => {
    if (!usuarioEditar.nombre.trim()) {
      setToast({ mostrar: true, mensaje: 'El nombre no puede estar vacío', tipo: 'error' });
      return;
    }
    try {
      await updateUser(usuarioEditar.id, usuarioEditar);
      setMostrarModalEdicion(false);
      await cargarUsuarios();
      setToast({ mostrar: true, mensaje: 'Usuario actualizado con éxito', tipo: 'exito' });
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      setToast({ mostrar: true, mensaje: 'Error actualizando usuario', tipo: 'error' });
    }
  };

  const abrirModalEliminacion = (usuario) => {
    setUsuarioEliminar(usuario);
    setMostrarModalEliminacion(true);
  };

  const eliminarUsuario = async () => {
    if (!usuarioEliminar) return;
    try {
      await deleteUser(usuarioEliminar.id);
      setMostrarModalEliminacion(false);
      setUsuarioEliminar(null);
      await cargarUsuarios();
      setToast({ mostrar: true, mensaje: 'Usuario eliminado con éxito', tipo: 'exito' });
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      setToast({ mostrar: true, mensaje: 'Error eliminando usuario', tipo: 'error' });
    }
  };

  const indiceUltimoRegistro = paginaActual * registrosPorPagina;
  const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(indicePrimerRegistro, indiceUltimoRegistro);

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
            <h3 className="fw-black mb-0 text-dark fs-4">
              <Users size={24} className="me-2" style={{ display: 'inline' }} />
              Gestión de Usuarios
            </h3>
            <button
              className="btn btn-pizza-primary rounded-pill px-4 py-2 fw-bold text-uppercase x-small shadow-sm d-flex align-items-center gap-2"
              onClick={() => setMostrarModal(true)}
            >
              <Plus size={18} /> Agregar Usuario
            </button>
          </div>

          <div className="mb-3">
            <CuadroBusquedas
              textoBusqueda={textoBusqueda}
              manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)}
              placeholder="Buscar por nombre, correo o rol..."
            />
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-pizza-red" role="status"></div>
              <p className="mt-2 text-muted">Cargando usuarios...</p>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No hay usuarios que coincidan con tu búsqueda</p>
            </div>
          ) : (
            <>
              <TablaUsuarios
                usuarios={usuariosPaginados}
                abrirModalEdicion={abrirModalEdicion}
                abrirModalEliminacion={abrirModalEliminacion}
              />
              <Paginacion
                registrosPorPagina={registrosPorPagina}
                totalRegistros={usuariosFiltrados.length}
                paginaActual={paginaActual}
                establecerPaginaActual={setPaginaActual}
                establecerRegistrosPorPagina={setRegistrosPorPagina}
              />
            </>
          )}
        </div>
      </div>

      <ModalRegistroUsuario
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoUsuario={nuevoUsuario}
        manejoCambioInput={manejoCambioInput}
        agregarUsuario={agregarUsuario}
      />

      <ModalEdicionUsuario
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        usuarioEditar={usuarioEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        actualizarUsuario={actualizarUsuario}
      />

      <ModalEliminacionUsuario
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarUsuario={eliminarUsuario}
        usuario={usuarioEliminar}
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
