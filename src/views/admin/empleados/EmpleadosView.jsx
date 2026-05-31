import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { supabase } from '../../../database/supabaseconfig';

import ModalRegistroEmpleado from '../../../components/empleados/ModalRegistroEmpleado';
import ModalEdicionEmpleado from '../../../components/empleados/ModalEdicionEmpleado';
import TablaEmpleados from '../../../components/empleados/TablaEmpleados';
import TarjetaEmpleado from '../../../components/empleados/TarjetaEmpleado';
import NotificacionOperacion from '../../../components/NotificacionOperacion';
import CuadroBusquedas from '../../../components/busquedas/CuadroBusquedas';
import Paginacion from '../../../components/Paginacion';

const EmpleadosView = () => {
  const [empleados, setEmpleados] = useState([]);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre_empleado: '', apellido_empleado: '', celular: '', pin: '', email: '', password: '', tipo_empleado: '',
  });

  const [empleadoEditar, setEmpleadoEditar] = useState({
    id_empleado: '', nombre_empleado: '', apellido_empleado: '', celular: '', pin: '', email: '', tipo_empleado: '',
  });

  const cargarEmpleados = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase.from('empleados').select('*').order('id_empleado', { ascending: true });
      if (error) throw error;
      setEmpleados(data || []);
      setEmpleadosFiltrados(data || []);
    } catch (err) {
      setToast({ mostrar: true, mensaje: 'Error al cargar empleados', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setEmpleadosFiltrados(empleados);
    } else {
      const texto = textoBusqueda.toLowerCase();
      const filtrados = empleados.filter(emp =>
        `${emp.nombre_empleado} ${emp.apellido_empleado} ${emp.email} ${emp.tipo_empleado}`.toLowerCase().includes(texto)
      );
      setEmpleadosFiltrados(filtrados);
    }
    setPaginaActual(1);
  }, [textoBusqueda, empleados]);

  const indiceUltimoRegistro = paginaActual * registrosPorPagina;
  const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
  const empleadosPaginados = empleadosFiltrados.slice(indicePrimerRegistro, indiceUltimoRegistro);

  const agregarEmpleado = async () => {
    if (!nuevoEmpleado.nombre_empleado || !nuevoEmpleado.apellido_empleado || !nuevoEmpleado.email || !nuevoEmpleado.password || !nuevoEmpleado.tipo_empleado) {
      setToast({ mostrar: true, mensaje: 'Nombre, Apellido, Email, Contraseña y Rol son obligatorios', tipo: 'advertencia' });
      return;
    }
    try {
      setMostrarModal(false);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: nuevoEmpleado.email,
        password: nuevoEmpleado.password,
        options: { data: { nombre: nuevoEmpleado.nombre_empleado, apellido: nuevoEmpleado.apellido_empleado } }
      });
      if (authError) throw authError;
      const { error: dbError } = await supabase.from('empleados').insert([{
        nombre_empleado: nuevoEmpleado.nombre_empleado,
        apellido_empleado: nuevoEmpleado.apellido_empleado,
        celular: nuevoEmpleado.celular,
        pin: nuevoEmpleado.pin,
        email: nuevoEmpleado.email,
        tipo_empleado: nuevoEmpleado.tipo_empleado,
      }]);
      if (dbError) throw dbError;
      await cargarEmpleados();
      setNuevoEmpleado({ nombre_empleado: '', apellido_empleado: '', celular: '', pin: '', email: '', password: '', tipo_empleado: '' });
      setToast({ mostrar: true, mensaje: `Empleado registrado`, tipo: 'exito' });
    } catch (err) {
      setToast({ mostrar: true, mensaje: err.message || 'Error al registrar', tipo: 'error' });
    }
  };

  const actualizarEmpleado = async () => {
    if (!empleadoEditar.nombre_empleado || !empleadoEditar.apellido_empleado || !empleadoEditar.tipo_empleado) {
      setToast({ mostrar: true, mensaje: 'Nombre, Apellido y Rol son obligatorios', tipo: 'advertencia' });
      return;
    }
    try {
      setMostrarModalEdicion(false);
      const { error } = await supabase.from('empleados').update({
        nombre_empleado: empleadoEditar.nombre_empleado,
        apellido_empleado: empleadoEditar.apellido_empleado,
        celular: empleadoEditar.celular,
        pin: empleadoEditar.pin,
        tipo_empleado: empleadoEditar.tipo_empleado,
      }).eq('id_empleado', empleadoEditar.id_empleado);
      if (error) throw error;
      await cargarEmpleados();
      setToast({ mostrar: true, mensaje: 'Empleado actualizado', tipo: 'exito' });
    } catch (err) {
      setToast({ mostrar: true, mensaje: 'Error al actualizar', tipo: 'error' });
    }
  };

  const abrirModalEdicion = (empleado) => {
    setEmpleadoEditar({
      id_empleado: empleado.id_empleado,
      nombre_empleado: empleado.nombre_empleado,
      apellido_empleado: empleado.apellido_empleado,
      celular: empleado.celular || '',
      pin: empleado.pin || '',
      email: empleado.email || '',
      tipo_empleado: empleado.tipo_empleado,
    });
    setMostrarModalEdicion(true);
  };

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col><h3><i className="bi-person-badge-fill me-2"></i>Empleados</h3></Col>
        <Col className="text-end"><Button onClick={() => setMostrarModal(true)}>Nuevo Empleado</Button></Col>
      </Row>
      <Row className="mb-4"><Col md={6}><CuadroBusquedas textoBusqueda={textoBusqueda} manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)} placeholder="Buscar..." /></Col></Row>
      {cargando ? <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div> : (
        <>
          {textoBusqueda && empleadosFiltrados.length === 0 && <Alert variant="info">No hay resultados</Alert>}
          {empleadosFiltrados.length > 0 && (
            <>
              <div className="d-none d-lg-block"><TablaEmpleados empleados={empleadosPaginados} abrirModalEdicion={abrirModalEdicion} /></div>
              <div className="d-lg-none"><TarjetaEmpleado empleados={empleadosPaginados} abrirModalEdicion={abrirModalEdicion} /></div>
              <Paginacion
                registrosPorPagina={registrosPorPagina}
                totalRegistros={empleadosFiltrados.length}
                paginaActual={paginaActual}
                establecerPaginaActual={setPaginaActual}
                establecerRegistrosPorPagina={setRegistrosPorPagina}
              />
            </>
          )}
        </>
      )}
      <ModalRegistroEmpleado mostrarModal={mostrarModal} setMostrarModal={setMostrarModal} nuevoEmpleado={nuevoEmpleado} setNuevoEmpleado={setNuevoEmpleado} agregarEmpleado={agregarEmpleado} />
      <ModalEdicionEmpleado mostrarModalEdicion={mostrarModalEdicion} setMostrarModalEdicion={setMostrarModalEdicion} empleadoEditar={empleadoEditar} setEmpleadoEditar={setEmpleadoEditar} actualizarEmpleado={actualizarEmpleado} />
      <NotificacionOperacion mostrar={toast.mostrar} mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={() => setToast({ ...toast, mostrar: false })} />
    </Container>
  );
};

export default EmpleadosView;
