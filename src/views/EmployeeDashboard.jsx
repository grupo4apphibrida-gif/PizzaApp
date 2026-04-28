import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, getProducts, createOrder } from '../services/api';
import { supabase } from '../database/supabaseconfig';
import Encabezado from '../components/navegacion/Encabezado';
import { 
  ChefHat, ClipboardList, CheckCircle2, Truck, XCircle, 
  Clock, User, MapPin, Plus, Package, ShoppingCart, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EmployeeDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // New Order states
  const [newOrderItems, setNewOrderItems] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchProducts();

    const subscription = supabase
      .channel('public:orders_employee')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

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

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Error al actualizar el estado del pedido.');
    }
  };

  const handleAddManualOrder = async (e) => {
    e.preventDefault();
    if (newOrderItems.length === 0) return alert('Agrega al menos un producto');
    
    try {
      const total = newOrderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const orderData = {
        user_id: null, // Pedido manual sin usuario registrado o anónimo
        status: 'pendiente',
        total: total
      };

      await createOrder(orderData, newOrderItems);
      setShowOrderModal(false);
      setNewOrderItems([]);
      setClientName('');
      alert('Pedido registrado con éxito');
    } catch (err) {
      console.error('Error creating manual order:', err);
      alert('Error al crear el pedido manual');
    }
  };

  const addToManualOrder = (product) => {
    const existing = newOrderItems.find(item => item.product_id === product.id);
    if (existing) {
      setNewOrderItems(newOrderItems.map(item => 
        item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setNewOrderItems([...newOrderItems, { 
        product_id: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: 1 
      }]);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendiente': return <Clock size={18} />;
      case 'en preparación': return <ChefHat size={18} />;
      case 'listo': return <CheckCircle2 size={18} />;
      case 'entregado': return <Truck size={18} />;
      default: return <XCircle size={18} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente': return 'warning';
      case 'en preparación': return 'info';
      case 'listo': return 'success';
      case 'entregado': return 'primary';
      default: return 'secondary';
    }
  };

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
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="bg-white p-4 rounded-4 shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h2 className="fw-black mb-1 text-dark fs-2">Gestión de Pedidos</h2>
                <p className="text-muted mb-0">Monitor de cocina y entregas en tiempo real</p>
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

        <div className="row row-cols-1 row-cols-lg-2 row-cols-xl-3 g-4">
          <AnimatePresence>
            {orders.filter(o => !['entregado', 'cancelado'].includes(o.status)).map(order => (
              <motion.div 
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="col"
              >
                <div className="card h-100 premium-card border-0 shadow-sm overflow-hidden rounded-4">
                  <div className={`card-header p-4 border-0 d-flex justify-content-between align-items-center bg-${getStatusColor(order.status)} bg-opacity-10`}>
                    <h6 className="mb-0 fw-black text-dark">#{order.id.slice(0, 8)}</h6>
                    <span className={`badge bg-${getStatusColor(order.status)} text-white rounded-pill px-3 py-2 fw-bold text-uppercase x-small shadow-sm d-flex align-items-center gap-1`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                  <div className="card-body p-4">
                    <div className="mb-4 d-flex align-items-center gap-3">
                      <div className="bg-light rounded-circle p-2 text-muted fs-4">
                        <User size={24} />
                      </div>
                      <div>
                        <p className="mb-0 fw-bold text-dark">{order.users?.name || 'Cliente Manual'}</p>
                        <small className="text-muted d-flex align-items-center gap-1">
                          <Clock size={12} />
                          {new Date(order.created_at).toLocaleTimeString()}
                        </small>
                      </div>
                    </div>
                    
                    <div className="mb-4 bg-light rounded-4 p-4">
                      <h6 className="fw-bold text-muted text-uppercase x-small mb-3 tracking-widest">Items</h6>
                      {order.order_items.map(item => (
                        <div key={item.id} className="d-flex justify-content-between mb-2">
                          <span className="text-dark fw-bold">{item.products.name} <span className="text-pizza-red">x{item.quantity}</span></span>
                          <span className="text-muted small">C${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="d-flex justify-content-between mt-3 pt-3 border-top border-white">
                        <span className="fw-black text-dark">TOTAL</span>
                        <span className="fw-black text-pizza-red fs-5">C${order.total}</span>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      {order.status === 'pendiente' && (
                        <button 
                          className="btn btn-warning w-100 rounded-pill py-2 fw-bold text-uppercase x-small"
                          onClick={() => handleStatusChange(order.id, 'en preparación')}
                        >
                          Preparar
                        </button>
                      )}
                      {order.status === 'en preparación' && (
                        <button 
                          className="btn btn-info w-100 rounded-pill py-2 fw-bold text-white text-uppercase x-small"
                          onClick={() => handleStatusChange(order.id, 'listo')}
                        >
                          Listo
                        </button>
                      )}
                      {order.status === 'listo' && (
                        <button 
                          className="btn btn-success w-100 rounded-pill py-2 fw-bold text-uppercase x-small"
                          onClick={() => handleStatusChange(order.id, 'entregado')}
                        >
                          Entregar
                        </button>
                      )}
                      <button 
                        className="btn btn-outline-danger rounded-pill px-3"
                        onClick={() => handleStatusChange(order.id, 'cancelado')}
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Historial Reciente */}
        <div className="row mt-5 g-4">
          <div className="col-12">
            <div className="bg-white p-4 rounded-4 shadow-sm">
              <h3 className="fw-black mb-4 text-dark fs-4 d-flex align-items-center gap-2">
                <ClipboardList size={24} className="text-pizza-red" />
                Historial de Hoy
              </h3>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="bg-light text-muted x-small text-uppercase fw-bold tracking-widest border-0">
                    <tr>
                      <th className="py-3 border-0 px-4">Pedido</th>
                      <th className="py-3 border-0 px-4">Cliente</th>
                      <th className="py-3 border-0 px-4 text-center">Estado</th>
                      <th className="py-3 border-0 px-4 text-end">Total</th>
                      <th className="py-3 border-0 px-4 text-end">Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter(o => ['entregado', 'cancelado'].includes(o.status)).slice(0, 10).map(order => (
                      <tr key={order.id}>
                        <td className="py-4 px-4 fw-bold">#{order.id.slice(0, 8)}</td>
                        <td className="py-4 px-4 text-muted">{order.users?.name || 'Cliente Manual'}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`badge rounded-pill px-3 py-2 text-uppercase x-small shadow-sm bg-${getStatusColor(order.status)} bg-opacity-10 text-${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-end fw-black text-pizza-red">C${order.total}</td>
                        <td className="py-4 px-4 text-end text-muted small">{new Date(order.created_at).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Order Modal */}
      {showOrderModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header bg-pizza-gradient text-white border-0 p-4">
                <h5 className="modal-title fw-black d-flex align-items-center gap-2">
                  <Plus /> Nuevo Pedido Manual
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowOrderModal(false)}></button>
              </div>
              <div className="modal-body p-0">
                <div className="row g-0">
                  <div className="col-md-7 p-4 border-end">
                    <h6 className="fw-bold text-muted text-uppercase x-small mb-3">Seleccionar Productos</h6>
                    <div className="row g-3 overflow-auto" style={{ maxHeight: '400px' }}>
                      {products.map(product => (
                        <div key={product.id} className="col-6">
                          <div 
                            className="card border-0 bg-light p-3 rounded-4 cursor-pointer hover-shadow transition-all"
                            onClick={() => addToManualOrder(product)}
                          >
                            <img src={product.image_url || 'https://via.placeholder.com/100'} className="rounded-3 mb-2 w-100" style={{ height: 80, objectFit: 'cover' }} alt="" />
                            <h6 className="fw-bold mb-1 small">{product.name}</h6>
                            <span className="text-pizza-red fw-black small">C${product.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-md-5 p-4 bg-light">
                    <h6 className="fw-bold text-muted text-uppercase x-small mb-3">Detalle del Pedido</h6>
                    <div className="mb-4 overflow-auto" style={{ maxHeight: '300px' }}>
                      {newOrderItems.map(item => (
                        <div key={item.product_id} className="d-flex justify-content-between align-items-center mb-3 bg-white p-2 rounded-3 shadow-sm">
                          <div>
                            <p className="mb-0 fw-bold small">{item.name}</p>
                            <small className="text-muted">C${item.price} x{item.quantity}</small>
                          </div>
                          <button className="btn btn-link text-danger p-0" onClick={() => setNewOrderItems(newOrderItems.filter(i => i.product_id !== item.product_id))}>
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
                        disabled={newOrderItems.length === 0}
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

