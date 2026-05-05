import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, getProducts, createOrder } from '../../services/api';
import { supabase } from '../../database/supabaseconfig';
import Encabezado from '../../components/navegacion/Encabezado';
import PedidosActivosView from './pedidos/PedidosActivosView';
import HistorialView from './historial/HistorialView';
import { 
  ChefHat, ClipboardList, CheckCircle2, Truck, XCircle, 
  Clock, User, MapPin, Plus, Trash2, Phone
} from 'lucide-react';
import { motion } from 'framer-motion';

const EmployeeDashboard = () => {
  // Estados para pedidos y productos
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Estados para nuevo pedido manual
  const [newOrderItems, setNewOrderItems] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryType, setDeliveryType] = useState('mesa'); // mesa, entrega

  // Cargar datos iniciales y suscribirse a cambios en tiempo real
  useEffect(() => {
    fetchOrders();
    fetchProducts();

    // Suscripción a cambios en la tabla de pedidos
    const subscription = supabase
      .channel('public:orders_employee')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, payload => {
        fetchOrders();
      })
      .subscribe();

    // Limpiar suscripción al desmontar
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Obtener pedidos de la base de datos
  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener productos disponibles
  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Actualizar estado de un pedido
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Error al actualizar el estado del pedido.');
    }
  };

  // Agregar producto al pedido manual
  const addToManualOrder = (product) => {
    const existing = newOrderItems.find(item => item.product_id === product.id);
    if (existing) {
      // Si ya existe, aumentar la cantidad
      setNewOrderItems(newOrderItems.map(item => 
        item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      // Si no existe, agregarlo nuevo
      setNewOrderItems([...newOrderItems, { 
        product_id: product.id, 
        name: product.nombre, 
        price: product.precio, 
        quantity: 1 
      }]);
    }
  };

  // Crear pedido manual
  const handleAddManualOrder = async (e) => {
    e.preventDefault();
    if (newOrderItems.length === 0) return alert('Agrega al menos un producto');
    if (!clientName) return alert('Ingresa el nombre del cliente');
    
    try {
      const total = newOrderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const orderData = {
        usuario_id: null,
        nombre_cliente: clientName,
        tipo: deliveryType,
        estado: 'pendiente',
        total: total
      };

      await createOrder(orderData, newOrderItems);
      // Limpiar formulario después de crear el pedido
      setShowOrderModal(false);
      setNewOrderItems([]);
      setClientName('');
      setClientPhone('');
      setClientAddress('');
      setOrderNotes('');
      setDeliveryType('mesa');
      alert('Pedido registrado con éxito');
    } catch (err) {
      console.error('Error creating manual order:', err);
      alert('Error al crear el pedido manual');
    }
  };

  // Obtener ícono según estado del pedido
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendiente': return <Clock size={18} />;
      case 'en preparación': return <ChefHat size={18} />;
      case 'listo': return <CheckCircle2 size={18} />;
      case 'entregado': return <Truck size={18} />;
      default: return <XCircle size={18} />;
    }
  };

  // Obtener color según estado del pedido
  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente': return 'warning';
      case 'en preparación': return 'info';
      case 'listo': return 'success';
      case 'entregado': return 'primary';
      default: return 'secondary';
    }
  };

  // Pantalla de carga
  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="text-center">
        <div className="spinner-border text-pizza-red mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
        <p className="text-muted fw-bold">Cargando pedidos...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Encabezado />
      <div className="container-fluid px-4 px-md-5">
        {/* Encabezado del dashboard */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="bg-white p-4 rounded-4 shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h2 className="fw-black mb-1 text-dark fs-2">Gestión de Pedidos</h2>
                <p className="text-muted mb-0">Monitor de cocina y entregas</p>
              </div>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-pizza-primary rounded-pill px-4 py-2 fw-bold text-uppercase x-small shadow-sm d-flex align-items-center gap-2"
                  onClick={() => setShowOrderModal(true)}
                >
                  <Plus size={18} />
                  Nuevo Pedido
                </button>
                <span className="badge bg-dark text-white rounded-pill px-4 py-2 fs-6 fw-bold d-flex align-items-center">
                  {orders.filter(o => !['entregado', 'cancelado'].includes(o.status)).length} Activos
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subvistas de pedidos */}
        <PedidosActivosView 
          orders={orders}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
          onStatusChange={handleStatusChange}
        />
        
        <HistorialView 
          orders={orders}
          getStatusColor={getStatusColor}
        />
      </div>

      {/* Modal para nuevo pedido manual */}
      {showOrderModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header bg-pizza-gradient text-white border-0 p-4">
                <h5 className="modal-title fw-black d-flex align-items-center gap-2">
                  <Plus /> Nuevo Pedido Manual
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowOrderModal(false)}></button>
              </div>
              <div className="modal-body p-0">
                <div className="row g-0">
                  {/* Columna izquierda: Datos del cliente y productos */}
                  <div className="col-md-7 p-4 border-end">
                    {/* Formulario de datos del cliente */}
                    <div className="mb-4">
                      <h6 className="fw-bold text-muted text-uppercase x-small mb-3">Datos del Cliente</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-bold">Nombre *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="Nombre completo"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold">Teléfono</label>
                          <input 
                            type="tel" 
                            className="form-control" 
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            placeholder="8888-8888"
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-bold">Dirección</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={clientAddress}
                            onChange={(e) => setClientAddress(e.target.value)}
                            placeholder="Barrio, casa #, referencias..."
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold">Tipo de Pedido</label>
                          <select 
                            className="form-select"
                            value={deliveryType}
                            onChange={(e) => setDeliveryType(e.target.value)}
                          >
                            <option value="mesa">Para Mesa</option>
                            <option value="entrega">Entrega a Domicilio</option>
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-bold">Notas</label>
                          <textarea 
                            className="form-control" 
                            rows={2}
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            placeholder="Sin cebolla, extra queso, etc..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Selección de productos */}
                    <h6 className="fw-bold text-muted text-uppercase x-small mb-3">Seleccionar Productos</h6>
                    <div className="row g-3 overflow-auto" style={{ maxHeight: '300px' }}>
                      {products.map(product => (
                        <div key={product.id} className="col-6">
                          <div 
                            className="card border-0 bg-light p-3 rounded-4 cursor-pointer hover-shadow transition-all"
                            onClick={() => addToManualOrder(product)}
                          >
                            <img src={product.imagen_url || 'https://via.placeholder.com/100'} className="rounded-3 mb-2 w-100" style={{ height: 80, objectFit: 'cover' }} alt="" />
                            <h6 className="fw-bold mb-1 small">{product.nombre}</h6>
                            <span className="text-pizza-red fw-black small">C${product.precio}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Columna derecha: Resumen del pedido */}
                  <div className="col-md-5 p-4 bg-light">
                    <h6 className="fw-bold text-muted text-uppercase x-small mb-3">Detalle del Pedido</h6>
                    <div className="mb-4 overflow-auto" style={{ maxHeight: '400px' }}>
                      {newOrderItems.map(item => (
                        <div key={item.product_id} className="d-flex justify-content-between align-items-center mb-3 bg-white p-3 rounded-3 shadow-sm">
                          <div className="flex-1">
                            <p className="mb-0 fw-bold small">{item.name}</p>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-muted">C${item.price}</small>
                              <div className="d-flex align-items-center gap-1">
                                <button 
                                  className="btn btn-sm btn-outline-secondary rounded-circle"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (item.quantity > 1) {
                                      setNewOrderItems(newOrderItems.map(i => 
                                        i.product_id === item.product_id ? { ...i, quantity: i.quantity - 1 } : i
                                      ));
                                    }
                                  }}
                                >
                                  -
                                </button>
                                <span className="fw-bold px-2">{item.quantity}</span>
                                <button 
                                  className="btn btn-sm btn-outline-secondary rounded-circle"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNewOrderItems(newOrderItems.map(i => 
                                      i.product_id === item.product_id ? { ...i, quantity: i.quantity + 1 } : i
                                    ));
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          <button 
                            className="btn btn-link text-danger p-0 ms-2"
                            onClick={() => setNewOrderItems(newOrderItems.filter(i => i.product_id !== item.product_id))}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {newOrderItems.length === 0 && <p className="text-center text-muted py-5">Carrito vacío</p>}
                    </div>
                    <div className="pt-3 border-top">
                      <div className="d-flex justify-content-between mb-3">
                        <span className="fw-bold">Total</span>
                        <span className="fw-black text-pizza-red fs-4">
                          C${newOrderItems.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}
                        </span>
                      </div>
                      <button 
                        className="btn btn-pizza-primary w-100 py-3 rounded-3 fw-bold shadow-lg"
                        onClick={handleAddManualOrder}
                        disabled={newOrderItems.length === 0 || !clientName}
                      >
                        Confirmar Pedido
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
