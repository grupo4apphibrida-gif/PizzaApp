import React, { useState, useEffect } from 'react';
import { supabase } from '../../database/supabaseconfig';
import PedidosActivosView from './pedidos/PedidosActivosView';
import HistorialView from './historial/HistorialView';
import { 
  ChefHat, ClipboardList, CheckCircle2, Truck, XCircle, 
  Clock, User, MapPin, Plus, Trash2, Phone, Package
} from 'lucide-react';
import { motion } from 'framer-motion';

const EmployeeDashboard = () => {
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Estados para nuevo pedido manual
  const [nuevoPedidoItems, setNuevoPedidoItems] = useState([]);
  const [nombreCliente, setNombreCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [direccionCliente, setDireccionCliente] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState('retiro');
  const [procesando, setProcesando] = useState(false);

  const normalizeEstado = (estado) => {
    if (!estado) return '';
    return estado.toString().trim().toLowerCase().replace(/\s+/g, '_');
  };

  const activeOrders = pedidos.filter((pedido) => {
    const estado = normalizeEstado(pedido.estado);
    return estado === 'pendiente' || estado === 'en_preparacion';
  });

  useEffect(() => {
    cargarPedidos();
    cargarProductos();

    // Suscripción a cambios en tiempo real
    const subscription = supabase
      .channel('public:pedidos_cocina')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
        cargarPedidos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const cargarPedidos = async () => {
    try {
      setCargando(true);

      const { data: pedidosRaw, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('creado_en', { ascending: false });

      if (error) throw error;

      const { data: productosData } = await supabase.from('productos').select('id, nombre, imagen_url');
      const prodMap = {};
      (productosData || []).forEach(p => { prodMap[p.id] = p; });

      const { data: clientesData } = await supabase.from('clientes').select('email, nombre_cliente');
      const clienteMap = {};
      (clientesData || []).forEach(c => { clienteMap[c.email] = c.nombre_cliente; });

      const pedidosIds = (pedidosRaw || []).map(p => p.id);
      const { data: detallesRaw } = await supabase
        .from('detalle_pedido')
        .select('*')
        .in('pedido_id', pedidosIds);

      const detalleMap = {};
      (detallesRaw || []).forEach(d => {
        if (!detalleMap[d.pedido_id]) detalleMap[d.pedido_id] = [];
        detalleMap[d.pedido_id].push({
          ...d,
          nombre_producto: prodMap[d.producto_id]?.nombre || `Producto ${String(d.producto_id).substring(0, 8)}`,
          imagen_producto: prodMap[d.producto_id]?.imagen_url || null,
        });
      });

      const pedidosEnriquecidos = (pedidosRaw || []).map(p => ({
        ...p,
        nombre_cliente: p.nombre_cliente || clienteMap[p.email_cliente] || p.email_cliente?.split('@')[0] || 'Cliente',
        detalle_pedido: detalleMap[p.id] || [],
      }));

      setProductos(productosData || []);
      setPedidos(pedidosEnriquecidos);
    } catch (err) {
      console.error('Error cargando pedidos:', err);
    } finally {
      setCargando(false);
    }
  };

  const cargarProductos = async () => {
    try {
      const { data } = await supabase.from('productos').select('*').eq('disponible', true).order('nombre');
      setProductos(data || []);
    } catch (err) { console.error(err); }
  };

  const actualizarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from("pedidos")
        .update({ 
          estado: nuevoEstado,
          completado_en: nuevoEstado === 'entregado' ? new Date().toISOString() : null
        })
        .eq("id", pedidoId);

      if (error) throw error;
      
      console.log(`✅ Pedido ${pedidoId} actualizado a: ${nuevoEstado}`);
      await cargarPedidos();
    } catch (err) {
      console.error('Error actualizando pedido:', err);
      alert('Error al actualizar el estado del pedido');
    }
  };

  const agregarProductoAlPedido = (producto) => {
    const existente = nuevoPedidoItems.find(item => item.producto_id === producto.id);
    if (existente) {
      setNuevoPedidoItems(nuevoPedidoItems.map(item => 
        item.producto_id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setNuevoPedidoItems([...nuevoPedidoItems, { 
        producto_id: producto.id, 
        nombre: producto.nombre, 
        precio: producto.precio, 
        cantidad: 1 
      }]);
    }
  };

  const eliminarProductoDelPedido = (productoId) => {
    setNuevoPedidoItems(nuevoPedidoItems.filter(item => item.producto_id !== productoId));
  };

  const actualizarCantidadProducto = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarProductoDelPedido(productoId);
      return;
    }
    setNuevoPedidoItems(nuevoPedidoItems.map(item => 
      item.producto_id === productoId ? { ...item, cantidad: nuevaCantidad } : item
    ));
  };

  const crearPedidoManual = async () => {
    if (nuevoPedidoItems.length === 0) {
      alert('Agrega al menos un producto');
      return;
    }
    if (!nombreCliente.trim()) {
      alert('Ingresa el nombre del cliente');
      return;
    }
    
    setProcesando(true);
    
    try {
      const total = nuevoPedidoItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
      
      const pedidoData = {
        nombre_cliente: nombreCliente,
        email_cliente: null,
        telefono_cliente: telefonoCliente || null,
        total: total,
        estado: "pendiente",
        prioridad: "normal",
        tipo: "cliente",
        tipo_entrega: tipoEntrega,
        direccion_envio: tipoEntrega === "envio" ? direccionCliente : null,
        costo_envio: tipoEntrega === "envio" ? 30 : 0,
        creado_en: new Date().toISOString()
      };

      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos")
        .insert([pedidoData])
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      const detalles = nuevoPedidoItems.map(item => ({
        pedido_id: pedido.id,
        producto_id: String(item.producto_id),
        cantidad: item.cantidad,
        precio: item.precio,
        tamanio: null,
        piezas: null,
        tipo_entrega: tipoEntrega,
        direccion_envio: tipoEntrega === "envio" ? direccionCliente : null,
        es_promocion: false
      }));

      const { error: detalleError } = await supabase
        .from("detalle_pedido")
        .insert(detalles);

      if (detalleError) throw detalleError;

      // Limpiar formulario
      setShowOrderModal(false);
      setNuevoPedidoItems([]);
      setNombreCliente('');
      setTelefonoCliente('');
      setDireccionCliente('');
      setTipoEntrega('retiro');
      
      alert('✅ Pedido registrado con éxito');
      await cargarPedidos();
      
    } catch (err) {
      console.error('Error creando pedido manual:', err);
      alert('Error al crear el pedido manual: ' + err.message);
    } finally {
      setProcesando(false);
    }
  };

  const getStatusIcon = (estado) => {
    const normalized = normalizeEstado(estado);
    switch (normalized) {
      case 'pendiente': return <Clock size={18} />;
      case 'en_preparacion': return <Package size={18} />;
      case 'entregado': return <CheckCircle2 size={18} />;
      case 'cancelado': return <XCircle size={18} />;
      default: return <Clock size={18} />;
    }
  };

  const getStatusColor = (estado) => {
    const normalized = normalizeEstado(estado);
    switch (normalized) {
      case 'pendiente': return 'warning';
      case 'en_preparacion': return 'info';
      case 'entregado': return 'success';
      case 'cancelado': return 'danger';
      default: return 'secondary';
    }
  };

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-danger mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
          <p className="text-muted fw-bold">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 pb-5">
      <div className="container-fluid px-4 px-md-5">
        {/* Encabezado */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="bg-white p-4 rounded-4 shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h2 className="fw-black mb-1 text-dark fs-2">Gestión de Pedidos</h2>
                <p className="text-muted mb-0">Monitor de cocina y entregas</p>
              </div>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-danger rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2"
                  onClick={() => setShowOrderModal(true)}
                >
                  <Plus size={18} />
                  Nuevo Pedido
                </button>
                <span className="badge bg-dark text-white rounded-pill px-4 py-2 fs-6 fw-bold">
                  {activeOrders.length} Activos
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pedidos Activos */}
        <PedidosActivosView 
          orders={activeOrders}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
          onStatusChange={actualizarEstadoPedido}
        />
        
        {/* Historial */}
        <HistorialView 
          orders={pedidos}
          getStatusColor={getStatusColor}
          actualizarEstado={actualizarEstadoPedido}
        />
      </div>

      {/* Modal para nuevo pedido manual */}
      {showOrderModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header bg-danger text-white border-0 p-4">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <Plus size={20} /> Nuevo Pedido Manual
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowOrderModal(false)}></button>
              </div>
              
              <div className="modal-body p-0">
                <div className="row g-0">
                  {/* Columna izquierda: Datos del cliente y productos */}
                  <div className="col-md-7 p-4 border-end">
                    <div className="mb-4">
                      <h6 className="fw-bold text-muted mb-3">📋 Datos del Cliente</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-bold">Nombre *</label>
                          <input type="text" className="form-control" value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} placeholder="Nombre completo" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold">Teléfono</label>
                          <input type="tel" className="form-control" value={telefonoCliente} onChange={(e) => setTelefonoCliente(e.target.value)} placeholder="8888-8888" />
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-bold">Dirección</label>
                          <input type="text" className="form-control" value={direccionCliente} onChange={(e) => setDireccionCliente(e.target.value)} placeholder="Barrio, casa #, referencias..." />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold">Tipo de Entrega</label>
                          <select className="form-select" value={tipoEntrega} onChange={(e) => setTipoEntrega(e.target.value)}>
                            <option value="retiro">Retiro en Tienda</option>
                            <option value="envio">Envío a Domicilio (+C$30)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <h6 className="fw-bold text-muted mb-3">🍕 Seleccionar Productos</h6>
                    <div className="row g-3 overflow-auto" style={{ maxHeight: '350px' }}>
                      {productos.map(producto => (
                        <div key={producto.id} className="col-6 col-md-4">
                          <div className="card border-0 bg-light p-2 rounded-3 cursor-pointer hover-shadow" onClick={() => agregarProductoAlPedido(producto)} style={{ cursor: 'pointer' }}>
                            <img src={producto.imagen_url || 'https://via.placeholder.com/100'} className="rounded-3 mb-2 w-100" style={{ height: 80, objectFit: 'cover' }} alt="" />
                            <h6 className="fw-bold mb-1 small text-truncate">{producto.nombre}</h6>
                            <span className="text-danger fw-bold small">C$ {producto.precio}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Columna derecha: Resumen del pedido */}
                  <div className="col-md-5 p-4 bg-light">
                    <h6 className="fw-bold text-muted mb-3">🛒 Resumen del Pedido</h6>
                    <div className="mb-4 overflow-auto" style={{ maxHeight: '400px' }}>
                      {nuevoPedidoItems.length === 0 ? (
                        <p className="text-center text-muted py-5">Carrito vacío</p>
                      ) : (
                        nuevoPedidoItems.map(item => (
                          <div key={item.producto_id} className="d-flex justify-content-between align-items-center mb-2 bg-white p-2 rounded-3 shadow-sm">
                            <div className="flex-grow-1">
                              <p className="mb-0 fw-bold small">{item.nombre}</p>
                              <div className="d-flex align-items-center gap-2">
                                <small className="text-muted">C$ {item.precio}</small>
                                <div className="d-flex align-items-center gap-1">
                                  <button className="btn btn-sm btn-outline-secondary rounded-circle" style={{ width: 28, height: 28 }} onClick={() => actualizarCantidadProducto(item.producto_id, item.cantidad - 1)}>-</button>
                                  <span className="fw-bold px-2">{item.cantidad}</span>
                                  <button className="btn btn-sm btn-outline-secondary rounded-circle" style={{ width: 28, height: 28 }} onClick={() => actualizarCantidadProducto(item.producto_id, item.cantidad + 1)}>+</button>
                                </div>
                              </div>
                            </div>
                            <button className="btn btn-link text-danger p-0" onClick={() => eliminarProductoDelPedido(item.producto_id)}><Trash2 size={16} /></button>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="pt-3 border-top">
                      <div className="d-flex justify-content-between mb-3">
                        <span className="fw-bold">Total</span>
                        <span className="fw-bold text-danger fs-4">
                          C${nuevoPedidoItems.reduce((acc, i) => acc + (i.precio * i.cantidad), 0).toFixed(2)}
                        </span>
                      </div>
                      <button 
                        className="btn btn-danger w-100 py-3 rounded-3 fw-bold"
                        onClick={crearPedidoManual}
                        disabled={nuevoPedidoItems.length === 0 || !nombreCliente || procesando}
                      >
                        {procesando ? 'Creando pedido...' : 'Confirmar Pedido'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;