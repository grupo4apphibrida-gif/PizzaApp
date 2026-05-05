import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../../../database/supabaseconfig";

import ModalRegistroUsuario from "../../../components/usuarios/ModalRegistroUsuario";
import ModalEdicionUsuario from "../../../components/usuarios/ModalEdicionUsuario";
import ModalEliminacionUsuario from "../../../components/usuarios/ModalEliminacionUsuario";
import TablaUsuarios from "../../../components/usuarios/TablaUsuarios";
import TarjetasUsuarios from "../../../components/usuarios/TarjetasUsuarios";

import NotificacionOperacion from "../../../components/NotificacionOperacion";
import CuadroBusquedas from "../../../components/busquedas/CuadroBusquedas";
import Paginacion from "../../../components/Paginacion";

const UsuariosView = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    correo: "",
    password: "",
    rol: "empleado",
    activo: true,
  });

  const [usuarioEditar, setUsuarioEditar] = useState({
    id: "",
    nombre: "",
    correo: "",
    rol: "cliente",
    activo: true,
    creado_en: "",
  });

  const [usuarioEliminar, setUsuarioEliminar] = useState(null);

  const [toast, setToast] = useState({
    mostrar: false,
    mensaje: "",
    tipo: "",
  });

  // ========== CARGAR USUARIOS ==========
  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .order("creado_en", { ascending: false });

      if (error) throw error;
      setUsuarios(data || []);
      setUsuariosFiltrados(data || []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setToast({
        mostrar: true,
        mensaje: "Error al cargar usuarios",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  // ========== FILTRAR USUARIOS ==========
  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setUsuariosFiltrados(usuarios);
    } else {
      const textoLower = textoBusqueda.toLowerCase();
      const filtrados = usuarios.filter((user) => {
        return (
          user.nombre?.toLowerCase().includes(textoLower) ||
          user.correo?.toLowerCase().includes(textoLower) ||
          user.rol?.toLowerCase().includes(textoLower)
        );
      });
      setUsuariosFiltrados(filtrados);
    }
    setPaginaActual(1);
  }, [textoBusqueda, usuarios]);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // ========== MÉTODOS CRUD ==========
  const manejoCambioInput = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoUsuario((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value, type, checked } = e.target;
    setUsuarioEditar((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const abrirModalEdicion = (usuario) => {
    setUsuarioEditar({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      activo: usuario.activo !== false,
      creado_en: usuario.creado_en,
    });
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (usuario) => {
    setUsuarioEliminar(usuario);
    setMostrarModalEliminacion(true);
  };

  const agregarUsuario = async () => {
    try {
      // Validaciones
      if (!nuevoUsuario.nombre?.trim()) throw new Error("El nombre es obligatorio");
      if (!nuevoUsuario.correo?.trim()) throw new Error("El correo es obligatorio");

      const { error: insertError } = await supabase.from("usuarios").insert({
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol,
        activo: nuevoUsuario.activo !== false,
      });

      if (insertError) throw insertError;

      setMostrarModal(false);
      setNuevoUsuario({
        nombre: "",
        correo: "",
        password: "",
        rol: "empleado",
        activo: true,
      });

      setToast({
        mostrar: true,
        mensaje: `✅ Usuario ${nuevoUsuario.rol} creado exitosamente`,
        tipo: "exito",
      });

      await cargarUsuarios();
    } catch (err) {
      console.error("Error al agregar usuario:", err);
      setToast({
        mostrar: true,
        mensaje: err.message || "Error al crear usuario",
        tipo: "error",
      });
    }
  };

  const actualizarUsuario = async () => {
    try {
      if (!usuarioEditar.nombre?.trim()) throw new Error("El nombre es obligatorio");

      const { error } = await supabase
        .from("usuarios")
        .update({
          nombre: usuarioEditar.nombre,
          rol: usuarioEditar.rol,
          activo: usuarioEditar.activo,
        })
        .eq("id", usuarioEditar.id);

      if (error) throw error;

      setMostrarModalEdicion(false);
      setToast({
        mostrar: true,
        mensaje: "Usuario actualizado correctamente",
        tipo: "exito",
      });

      await cargarUsuarios();
    } catch (err) {
      console.error("Error al actualizar usuario:", err);
      setToast({
        mostrar: true,
        mensaje: err.message || "Error al actualizar usuario",
        tipo: "error",
      });
    }
  };

  const eliminarUsuario = async () => {
    try {
      const { error } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", usuarioEliminar.id);

      if (error) throw error;

      setMostrarModalEliminacion(false);
      setUsuarioEliminar(null);

      setToast({
        mostrar: true,
        mensaje: "Usuario eliminado correctamente",
        tipo: "exito",
      });

      await cargarUsuarios();
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      setToast({
        mostrar: true,
        mensaje: err.message || "Error al eliminar usuario",
        tipo: "error",
      });
    }
  };

  // Paginación
  const indiceUltimoRegistro = paginaActual * registrosPorPagina;
  const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(
    indicePrimerRegistro,
    indiceUltimoRegistro
  );

  return (
    <Container className="mt-5">
      <div className="user-header-card mb-4 p-4 shadow-sm rounded-4 bg-white border">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <span className="badge bg-primary bg-opacity-10 text-primary mb-2">
              <i className="bi bi-people-fill me-2"></i>Usuarios
            </span>
            <h2 className="mb-1">Gestión de Usuarios</h2>
            <p className="text-muted mb-1">
              Administra los usuarios de la plataforma
            </p>
            <small className="text-secondary">
              {usuariosFiltrados.length} usuarios registrados
            </small>
          </div>

          <Button
            variant="primary"
            className="px-4 py-2"
            onClick={() => setMostrarModal(true)}
          >
            <i className="bi bi-person-plus-fill me-2"></i>
            Nuevo Usuario
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)}
            placeholder="Buscar por nombre, correo o rol..."
          />
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {textoBusqueda.trim() && usuariosFiltrados.length === 0 && (
            <Row className="mb-4">
              <Col>
                <Alert variant="info" className="text-center">
                  No se encontraron usuarios que coincidan con "{textoBusqueda}"
                </Alert>
              </Col>
            </Row>
          )}

          {usuariosFiltrados.length > 0 ? (
            <>
              <Row>
                <Col xs={12} className="d-none d-lg-block">
                  <div className="user-table-card mb-4 p-4 shadow-sm rounded-4 bg-white border">
                    <TablaUsuarios
                      usuarios={usuariosPaginados}
                      abrirModalEdicion={abrirModalEdicion}
                      abrirModalEliminacion={abrirModalEliminacion}
                    />
                  </div>
                </Col>

                <Col xs={12} className="d-block d-lg-none">
                  <div className="user-card-view mb-4 p-3">
                    <TarjetasUsuarios
                      usuarios={usuariosPaginados}
                      abrirModalEdicion={abrirModalEdicion}
                      abrirModalEliminacion={abrirModalEliminacion}
                    />
                  </div>
                </Col>
              </Row>

              <Paginacion
                registrosPorPagina={registrosPorPagina}
                totalRegistros={usuariosFiltrados.length}
                paginaActual={paginaActual}
                establecerPaginaActual={setPaginaActual}
                establecerRegistrosPorPagina={setRegistrosPorPagina}
              />
            </>
          ) : (
            <Row className="justify-content-center">
              <Col lg={8} className="text-center py-5">
                <div className="bg-light rounded-4 p-4">
                  <i className="bi bi-people fs-1 text-muted"></i>
                  <h5 className="mt-3 mb-3">No hay usuarios registrados</h5>
                  <p className="text-muted mb-0">
                    Haz clic en "Nuevo Usuario" para agregar empleados o administradores.
                  </p>
                </div>
              </Col>
            </Row>
          )}
        </>
      )}

      {/* MODALES */}
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
    </Container>
  );
};

export default UsuariosView;