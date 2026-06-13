import React, { useState, useEffect } from "react";
import { Container, Spinner, Modal, Form } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../database/supabaseconfig";
import { Users, UserPlus, Search, Edit, Trash2, Mail, Phone, Pizza, Star, AlertTriangle, ShieldCheck } from "lucide-react";
import NotificacionOperacion from "../components/NotificacionOperacion";
import Paginacion from "../components/Paginacion";

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
  const [nuevoCliente, setNuevoCliente] = useState({ nombre_cliente: "", apellido_cliente: "", celular: "", email: "" });
  const [clienteEditar, setClienteEditar] = useState({ id_cliente: "", nombre_cliente: "", apellido_cliente: "", celular: "", email: "" });
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [stats, setStats] = useState({ total: 0, conEmail: 0, conTelefono: 0 });

  const cargarClientes = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase.from("clientes").select("*").order("nombre_cliente", { ascending: true });
      if (error) throw error;
      
      setClientes(data || []);
      setClientesFiltrados(data || []);
      setStats({
        total: data?.length || 0,
        conEmail: data?.filter(c => c?.email).length || 0,
        conTelefono: data?.filter(c => c?.celular).length || 0
      });
    } catch (err) {
      console.error("Error cargando clientes:", err);
      setToast({ mostrar: true, mensaje: "Error al cargar clientes: " + err.message, tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarClientes(); }, []);

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

  const indexUltimo = paginaActual * registrosPorPagina;
  const indexPrimero = indexUltimo - registrosPorPagina;
  const clientesPaginados = clientesFiltrados.slice(indexPrimero, indexUltimo);

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
        email: nuevoCliente.email
      }]);
      if (error) throw error;
      setToast({ mostrar: true, mensaje: "Cliente agregado exitosamente", tipo: "exito" });
      setMostrarModalRegistro(false);
      setNuevoCliente({ nombre_cliente: "", apellido_cliente: "", celular: "", email: "" });
      cargarClientes();
    } catch (err) { setToast({ mostrar: true, mensaje: err.message, tipo: "error" }); } 
    finally { setProcesando(false); }
  };

  const actualizarCliente = async () => {
    if (!clienteEditar.nombre_cliente.trim() || !clienteEditar.email.trim()) {
      setToast({ mostrar: true, mensaje: "Nombre y email son obligatorios", tipo: "error" });
      return;
    }
    setProcesando(true);
    try {
      const { error } = await supabase.from("clientes").update({
        nombre_cliente: clienteEditar.nombre_cliente,
        apellido_cliente: clienteEditar.apellido_cliente,
        celular: clienteEditar.celular,
        email: clienteEditar.email,
      }).eq("id_cliente", clienteEditar.id_cliente);
      if (error) throw error;
      setToast({ mostrar: true, mensaje: "Cliente actualizado exitosamente", tipo: "exito" });
      setMostrarModalEdicion(false);
      cargarClientes();
    } catch (err) { setToast({ mostrar: true, mensaje: err.message, tipo: "error" }); } 
    finally { setProcesando(false); }
  };

  const eliminarCliente = async () => {
    setProcesando(true);
    try {
      const { error } = await supabase.from("clientes").delete().eq("id_cliente", clienteAEliminar.id_cliente);
      if (error) throw error;
      setToast({ mostrar: true, mensaje: "Cliente eliminado exitosamente", tipo: "exito" });
      setMostrarModalEliminacion(false);
      setClienteAEliminar(null);
      cargarClientes();
    } catch (err) { setToast({ mostrar: true, mensaje: err.message, tipo: "error" }); } 
    finally { setProcesando(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container-fluid py-4">
      {/* Header Premium */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} 
        className="premium-card p-4 mb-4"
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-3 mb-2">
              <div className="bg-danger bg-opacity-10 rounded-circle p-2 shadow-sm">
                <Users size={32} color="#c0392b" />
              </div>
              <h2 className="fw-bold mb-0 text-dark" style={{ fontFamily: "'Pacifico', cursive", letterSpacing: '1px' }}>
                Familia PizzApp
              </h2>
              <span className="badge bg-pizza-gradient rounded-pill px-3 py-2 shadow-sm">
                {stats.total} Clientes
              </span>
            </div>
            <p className="text-muted small mb-0 ps-1">Administra tu comunidad de amantes de la pizza</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="btn btn-pizza-primary shadow-sm d-flex align-items-center gap-2" 
            onClick={() => setMostrarModalRegistro(true)}
          >
            <UserPlus size={18} /> Nuevo Integrante
          </motion.button>
        </div>
      </motion.div>

      {/* Estadísticas Temáticas */}
      <div className="row g-3 mb-4">
        {[
          { title: "Total Clientes", val: stats.total, icon: <Users size={24} />, bg: "rgba(192,57,43,0.1)", color: "#c0392b" },
          { title: "Con Correo", val: stats.conEmail, icon: <Mail size={24} />, bg: "rgba(243,156,18,0.15)", color: "#d68910" },
          { title: "Con Teléfono", val: stats.conTelefono, icon: <Phone size={24} />, bg: "rgba(39,174,96,0.15)", color: "#1e8449" }
        ].map((s, i) => (
          <div className="col-md-4" key={i}>
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
              className="premium-card p-4 d-flex align-items-center gap-3"
            >
              <div className="rounded-circle p-3" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div>
                <h6 className="text-muted small fw-bold mb-1">{s.title}</h6>
                <h3 className="fw-bold mb-0" style={{ color: s.color }}>{s.val}</h3>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Contenedor Principal */}
      <div className="premium-card overflow-hidden mb-4">
        <div className="p-4 border-bottom bg-light bg-opacity-50">
          <div className="position-relative">
            <Search size={18} className="position-absolute top-50 start-3 translate-middle-y text-danger" style={{ left: '16px' }} />
            <input 
              type="text" 
              className="form-control rounded-pill ps-5 py-2 shadow-sm border-0" 
              placeholder="Buscar por nombre, correo o celular..." 
              value={textoBusqueda} 
              onChange={(e) => setTextoBusqueda(e.target.value)} 
              style={{ background: 'rgba(255, 250, 247, 0.9)' }}
            />
          </div>
        </div>

        {cargando ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="danger" />
            <p className="mt-3 text-muted fw-bold">Preparando el horno...</p>
          </div>
        ) : clientes.length === 0 ? (
          <div className="text-center py-5">
            <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex p-4 mb-3">
              <Pizza size={48} color="#c0392b" />
            </div>
            <h4 className="fw-bold text-dark">Aún no hay clientes</h4>
            <p className="text-muted mb-4">¡Agrega a tu primer amante de la pizza!</p>
            <button className="btn btn-pizza-primary" onClick={() => setMostrarModalRegistro(true)}>
              <UserPlus size={16} className="me-2" /> Registrar Cliente
            </button>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ background: 'rgba(192,57,43,0.03)' }}>
                  <tr>
                    <th className="py-3 px-4 border-0 text-muted small fw-bold text-uppercase">Cliente</th>
                    <th className="py-3 px-4 border-0 text-muted small fw-bold text-uppercase">Contacto</th>
                    <th className="py-3 px-4 border-0 text-muted small fw-bold text-uppercase text-center">Registro</th>
                    <th className="py-3 px-4 border-0 text-end"></th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {clientesPaginados.map((cliente, idx) => (
                      <motion.tr 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                        key={cliente.id_cliente} style={{ transition: 'all 0.2s' }}
                      >
                        <td className="py-3 px-4">
                          <div className="d-flex align-items-center gap-3">
                            <div className="user-avatar" style={{ width: 40, height: 40, borderRadius: 12 }}>
                              <span className="avatar-initials" style={{ fontSize: '1rem' }}>
                                {(cliente.nombre_cliente?.[0] || 'U').toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="fw-bold text-dark">{cliente.nombre_cliente} {cliente.apellido_cliente || ""}</div>
                              <span className="badge bg-light text-danger border mt-1" style={{ fontSize: '0.65rem' }}>VIP <Star size={10} className="ms-1 d-inline" /></span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="d-flex flex-column gap-1">
                            <div className="text-muted small d-flex align-items-center gap-2"><Mail size={12} /> {cliente.email || "-"}</div>
                            <div className="text-muted small d-flex align-items-center gap-2"><Phone size={12} /> {cliente.celular || "-"}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="badge rounded-pill bg-success bg-opacity-10 text-success fw-bold px-3 py-2">
                            -
                          </span>
                        </td>
                        <td className="py-3 px-4 text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button 
                              className="btn btn-outline-warning rounded-circle p-2 d-flex align-items-center justify-content-center" 
                              style={{ width: 36, height: 36 }} 
                              onClick={() => { setClienteEditar(cliente); setMostrarModalEdicion(true); }}
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="btn btn-outline-danger rounded-circle p-2 d-flex align-items-center justify-content-center" 
                              style={{ width: 36, height: 36 }} 
                              onClick={() => { setClienteAEliminar(cliente); setMostrarModalEliminacion(true); }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            {clientesFiltrados.length > 0 && (
              <div className="p-3 border-top bg-light bg-opacity-50">
                <Paginacion 
                  registrosPorPagina={registrosPorPagina} 
                  totalRegistros={clientesFiltrados.length} 
                  paginaActual={paginaActual} 
                  establecerPaginaActual={setPaginaActual} 
                  establecerRegistrosPorPagina={setRegistrosPorPagina} 
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modales */}
      <Modal show={mostrarModalRegistro} onHide={() => setMostrarModalRegistro(false)} centered>
        <div className="premium-card border-0 overflow-hidden">
          <Modal.Header className="border-0 pb-0 pt-4 px-4">
            <Modal.Title className="fw-bold d-flex align-items-center gap-2 text-danger">
              <UserPlus size={24} /> Agregar Cliente
            </Modal.Title>
            <button className="btn-close" onClick={() => setMostrarModalRegistro(false)}></button>
          </Modal.Header>
          <Modal.Body className="px-4 py-4">
            <Form>
              <div className="row g-3">
                <div className="col-md-6">
                  <Form.Group><Form.Label className="small fw-bold text-muted">Nombre *</Form.Label><Form.Control type="text" className="rounded-3" value={nuevoCliente.nombre_cliente} onChange={e => setNuevoCliente({...nuevoCliente, nombre_cliente: e.target.value})} /></Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group><Form.Label className="small fw-bold text-muted">Apellido</Form.Label><Form.Control type="text" className="rounded-3" value={nuevoCliente.apellido_cliente} onChange={e => setNuevoCliente({...nuevoCliente, apellido_cliente: e.target.value})} /></Form.Group>
                </div>
                <div className="col-12">
                  <Form.Group><Form.Label className="small fw-bold text-muted">Email *</Form.Label><Form.Control type="email" className="rounded-3" value={nuevoCliente.email} onChange={e => setNuevoCliente({...nuevoCliente, email: e.target.value})} /></Form.Group>
                </div>
                <div className="col-12">
                  <Form.Group><Form.Label className="small fw-bold text-muted">Teléfono Celular</Form.Label><Form.Control type="tel" className="rounded-3" value={nuevoCliente.celular} onChange={e => setNuevoCliente({...nuevoCliente, celular: e.target.value})} /></Form.Group>
                </div>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 px-4 pb-4">
            <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setMostrarModalRegistro(false)}>Cancelar</button>
            <button className="btn btn-pizza-primary" onClick={agregarCliente} disabled={procesando}>{procesando ? "Guardando..." : "Guardar Cliente"}</button>
          </Modal.Footer>
        </div>
      </Modal>

      <Modal show={mostrarModalEdicion} onHide={() => setMostrarModalEdicion(false)} centered>
        <div className="premium-card border-0 overflow-hidden">
          <Modal.Header className="border-0 pb-0 pt-4 px-4">
            <Modal.Title className="fw-bold d-flex align-items-center gap-2 text-warning">
              <Edit size={24} /> Editar Cliente
            </Modal.Title>
            <button className="btn-close" onClick={() => setMostrarModalEdicion(false)}></button>
          </Modal.Header>
          <Modal.Body className="px-4 py-4">
            <Form>
              <div className="row g-3">
                <div className="col-md-6">
                  <Form.Group><Form.Label className="small fw-bold text-muted">Nombre *</Form.Label><Form.Control type="text" className="rounded-3" value={clienteEditar.nombre_cliente} onChange={e => setClienteEditar({...clienteEditar, nombre_cliente: e.target.value})} /></Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group><Form.Label className="small fw-bold text-muted">Apellido</Form.Label><Form.Control type="text" className="rounded-3" value={clienteEditar.apellido_cliente} onChange={e => setClienteEditar({...clienteEditar, apellido_cliente: e.target.value})} /></Form.Group>
                </div>
                <div className="col-12">
                  <Form.Group><Form.Label className="small fw-bold text-muted">Email *</Form.Label><Form.Control type="email" className="rounded-3" value={clienteEditar.email} onChange={e => setClienteEditar({...clienteEditar, email: e.target.value})} /></Form.Group>
                </div>
                <div className="col-12">
                  <Form.Group><Form.Label className="small fw-bold text-muted">Teléfono Celular</Form.Label><Form.Control type="tel" className="rounded-3" value={clienteEditar.celular} onChange={e => setClienteEditar({...clienteEditar, celular: e.target.value})} /></Form.Group>
                </div>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 px-4 pb-4">
            <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setMostrarModalEdicion(false)}>Cancelar</button>
            <button className="btn btn-pizza-secondary" onClick={actualizarCliente} disabled={procesando}>{procesando ? "Actualizando..." : "Actualizar Cliente"}</button>
          </Modal.Footer>
        </div>
      </Modal>

      <Modal show={mostrarModalEliminacion} onHide={() => setMostrarModalEliminacion(false)} centered>
        <div className="premium-card border-0 overflow-hidden">
          <Modal.Header className="bg-danger text-white border-0 p-4">
            <Modal.Title className="fw-bold d-flex align-items-center gap-2">
              <AlertTriangle size={24} /> Confirmar Eliminación
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 text-center">
            <ShieldCheck size={64} className="text-danger mb-3 opacity-75" />
            <h5 className="fw-bold mb-3">¿Eliminar a {clienteAEliminar?.nombre_cliente}?</h5>
            <p className="text-muted">Esta acción eliminará permanentemente al cliente y su historial asociado.</p>
          </Modal.Body>
          <Modal.Footer className="border-0 p-4 bg-light">
            <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setMostrarModalEliminacion(false)}>Cancelar</button>
            <button className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm" onClick={eliminarCliente} disabled={procesando}>{procesando ? "Eliminando..." : "Sí, Eliminar"}</button>
          </Modal.Footer>
        </div>
      </Modal>

      <NotificacionOperacion mostrar={toast.mostrar} mensaje={toast.mensaje} tipo={toast.tipo} onCerrar={() => setToast({ ...toast, mostrar: false })} />
    </motion.div>
  );
};

export default ClientesView;