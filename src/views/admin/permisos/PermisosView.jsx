import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { supabase } from '../../../database/supabaseconfig';
import NotificacionOperacion from '../../../components/NotificacionOperacion';
import CuadroBusquedas from '../../../components/busquedas/CuadroBusquedas';
import TablaPermisos from '../../../components/permisos/TablaPermisos';
import TarjetaPermisos from '../../../components/permisos/TarjetaPermisos';
import ModalEdicionPermisos from '../../../components/permisos/ModalEdicionPermisos';
import Paginacion from '../../../components/Paginacion';

const PermisosView = () => {
  const [roles, setRoles] = useState([]);
  const [rolesFiltrados, setRolesFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [rolEditar, setRolEditar] = useState(null);
  const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const cargarRoles = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('permisos')
        .select('*')
        .order('rol', { ascending: true });

      if (error) throw error;
      setRoles(data || []);
      setRolesFiltrados(data || []);
    } catch (err) {
      setToast({ mostrar: true, mensaje: 'Error al cargar permisos', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarRoles();
  }, []);

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setRolesFiltrados(roles);
    } else {
      const texto = textoBusqueda.toLowerCase();
      const filtrados = roles.filter(r => 
        r.rol.toLowerCase().includes(texto) || 
        (r.descripcion || '').toLowerCase().includes(texto)
      );
      setRolesFiltrados(filtrados);
    }
    setPaginaActual(1);
  }, [textoBusqueda, roles]);

  const abrirModalEdicion = (rol) => {
    setRolEditar({ ...rol });
    setMostrarModalEdicion(true);
  };

  const indiceUltimoRegistro = paginaActual * registrosPorPagina;
  const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
  const rolesPaginados = rolesFiltrados.slice(indicePrimerRegistro, indiceUltimoRegistro);

  const actualizarPermisos = async () => {
    if (!rolEditar) return;

    try {
      const { error } = await supabase
        .from('permisos')
        .update({ permisos: rolEditar.permisos })
        .eq('id_permiso', rolEditar.id_permiso);

      if (error) throw error;

      await cargarRoles();
      setMostrarModalEdicion(false);
      setToast({
        mostrar: true,
        mensaje: `Permisos de ${rolEditar.rol} actualizados`,
        tipo: 'exito'
      });
    } catch (err) {
      setToast({ mostrar: true, mensaje: 'Error al actualizar permisos', tipo: 'error' });
    }
  };

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col>
          <h3><i className="bi bi-shield-lock-fill me-2"></i>Gestión de Permisos</h3>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)}
            placeholder="Buscar por rol..."
          />
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <>
          {textoBusqueda && rolesFiltrados.length === 0 && (
            <Alert variant="info">No se encontraron roles para "{textoBusqueda}"</Alert>
          )}
          <div className="d-none d-lg-block">
            <TablaPermisos roles={rolesPaginados} abrirModalEdicion={abrirModalEdicion} />
          </div>
          <div className="d-lg-none">
            <TarjetaPermisos roles={rolesPaginados} abrirModalEdicion={abrirModalEdicion} />
          </div>
          <Paginacion
            registrosPorPagina={registrosPorPagina}
            totalRegistros={rolesFiltrados.length}
            paginaActual={paginaActual}
            establecerPaginaActual={setPaginaActual}
            establecerRegistrosPorPagina={setRegistrosPorPagina}
          />
        </>
      )}

      <ModalEdicionPermisos
        mostrar={mostrarModalEdicion}
        setMostrar={setMostrarModalEdicion}
        rolEditar={rolEditar}
        setRolEditar={setRolEditar}
        guardarCambios={actualizarPermisos}
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

export default PermisosView;
