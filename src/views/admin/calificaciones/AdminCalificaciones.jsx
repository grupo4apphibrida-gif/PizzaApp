import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Spinner, Alert, Modal, InputGroup } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../database/supabaseconfig';
import { Star, Eye, EyeOff, MessageSquare, Trash2, ShieldAlert, CheckCircle, Search, Filter, MessageCircle } from 'lucide-react';
import StarsRating from '../../../components/Calificaciones/StarsRating';

const AdminCalificaciones = () => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  // Estados de Filtros y Búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [filtroPuntuacion, setFiltroPuntuacion] = useState('todos');
  const [filtroVisibilidad, setFiltroVisibilidad] = useState('todos');
  const [filtroRespuesta, setFiltroRespuesta] = useState('todos');

  // Estados para Modal de Respuesta
  const [mostrarModalRespuesta, setMostrarModalRespuesta] = useState(false);
  const [calificacionSeleccionada, setCalificacionSeleccionada] = useState(null);
  const [textoRespuesta, setTextoRespuesta] = useState('');
  const [guardandoRespuesta, setGuardandoRespuesta] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);

      // Cargar calificaciones
      const { data: califData, error: califErr } = await supabase
        .from('calificaciones')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (califErr) throw califErr;

      // Cargar productos
      const { data: prodData, error: prodErr } = await supabase
        .from('productos')
        .select('id, nombre');

      if (prodErr) throw prodErr;

      // Cargar clientes
      const { data: cliData, error: cliErr } = await supabase
        .from('clientes')
        .select('id_cliente, nombre_cliente, apellido_cliente, email');

      if (cliErr) {
        console.error('Error cargando clientes:', cliErr);
      }

      setCalificaciones(califData || []);
      setProductos(prodData || []);
      setClientes(cliData || []);

    } catch (err) {
      console.error('Error cargando datos para administrador:', err);
      setError(err.message || 'Error al cargar calificaciones.');
    } finally {
      setCargando(false);
    }
  };

  const alternarVisibilidad = async (calificacion) => {
    try {
      setError(null);
      setMensajeExito(null);
      const nuevoEstado = !calificacion.visible;

      const { error: patchErr } = await supabase
        .from('calificaciones')
        .update({ visible: nuevoEstado, fecha_actualizacion: new Date().toISOString() })
        .eq('id', calificacion.id);

      if (patchErr) throw patchErr;

      setCalificaciones(prev =>
        prev.map(c => c.id === calificacion.id ? { ...c, visible: nuevoEstado } : c)
      );

      setMensajeExito(`Calificación #${calificacion.id} ahora está ${nuevoEstado ? 'visible' : 'oculta'}.`);
      setTimeout(() => setMensajeExito(null), 3000);

    } catch (err) {
      console.error('Error al cambiar visibilidad:', err);
      setError(err.message || 'No se pudo actualizar la visibilidad.');
    }
  };

  const abrirModalRespuesta = (cal) => {
    setCalificacionSeleccionada(cal);
    setTextoRespuesta(cal.respuesta_administrador || cal.respuesta_admin || cal.respuesta_admini || '');
    setMostrarModalRespuesta(true);
  };

  const guardarRespuestaAdmin = async () => {
    if (!calificacionSeleccionada) return;

    try {
      setGuardandoRespuesta(true);
      setError(null);

      const responsePayload = {
        respuesta_administrador: textoRespuesta.trim() || null,
        respuesta_fecha: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      };

      const { error: patchErr } = await supabase
        .from('calificaciones')
        .update(responsePayload)
        .eq('id', calificacionSeleccionada.id);

      if (patchErr) throw patchErr;

      setCalificaciones(prev =>
        prev.map(c => c.id === calificacionSeleccionada.id ? {
          ...c,
          respuesta_administrador: responsePayload.respuesta_administrador,
          respuesta_fecha: responsePayload.respuesta_fecha
        } : c)
      );

      setMostrarModalRespuesta(false);
      setCalificacionSeleccionada(null);
      setTextoRespuesta('');
      setMensajeExito('Respuesta guardada con éxito.');
      setTimeout(() => setMensajeExito(null), 3000);

    } catch (err) {
      console.error('Error al guardar respuesta:', err);
      setError(err.message || 'No se pudo guardar la respuesta.');
    } finally {
      setGuardandoRespuesta(false);
    }
  };

  const eliminarCalificacion = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar permanentemente esta calificación?')) return;

    try {
      setError(null);
      setMensajeExito(null);

      const { error: deleteErr } = await supabase
        .from('calificaciones')
        .delete()
        .eq('id', id);

      if (deleteErr) throw deleteErr;

      setCalificaciones(prev => prev.filter(c => c.id !== id));
      setMensajeExito('Calificación eliminada con éxito.');
      setTimeout(() => setMensajeExito(null), 3000);

    } catch (err) {
      console.error('Error al eliminar calificación:', err);
      setError(err.message || 'No se pudo eliminar la calificación.');
    }
  };

  const getNombreProducto = (id) => {
    const prod = productos.find(p => String(p.id) === String(id));
    return prod ? prod.nombre : `Producto #${id?.substring(0, 8) || id}`;
  };

  const getNombreUsuario = (usuarioId) => {
    if (!usuarioId) return 'Anónimo';
    if (usuarioId.includes('@')) return usuarioId.split('@')[0];
    const cliente = clientes.find(c => String(c.id_cliente) === String(usuarioId));
    if (cliente) {
      return `${cliente.nombre_cliente} ${cliente.apellido_cliente || ''}`.trim() + ` (${cliente.email})`;
    }
    return `Cliente #${usuarioId}`;
  };

  // Filtrado de calificaciones
  const calificacionesFiltradas = calificaciones.filter(cal => {
    const prodNombre = getNombreProducto(cal.producto_id).toLowerCase();
    const comentario = (cal.comentario || '').toLowerCase();
    const titulo = (cal.titulo || '').toLowerCase();
    const usuario = getNombreUsuario(cal.usuario_id).toLowerCase();
    const textoCompleto = `${prodNombre} ${comentario} ${titulo} ${usuario}`;

    const cumpleBusqueda = textoCompleto.includes(busqueda.toLowerCase());

    const cumplePuntuacion = filtroPuntuacion === 'todos' || String(cal.puntuacion) === filtroPuntuacion;

    const cumpleVisibilidad = filtroVisibilidad === 'todos' ||
      (filtroVisibilidad === 'visible' && cal.visible) ||
      (filtroVisibilidad === 'oculto' && !cal.visible);

    const tieneResp = cal.respuesta_administrador || cal.respuesta_admin || cal.respuesta_admini;
    const cumpleRespuesta = filtroRespuesta === 'todos' ||
      (filtroRespuesta === 'respondido' && tieneResp) ||
      (filtroRespuesta === 'sin_responder' && !tieneResp);

    return cumpleBusqueda && cumplePuntuacion && cumpleVisibilidad && cumpleRespuesta;
  });

  // Estadísticas para cabecera
  const promedioGlobal = calificaciones.length > 0
    ? (calificaciones.reduce((acc, c) => acc + c.puntuacion, 0) / calificaciones.length).toFixed(1)
    : 0;
  
  const pendientesRespuesta = calificaciones.filter(c => !(c.respuesta_administrador || c.respuesta_admin || c.respuesta_admini)).length;
  const ocultasCount = calificaciones.filter(c => !c.visible).length;

  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="danger" />
        <p className="mt-2 text-muted">Cargando panel de calificaciones...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Cabecera */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="bg-danger bg-opacity-10 rounded-circle p-2">
          <MessageCircle size={28} color="#dc3545" />
        </div>
        <div>
          <h2 className="fw-bold mb-0">Moderación de Reseñas y Calificaciones</h2>
          <p className="text-muted mb-0">Revisa, modera y responde a los comentarios de tus clientes.</p>
        </div>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)} className="rounded-3">{error}</Alert>}
      {mensajeExito && <Alert variant="success" dismissible onClose={() => setMensajeExito(null)} className="rounded-3">{mensajeExito}</Alert>}

      {/* Tarjetas de Estadísticas */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={4}>
          <Card className="border-0 shadow-sm text-center p-3" style={{ borderRadius: '20px' }}>
            <Card.Body>
              <h6 className="text-muted text-uppercase mb-2">Promedio General</h6>
              <h2 className="fw-bold text-warning display-5 mb-1">{promedioGlobal} ★</h2>
              <StarsRating rating={Math.round(promedioGlobal)} readonly={true} size={16} />
              <small className="text-muted d-block mt-2">Sobre {calificaciones.length} valoraciones</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className="border-0 shadow-sm text-center p-3" style={{ borderRadius: '20px' }}>
            <Card.Body>
              <h6 className="text-muted text-uppercase mb-2">Sin Responder</h6>
              <h2 className="fw-bold text-danger display-5 mb-1">{pendientesRespuesta}</h2>
              <Badge bg="danger" className="rounded-pill px-3 py-1">Acción Requerida</Badge>
              <small className="text-muted d-block mt-2">Comentarios esperando respuesta</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className="border-0 shadow-sm text-center p-3" style={{ borderRadius: '20px' }}>
            <Card.Body>
              <h6 className="text-muted text-uppercase mb-2">Reseñas Ocultas</h6>
              <h2 className="fw-bold text-secondary display-5 mb-1">{ocultasCount}</h2>
              <Badge bg="secondary" className="rounded-pill px-3 py-1">Inactivas</Badge>
              <small className="text-muted d-block mt-2">No se muestran en el catálogo</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="border-0 shadow-sm mb-4 p-3" style={{ borderRadius: '20px' }}>
        <Card.Body>
          <Row className="g-3">
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label className="fw-bold small">Buscar reseñas</Form.Label>
                <InputGroup className="rounded-pill overflow-hidden border">
                  <InputGroup.Text className="bg-white border-0"><Search size={18} color="#6c757d" /></InputGroup.Text>
                  <Form.Control
                    placeholder="Buscar por producto, comentario, usuario..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="border-0 shadow-none"
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col xs={6} md={2}>
              <Form.Group>
                <Form.Label className="fw-bold small">Puntuación</Form.Label>
                <Form.Select
                  value={filtroPuntuacion}
                  onChange={(e) => setFiltroPuntuacion(e.target.value)}
                  className="rounded-pill"
                >
                  <option value="todos">Todas</option>
                  <option value="5">5 estrellas</option>
                  <option value="4">4 estrellas</option>
                  <option value="3">3 estrellas</option>
                  <option value="2">2 estrellas</option>
                  <option value="1">1 estrella</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={6} md={3}>
              <Form.Group>
                <Form.Label className="fw-bold small">Visibilidad</Form.Label>
                <Form.Select
                  value={filtroVisibilidad}
                  onChange={(e) => setFiltroVisibilidad(e.target.value)}
                  className="rounded-pill"
                >
                  <option value="todos">Todas</option>
                  <option value="visible">Visibles</option>
                  <option value="oculto">Ocultas</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label className="fw-bold small">Estado Respuesta</Form.Label>
                <Form.Select
                  value={filtroRespuesta}
                  onChange={(e) => setFiltroRespuesta(e.target.value)}
                  className="rounded-pill"
                >
                  <option value="todos">Todos</option>
                  <option value="respondido">Respondidos</option>
                  <option value="sin_responder">Sin responder</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de Calificaciones */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '24px', overflow: 'hidden' }}>
        <Card.Body className="p-0">
          <Table responsive hover className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3 border-0">Producto</th>
                <th className="py-3 border-0">Usuario</th>
                <th className="py-3 border-0">Valoración</th>
                <th className="py-3 border-0" style={{ width: '30%' }}>Comentario</th>
                <th className="py-3 border-0">Visibilidad</th>
                <th className="px-4 py-3 border-0 text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {calificacionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    No se encontraron calificaciones con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                calificacionesFiltradas.map((cal) => {
                  const tieneRespuesta = cal.respuesta_administrador || cal.respuesta_admin || cal.respuesta_admini;
                  return (
                    <tr key={cal.id}>
                      <td className="px-4 py-3">
                        <span className="fw-bold text-dark">{getNombreProducto(cal.producto_id)}</span>
                      </td>
                      <td className="py-3">
                        <small className="d-block text-secondary">{getNombreUsuario(cal.usuario_id)}</small>
                        <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                          {cal.fecha_creacion ? new Date(cal.fecha_creacion).toLocaleDateString() : 'N/D'}
                        </small>
                      </td>
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-2">
                          <StarsRating rating={cal.puntuacion} readonly={true} size={14} />
                          <span className="badge bg-warning text-dark font-monospace">{cal.puntuacion}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        {cal.titulo && <strong className="d-block text-dark mb-1">"{cal.titulo}"</strong>}
                        <p className="mb-0 text-muted small text-truncate" style={{ maxWidth: '300px' }} title={cal.comentario}>
                          {cal.comentario || <em>Sin comentario</em>}
                        </p>
                        {tieneRespuesta && (
                          <div className="mt-1 bg-light rounded p-2 border" style={{ fontSize: '0.75rem' }}>
                            <strong className="text-danger">Resp: </strong>
                            <span className="text-dark">{cal.respuesta_administrador || cal.respuesta_admin || cal.respuesta_admini}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        <Badge bg={cal.visible ? 'success' : 'secondary'} className="rounded-pill px-3 py-2">
                          {cal.visible ? 'Visible' : 'Oculto'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <Button
                            variant={cal.visible ? "outline-secondary" : "outline-success"}
                            size="sm"
                            className="rounded-circle p-2"
                            onClick={() => alternarVisibilidad(cal)}
                            title={cal.visible ? "Ocultar en catálogo" : "Hacer visible"}
                          >
                            {cal.visible ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="rounded-circle p-2"
                            onClick={() => abrirModalRespuesta(cal)}
                            title="Responder a cliente"
                          >
                            <MessageSquare size={16} />
                          </Button>
                          <Button
                            variant="outline-dark"
                            size="sm"
                            className="rounded-circle p-2"
                            onClick={() => eliminarCalificacion(cal.id)}
                            title="Eliminar permanentemente"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal para Responder a Calificación */}
      <Modal show={mostrarModalRespuesta} onHide={() => setMostrarModalRespuesta(false)} centered className="calificacion-modal">
        <Modal.Header className="border-0 p-4" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-white rounded-circle p-2">
              <MessageSquare size={24} color="#dc3545" />
            </div>
            <div>
              <Modal.Title className="fw-bold text-white">Responder Calificación</Modal.Title>
              <p className="text-white-50 small mb-0">Escribe una respuesta oficial para el cliente</p>
            </div>
          </div>
          <button onClick={() => setMostrarModalRespuesta(false)} className="btn-close-white" style={{ background: 'rgba(255,255,255,0.2)', border:'none', borderRadius:'12px', width:'36px', height:'36px', color:'white' }}>
            ✕
          </button>
        </Modal.Header>
        <Modal.Body className="p-4">
          {calificacionSeleccionada && (
            <div className="mb-4 bg-light p-3 rounded-3 border">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong className="text-dark">{getNombreProducto(calificacionSeleccionada.producto_id)}</strong>
                <StarsRating rating={calificacionSeleccionada.puntuacion} readonly={true} size={14} />
              </div>
              <small className="d-block text-secondary mb-2">Por: {getNombreUsuario(calificacionSeleccionada.usuario_id)}</small>
              <p className="mb-0 text-muted small">
                {calificacionSeleccionada.comentario ? `"${calificacionSeleccionada.comentario}"` : <em>Sin comentario</em>}
              </p>
            </div>
          )}
          <Form.Group>
            <Form.Label className="fw-bold small">Tu respuesta oficial</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Agradece el comentario o responde a sus dudas..."
              value={textoRespuesta}
              onChange={(e) => setTextoRespuesta(e.target.value)}
              className="rounded-3"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 p-4">
          <Button variant="light" onClick={() => setMostrarModalRespuesta(false)} className="rounded-pill px-4">
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={guardarRespuestaAdmin}
            disabled={guardandoRespuesta}
            className="rounded-pill px-4 fw-bold"
          >
            {guardandoRespuesta ? 'Guardando...' : 'Guardar Respuesta'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminCalificaciones;
