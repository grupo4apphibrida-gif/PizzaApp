import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { supabase } from '../../../database/supabaseconfig';
import { 
  Star, MessageCircle, CheckCircle, XCircle, Reply, Trash2, 
  Edit, Eye, EyeOff, Search, Filter, Plus, User, Calendar,
  Send, MessageSquare, Award
} from 'lucide-react';
import StarsRating from '../../../components/calificaciones/StarsRating';

const AdminCalificaciones = () => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [calificacionesFiltradas, setCalificacionesFiltradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [filtroPuntuacion, setFiltroPuntuacion] = useState('todos');
  const [filtroVisible, setFiltroVisible] = useState('todos');
  
  // Modales
  const [mostrarModalRespuesta, setMostrarModalRespuesta] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalCreacion, setMostrarModalCreacion] = useState(false);
  const [calificacionSeleccionada, setCalificacionSeleccionada] = useState(null);
  
  // Estados para respuestas y edición
  const [respuesta, setRespuesta] = useState('');
  const [calificacionEditada, setCalificacionEditada] = useState({
    puntuacion: 0,
    titulo: '',
    comentario: ''
  });
  
  // Estado para nueva calificación (admin)
  const [nuevaCalificacion, setNuevaCalificacion] = useState({
    producto_id: '',
    usuario_email: '',
    puntuacion: 5,
    titulo: '',
    comentario: '',
    visible: true
  });
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarCalificaciones();
    cargarProductos();
    cargarUsuarios();
  }, []);

  useEffect(() => {
    filtrarCalificaciones();
  }, [textoBusqueda, filtroPuntuacion, filtroVisible, calificaciones]);

  const cargarCalificaciones = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("calificaciones")
        .select("*")
        .order("fecha_creacion", { ascending: false });

      if (error) throw error;
      setCalificaciones(data || []);
      setCalificacionesFiltradas(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCargando(false);
    }
  };

  const cargarProductos = async () => {
    try {
      const { data, error } = await supabase
        .from("productos")
        .select("id, nombre")
        .eq("disponible", true);
      
      if (!error && data) setProductos(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("email, nombre_cliente");
      
      if (!error && data) setUsuarios(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  const filtrarCalificaciones = () => {
    let filtradas = [...calificaciones];
    
    // Búsqueda por texto
    if (textoBusqueda) {
      const texto = textoBusqueda.toLowerCase();
      filtradas = filtradas.filter(c => 
        c.comentario?.toLowerCase().includes(texto) ||
        c.titulo?.toLowerCase().includes(texto) ||
        c.producto_id?.toLowerCase().includes(texto)
      );
    }
    
    // Filtro por puntuación
    if (filtroPuntuacion !== 'todos') {
      filtradas = filtradas.filter(c => c.puntuacion === parseInt(filtroPuntuacion));
    }
    
    // Filtro por visibilidad
    if (filtroVisible !== 'todos') {
      filtradas = filtradas.filter(c => c.visible === (filtroVisible === 'visible'));
    }
    
    setCalificacionesFiltradas(filtradas);
  };

  const toggleVisibilidad = async (id, visible) => {
    try {
      const { error } = await supabase
        .from("calificaciones")
        .update({ visible: !visible })
        .eq("id", id);

      if (error) throw error;
      await cargarCalificaciones();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const eliminarCalificacion = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta calificación?")) return;
    
    try {
      const { error } = await supabase
        .from("calificaciones")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await cargarCalificaciones();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const responderCalificacion = async () => {
    if (!respuesta.trim()) {
      alert("Ingresa una respuesta");
      return;
    }

    setEnviando(true);
    try {
      const { error } = await supabase
        .from("calificaciones")
        .update({
          respuesta_administrador: respuesta,
          respuesta_fecha: new Date().toISOString()
        })
        .eq("id", calificacionSeleccionada.id);

      if (error) throw error;
      
      setMostrarModalRespuesta(false);
      setRespuesta('');
      await cargarCalificaciones();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setEnviando(false);
    }
  };

  const editarCalificacion = async () => {
    setEnviando(true);
    try {
      const { error } = await supabase
        .from("calificaciones")
        .update({
          puntuacion: calificacionEditada.puntuacion,
          titulo: calificacionEditada.titulo,
          comentario: calificacionEditada.comentario,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq("id", calificacionSeleccionada.id);

      if (error) throw error;
      
      setMostrarModalEdicion(false);
      await cargarCalificaciones();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setEnviando(false);
    }
  };

  const crearCalificacionAdmin = async () => {
    if (!nuevaCalificacion.producto_id) {
      alert("Selecciona un producto");
      return;
    }
    if (!nuevaCalificacion.usuario_email) {
      alert("Selecciona un usuario o ingresa un email");
      return;
    }

    setEnviando(true);
    try {
      const { error } = await supabase
        .from("calificaciones")
        .insert([{
          producto_id: nuevaCalificacion.producto_id,
          puntuacion: nuevaCalificacion.puntuacion,
          titulo: nuevaCalificacion.titulo || null,
          comentario: nuevaCalificacion.comentario || null,
          visible: nuevaCalificacion.visible,
          usuario_id: null,
          creado_en: new Date().toISOString()
        }]);

      if (error) throw error;
      
      setMostrarModalCreacion(false);
      setNuevaCalificacion({
        producto_id: '',
        usuario_email: '',
        puntuacion: 5,
        titulo: '',
        comentario: '',
        visible: true
      });
      await cargarCalificaciones();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setEnviando(false);
    }
  };

  const obtenerNombreProducto = (productoId) => {
    const producto = productos.find(p => p.id === productoId);
    return producto ? producto.nombre : productoId?.substring(0, 8);
  };

  const obtenerUsuarioPorEmail = (email) => {
    const usuario = usuarios.find(u => u.email === email);
    return usuario ? usuario.nombre_cliente : email?.split('@')[0];
  };

  const estadisticas = {
    total: calificaciones.length,
    promedio: calificaciones.reduce((sum, c) => sum + c.puntuacion, 0) / (calificaciones.length || 1),
    conRespuesta: calificaciones.filter(c => c.respuesta_administrador).length,
    visibles: calificaciones.filter(c => c.visible).length
  };

  if (cargando) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="danger" size="lg" />
      </div>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <MessageCircle size={28} color="#dc3545" />
            Gestión de Calificaciones
          </h2>
          <p className="text-muted mb-0">Administra las reseñas y calificaciones de los productos</p>
        </div>
        <Button 
          variant="danger" 
          className="rounded-pill px-4 py-2 d-flex align-items-center gap-2"
          onClick={() => setMostrarModalCreacion(true)}
        >
          <Plus size={18} />
          Nueva Calificación
        </Button>
      </div>

      {/* Estadísticas */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <div className="bg-white p-3 rounded-4 shadow-sm text-center">
            <h6 className="text-muted small mb-1">Total Reseñas</h6>
            <h3 className="fw-bold mb-0 text-primary">{estadisticas.total}</h3>
          </div>
        </Col>
        <Col md={3}>
          <div className="bg-white p-3 rounded-4 shadow-sm text-center">
            <h6 className="text-muted small mb-1">Promedio General</h6>
            <h3 className="fw-bold mb-0 text-warning">{estadisticas.promedio.toFixed(1)} ★</h3>
          </div>
        </Col>
        <Col md={3}>
          <div className="bg-white p-3 rounded-4 shadow-sm text-center">
            <h6 className="text-muted small mb-1">Con Respuesta</h6>
            <h3 className="fw-bold mb-0 text-success">{estadisticas.conRespuesta}</h3>
          </div>
        </Col>
        <Col md={3}>
          <div className="bg-white p-3 rounded-4 shadow-sm text-center">
            <h6 className="text-muted small mb-1">Visibles</h6>
            <h3 className="fw-bold mb-0 text-info">{estadisticas.visibles}</h3>
          </div>
        </Col>
      </Row>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-4 shadow-sm mb-4">
        <Row className="g-3 align-items-end">
          <Col md={4}>
            <Form.Group>
              <Form.Label className="fw-bold small text-muted">
                <Search size={14} className="me-1" /> Buscar
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Buscar por producto, comentario..."
                value={textoBusqueda}
                onChange={(e) => setTextoBusqueda(e.target.value)}
                className="rounded-3"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold small text-muted">
                <Star size={14} className="me-1" /> Puntuación
              </Form.Label>
              <Form.Select
                value={filtroPuntuacion}
                onChange={(e) => setFiltroPuntuacion(e.target.value)}
                className="rounded-3"
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
          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold small text-muted">
                <Eye size={14} className="me-1" /> Estado
              </Form.Label>
              <Form.Select
                value={filtroVisible}
                onChange={(e) => setFiltroVisible(e.target.value)}
                className="rounded-3"
              >
                <option value="todos">Todos</option>
                <option value="visible">Visibles</option>
                <option value="oculto">Ocultos</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Button 
              variant="outline-secondary" 
              className="w-100 rounded-pill"
              onClick={() => {
                setTextoBusqueda('');
                setFiltroPuntuacion('todos');
                setFiltroVisible('todos');
              }}
            >
              <Filter size={14} className="me-1" /> Limpiar
            </Button>
          </Col>
        </Row>
      </div>

      {/* Lista de calificaciones */}
      <Row className="g-4">
        {calificacionesFiltradas.length === 0 ? (
          <Col xs={12}>
            <Card className="text-center py-5 border-0 shadow-sm">
              <Card.Body>
                <MessageCircle size={48} className="text-muted mb-3 opacity-50" />
                <h5>No hay calificaciones</h5>
                <p className="text-muted">No se encontraron calificaciones con los filtros seleccionados</p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          calificacionesFiltradas.map((cal, idx) => (
            <Col key={cal.id} xs={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`border-0 shadow-sm ${!cal.visible ? 'opacity-75' : ''}`} style={{ borderRadius: '20px' }}>
                  <Card.Body className="p-4">
                    {/* Header de la calificación */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <StarsRating rating={cal.puntuacion} readonly={true} size={18} />
                          <span className="fw-bold text-warning">{cal.puntuacion}.0</span>
                        </div>
                        <h6 className="mb-1 fw-bold">{obtenerNombreProducto(cal.producto_id)}</h6>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-muted d-flex align-items-center gap-1">
                            <User size={12} /> {obtenerUsuarioPorEmail(cal.usuario_email || 'Anónimo')}
                          </small>
                          <small className="text-muted d-flex align-items-center gap-1">
                            <Calendar size={12} /> {new Date(cal.fecha_creacion).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          variant={cal.visible ? "outline-success" : "outline-secondary"}
                          size="sm"
                          className="rounded-circle"
                          style={{ width: 36, height: 36 }}
                          onClick={() => toggleVisibilidad(cal.id, cal.visible)}
                          title={cal.visible ? "Ocultar" : "Mostrar"}
                        >
                          {cal.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="rounded-circle"
                          style={{ width: 36, height: 36 }}
                          onClick={() => {
                            setCalificacionSeleccionada(cal);
                            setCalificacionEditada({
                              puntuacion: cal.puntuacion,
                              titulo: cal.titulo || '',
                              comentario: cal.comentario || ''
                            });
                            setMostrarModalEdicion(true);
                          }}
                          title="Editar"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="rounded-circle"
                          style={{ width: 36, height: 36 }}
                          onClick={() => eliminarCalificacion(cal.id)}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>

                    {/* Título y comentario */}
                    {cal.titulo && <h6 className="fw-bold mb-1">"{cal.titulo}"</h6>}
                    <p className="text-muted mb-3">{cal.comentario || "Sin comentario"}</p>

                    {/* Respuesta del administrador */}
                    {cal.respuesta_administrador ? (
                      <div className="bg-light p-3 rounded-3 mt-2">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <Reply size={14} className="text-primary" />
                          <strong className="small">Respuesta del administrador</strong>
                        </div>
                        <p className="mb-1 small">{cal.respuesta_administrador}</p>
                        <small className="text-muted">
                          {new Date(cal.respuesta_fecha).toLocaleString()}
                        </small>
                      </div>
                    ) : (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="rounded-pill mt-2"
                        onClick={() => {
                          setCalificacionSeleccionada(cal);
                          setRespuesta('');
                          setMostrarModalRespuesta(true);
                        }}
                      >
                        <Reply size={14} className="me-1" /> Responder
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))
        )}
      </Row>

      {/* Modal de Respuesta */}
      <Modal show={mostrarModalRespuesta} onHide={() => setMostrarModalRespuesta(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><Reply size={18} className="me-2" /> Responder a la calificación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Tu respuesta</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              placeholder="Escribe tu respuesta al cliente..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModalRespuesta(false)}>Cancelar</Button>
          <Button variant="primary" onClick={responderCalificacion} disabled={enviando}>
            {enviando ? "Enviando..." : "Responder"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Edición */}
      <Modal show={mostrarModalEdicion} onHide={() => setMostrarModalEdicion(false)} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title><Edit size={18} className="me-2" /> Editar Calificación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <div className="text-center mb-3">
              <label className="fw-bold mb-2">Puntuación</label>
              <StarsRating 
                rating={calificacionEditada.puntuacion} 
                onRatingChange={(val) => setCalificacionEditada({...calificacionEditada, puntuacion: val})} 
                size={28}
              />
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                value={calificacionEditada.titulo}
                onChange={(e) => setCalificacionEditada({...calificacionEditada, titulo: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Comentario</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={calificacionEditada.comentario}
                onChange={(e) => setCalificacionEditada({...calificacionEditada, comentario: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModalEdicion(false)}>Cancelar</Button>
          <Button variant="primary" onClick={editarCalificacion} disabled={enviando}>
            {enviando ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Creación de Calificación (Admin) */}
      <Modal show={mostrarModalCreacion} onHide={() => setMostrarModalCreacion(false)} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title><Award size={18} className="me-2" /> Nueva Calificación (Admin)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Producto *</Form.Label>
              <Form.Select
                value={nuevaCalificacion.producto_id}
                onChange={(e) => setNuevaCalificacion({...nuevaCalificacion, producto_id: e.target.value})}
              >
                <option value="">Seleccione un producto...</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="text-center mb-3">
              <label className="fw-bold mb-2">Puntuación</label>
              <StarsRating 
                rating={nuevaCalificacion.puntuacion} 
                onRatingChange={(val) => setNuevaCalificacion({...nuevaCalificacion, puntuacion: val})} 
                size={28}
              />
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                placeholder="Título de la reseña"
                value={nuevaCalificacion.titulo}
                onChange={(e) => setNuevaCalificacion({...nuevaCalificacion, titulo: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Comentario</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Escribe el comentario del cliente..."
                value={nuevaCalificacion.comentario}
                onChange={(e) => setNuevaCalificacion({...nuevaCalificacion, comentario: e.target.value})}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Visible públicamente"
                checked={nuevaCalificacion.visible}
                onChange={(e) => setNuevaCalificacion({...nuevaCalificacion, visible: e.target.checked})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModalCreacion(false)}>Cancelar</Button>
          <Button variant="danger" onClick={crearCalificacionAdmin} disabled={enviando || !nuevaCalificacion.producto_id}>
            {enviando ? "Creando..." : "Crear Calificación"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminCalificaciones;