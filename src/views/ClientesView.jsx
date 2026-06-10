import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Spinner, Badge, Modal, Form } from "react-bootstrap";
import { motion } from "framer-motion";
import { supabase } from "../../../PizzaApp/src/database/supabaseconfig";  // ← CORREGIDO
import { Users, UserPlus, Search, Mail, Phone, UserCheck, Edit, Trash2, X, Save, AlertTriangle } from "lucide-react";
import NotificacionOperacion from "../../../PizzaApp/src/components/NotificacionOperacion";  // ← CORREGIDO
import Paginacion from "../../../PizzaApp/src/components/Paginacion";  // ← CORREGIDO

const ClientesView = () => {
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  
  // Modales
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  
  // Estados de formularios
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre_cliente: "",
    apellido_cliente: "",
    celular: "",
    email: "",
  });
  
  const [clienteEditar, setClienteEditar] = useState({
    id_cliente: "",
    nombre_cliente: "",
    apellido_cliente: "",
    celular: "",
    email: "",
  });
  
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [procesando, setProcesando] = useState(false);
  
  const [stats, setStats] = useState({ total: 0, conEmail: 0, conTelefono: 0 });

  // Cargar clientes
  const cargarClientes = async () => {
    try {
      setCargando(true);
      console.log("🔄 Cargando clientes...");
      
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nombre_cliente", { ascending: true });

      if (error) {
        console.error("❌ Error de Supabase:", error);
        throw error;
      }
      
      console.log("✅ Clientes cargados:", data?.length || 0);
      setClientes(data || []);
      setClientesFiltrados(data || []);
      
      const total = data?.length || 0;
      const conEmail = data?.filter(c => c?.email).length || 0;
      const conTelefono = data?.filter(c => c?.celular).length || 0;
      setStats({ total, conEmail, conTelefono });
      
    } catch (err) {
      console.error("Error cargando clientes:", err);
      setToast({ mostrar: true, mensaje: "Error al cargar clientes: " + err.message, tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // Filtrar clientes
  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setClientesFiltrados(clientes);
    } else {
      const texto = textoBusqueda.toLowerCase().trim();
      const filtrados = clientes.filter(c => 
        c.nombre_cliente?.toLowerCase().includes(texto) ||
        c.apellido_cliente?.toLowerCase().includes(texto) ||
        c.email?.toLowerCase().includes(texto) ||
        c.celular?.toLowerCase().includes(texto)
      );
      setClientesFiltrados(filtrados);
    }
    setPaginaActual(1);
  }, [textoBusqueda, clientes]);

  // Paginación
  const indexUltimo = paginaActual * registrosPorPagina;
  const indexPrimero = indexUltimo - registrosPorPagina;
  const clientesPaginados = clientesFiltrados.slice(indexPrimero, indexUltimo);

  // Agregar cliente
  const agregarCliente = async () => {
    if (!nuevoCliente.nombre_cliente.trim() || !nuevoCliente.email.trim()) {
      setToast({ mostrar: true, mensaje: "Nombre y email son obligatorios", tipo: "error" });
      return;
    }
    
    setProcesando(true);
    try {
      const { error } = await supabase.from("clientes").insert([{
        nombre_cliente: nuevoCliente.nombre_cliente,
        apellido_cliente: nuevoCliente.apellido_cliente,
        celular: nuevoCliente.celular,
        email: nuevoCliente.email,
        creado_en: new Date().toISOString()
      }]);
      
      if (error) throw error;
      
      setToast({ mostrar: true, mensaje: "Cliente agregado exitosamente", tipo: "exito" });
      setMostrarModalRegistro(false);
      setNuevoCliente({ nombre_cliente: "", apellido_cliente: "", celular: "", email: "" });
      cargarClientes();
    } catch (err) {
      setToast({ mostrar: true, mensaje: err.message, tipo: "error" });
    } finally {
      setProcesando(false);
    }
  };

  // Actualizar cliente
  const actualizarCliente = async () => {
    if (!clienteEditar.nombre_cliente.trim() || !clienteEditar.email.trim()) {
      setToast({ mostrar: true, mensaje: "Nombre y email son obligatorios", tipo: "error" });
      return;
    }
    
    setProcesando(true);
    try {
      const { error } = await supabase
        .from("clientes")
        .update({
          nombre_cliente: clienteEditar.nombre_cliente,
          apellido_cliente: clienteEditar.apellido_cliente,
          celular: clienteEditar.celular,
          email: clienteEditar.email,
          actualizado_en: new Date().toISOString()
        })
        .eq("id_cliente", clienteEditar.id_cliente);
      
      if (error) throw error;
      
      setToast({ mostrar: true, mensaje: "Cliente actualizado exitosamente", tipo: "exito" });
      setMostrarModalEdicion(false);
      cargarClientes();
    } catch (err) {
      setToast({ mostrar: true, mensaje: err.message, tipo: "error" });
    } finally {
      setProcesando(false);
    }
  };

  // Eliminar cliente
  const eliminarCliente = async () => {
    setProcesando(true);
    try {
      const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id_cliente", clienteAEliminar.id_cliente);
      
      if (error) throw error;
      
      setToast({ mostrar: true, mensaje: "Cliente eliminado exitosamente", tipo: "exito" });
      setMostrarModalEliminacion(false);
      setClienteAEliminar(null);
      cargarClientes();
    } catch (err) {
      setToast({ mostrar: true, mensaje: err.message, tipo: "error" });
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="danger" />
        <p className="mt-2">Cargando clientes...</p>
      </Container>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container-fluid py-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-4 shadow-sm mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-3 mb-2">
              <div className="bg-danger bg-opacity-10 rounded-circle p-2">
                <Users size={28} color="#dc3545" />
              </div>
              <h3 className="fw-bold mb-0">Gestión de Clientes</h3>
              <Badge bg="danger" className="rounded-pill">{stats.total} Clientes</Badge>
            </div>
            <p className="text-muted small mb-0">Administra tus clientes, sus datos y preferencias</p>
          </div>
          <button className="btn btn-danger rounded-pill px-4 py-2 d-flex align-items-center gap-2" onClick={() => setMostrarModalRegistro(true)}>
            <UserPlus size={18} /> Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="bg-white p-3 rounded-4 shadow-sm text-center">
            <h6 className="text-muted small mb-1">Total Clientes</h6>
            <h3 className="fw-bold mb-0 text-danger">{stats.total}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-white p-3 rounded-4 shadow-sm text-center">
            <h6 className="text-muted small mb-1">Con Email</h6>
            <h3 className="fw-bold mb-0 text-primary">{stats.conEmail}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-white p-3 rounded-4 shadow-sm text-center">
            <h6 className="text-muted small mb-1">Con Teléfono</h6>
            <h3 className="fw-bold mb-0 text-success">{stats.conTelefono}</h3>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-4 shadow-sm mb-4">
        <div className="p-4 border-bottom">
          <div className="position-relative">
            <Search size={18} className="position-absolute top-50 start-3 translate-middle-y text-muted" style={{ left: '12px' }} />
            <input 
              type="text" 
              className="form-control rounded-pill ps-5 py-2" 
              placeholder="Buscar por nombre, apellido, email o teléfono..." 
              value={textoBusqueda} 
              onChange={(e) => setTextoBusqueda(e.target.value)} 
            />
          </div>
        </div>

        {/* Tabla de clientes */}
        {clientes.length === 0 ? (
          <div className="text-center py-5">
            <Users size={48} className="text-muted mb-3" />
            <h5>No hay clientes registrados</h5>
            <p className="text-muted">Comienza agregando tu primer cliente</p>
            <button className="btn btn-danger rounded-pill px-4" onClick={() => setMostrarModalRegistro(true)}>
              <UserPlus size={16} className="me-2" /> Agregar Cliente
            </button>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="py-3 px-4">Nombre</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4 text-center">Teléfono</th>
                    <th className="py-3 px-4 text-center">Fecha Registro</th>
                    <th className="py-3 px-4 text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesPaginados.map((cliente) => (
                    <tr key={cliente.id_cliente}>
                      <td className="py-3 px-4 fw-semibold">
                        {cliente.nombre_cliente} {cliente.apellido_cliente || ""}
                      </td>
                      <td className="py-3 px-4">{cliente.email || "-"}</td>
                      <td className="py-3 px-4 text-center">{cliente.celular || "-"}</td>
                      <td className="py-3 px-4 text-center text-muted small">
                        {cliente.creado_en ? new Date(cliente.creado_en).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-3 px-4 text-end">
                        <button 
                          className="btn btn-outline-warning rounded-circle p-2 me-2" 
                          style={{ width: 36, height: 36 }} 
                          onClick={() => {
                            setClienteEditar(cliente);
                            setMostrarModalEdicion(true);
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn btn-outline-danger rounded-circle p-2" 
                          style={{ width: 36, height: 36 }} 
                          onClick={() => {
                            setClienteAEliminar(cliente);
                            setMostrarModalEliminacion(true);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-top">
              <Paginacion 
                registrosPorPagina={registrosPorPagina} 
                totalRegistros={clientesFiltrados.length} 
                paginaActual={paginaActual} 
                establecerPaginaActual={setPaginaActual} 
                establecerRegistrosPorPagina={setRegistrosPorPagina} 
              />
            </div>
          </>
        )}
      </div>

      {/* Modales... (mantén el resto igual) */}
      <Modal show={mostrarModalRegistro} onHide={() => setMostrarModalRegistro(false)} centered>
        <Modal.Header className="bg-danger text-white">
          <Modal.Title><UserPlus size={20} className="me-2" /> Nuevo Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3"><Form.Label>Nombre *</Form.Label><Form.Control type="text" value={nuevoCliente.nombre_cliente} onChange={e => setNuevoCliente({...nuevoCliente, nombre_cliente: e.target.value})} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Apellido</Form.Label><Form.Control type="text" value={nuevoCliente.apellido_cliente} onChange={e => setNuevoCliente({...nuevoCliente, apellido_cliente: e.target.value})} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Email *</Form.Label><Form.Control type="email" value={nuevoCliente.email} onChange={e => setNuevoCliente({...nuevoCliente, email: e.target.value})} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Teléfono</Form.Label><Form.Control type="tel" value={nuevoCliente.celular} onChange={e => setNuevoCliente({...nuevoCliente, celular: e.target.value})} /></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModalRegistro(false)}>Cancelar</Button>
          <Button variant="danger" onClick={agregarCliente} disabled={procesando}>{procesando ? "Guardando..." : "Guardar Cliente"}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={mostrarModalEdicion} onHide={() => setMostrarModalEdicion(false)} centered>
        <Modal.Header className="bg-warning">
          <Modal.Title><Edit size={20} className="me-2" /> Editar Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3"><Form.Label>Nombre *</Form.Label><Form.Control type="text" value={clienteEditar.nombre_cliente} onChange={e => setClienteEditar({...clienteEditar, nombre_cliente: e.target.value})} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Apellido</Form.Label><Form.Control type="text" value={clienteEditar.apellido_cliente} onChange={e => setClienteEditar({...clienteEditar, apellido_cliente: e.target.value})} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Email *</Form.Label><Form.Control type="email" value={clienteEditar.email} onChange={e => setClienteEditar({...clienteEditar, email: e.target.value})} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Teléfono</Form.Label><Form.Control type="tel" value={clienteEditar.celular} onChange={e => setClienteEditar({...clienteEditar, celular: e.target.value})} /></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModalEdicion(false)}>Cancelar</Button>
          <Button variant="warning" onClick={actualizarCliente} disabled={procesando}>{procesando ? "Actualizando..." : "Actualizar Cliente"}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={mostrarModalEliminacion} onHide={() => setMostrarModalEliminacion(false)} centered>
        <Modal.Header className="bg-danger text-white">
          <Modal.Title><AlertTriangle size={20} className="me-2" /> Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas eliminar al cliente <strong>{clienteAEliminar?.nombre_cliente} {clienteAEliminar?.apellido_cliente}</strong>?</p>
          <p className="text-danger small">⚠️ Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModalEliminacion(false)}>Cancelar</Button>
          <Button variant="danger" onClick={eliminarCliente} disabled={procesando}>{procesando ? "Eliminando..." : "Eliminar Cliente"}</Button>
        </Modal.Footer>
      </Modal>

      <NotificacionOperacion mostrar={toast.mostrar} mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={() => setToast({ ...toast, mostrar: false })} />
    </motion.div>
  );
};

export default ClientesView;