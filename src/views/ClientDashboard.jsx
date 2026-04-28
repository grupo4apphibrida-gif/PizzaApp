import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, createOrder } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../database/supabaseconfig';
import Encabezado from '../components/navegacion/Encabezado';
import Chatbot from '../components/Chatbot';
import { 
  Pizza, Beer, Cookie, Plus, ShoppingCart, 
  Trash2, ChevronRight, Clock, MapPin, CheckCircle2, 
  Info, Search, Filter, Minus, Star, Truck, ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ClientDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Customization states
  const [pizzaSize, setPizzaSize] = useState('Mediana');
  const [cheeseBorder, setCheeseBorder] = useState(false);
  const [extraIngredients, setExtraIngredients] = useState([]);

  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    if (profile) {
      fetchOrders();
    }

    const subscription = supabase
      .channel('public:orders_client')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        if (profile) fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [profile]);

  useEffect(() => {
    let filtered = products;
    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  }, [category, searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setPizzaSize('Mediana');
    setCheeseBorder(false);
    setExtraIngredients([]);
    setShowProductModal(true);
  };

  const addToCart = () => {
    const finalPrice = selectedProduct.price + 
      (pizzaSize === 'Grande' ? 100 : pizzaSize === 'Familiar' ? 200 : 0) +
      (cheeseBorder ? 50 : 0) +
      (extraIngredients.length * 30);

    const cartItem = {
      ...selectedProduct,
      id: `${selectedProduct.id}-${pizzaSize}-${cheeseBorder}-${extraIngredients.join(',')}`,
      product_id: selectedProduct.id,
      pizzaSize,
      cheeseBorder,
      extraIngredients,
      price: finalPrice,
      quantity: 1
    };

    const existingIndex = cart.findIndex(item => item.id === cartItem.id);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, cartItem]);
    }
    setShowProductModal(false);
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!profile) {
      if (window.confirm('Para realizar un pedido necesitas iniciar sesión. ¿Deseas ir al login?')) {
        navigate('/login');
      }
      return;
    }
    if (cart.length === 0) return;

    const address = prompt('Ingresa tu dirección de entrega en Juigalpa:');
    if (!address) return;

    try {
      const orderData = {
        user_id: profile.id,
        status: 'pendiente',
        total: total
      };

      const items = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      await createOrder(orderData, items);
      
      alert('¡Pedido realizado con éxito!');
      setCart([]);
      fetchOrders();
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Hubo un error al realizar el pedido.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendiente': return <Clock size={14} />;
      case 'en preparación': return <Pizza size={14} />;
      case 'listo': return <CheckCircle2 size={14} />;
      case 'entregado': return <Truck size={14} />;
      default: return <Info size={14} />;
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="text-center">
        <div className="spinner-border text-pizza-red mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
        <p className="text-muted fw-bold">Horneando el menú...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Encabezado />
      <div className="container-fluid px-4 px-md-5">
        <div className="row g-4">
          {/* Main Content */}
          <div className="col-12 col-lg-8">
            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-4 shadow-sm mb-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="input-group bg-light rounded-pill px-3">
                    <span className="input-group-text bg-transparent border-0 text-muted">
                      <Search size={18} />
                    </span>
                    <input 
                      type="text" 
                      className="form-control bg-transparent border-0 shadow-none py-2" 
                      placeholder="Busca tu pizza favorita..." 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex gap-2 overflow-auto pb-1">
                    {[
                      { id: 'all', label: 'Todos', icon: Filter },
                      { id: 'pizzas', label: 'Pizzas', icon: Pizza },
                      { id: 'bebidas', label: 'Bebidas', icon: Beer },
                      { id: 'postres', label: 'Postres', icon: Cookie },
                      { id: 'extras', label: 'Extras', icon: Plus }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        className={`btn rounded-pill px-4 py-2 fw-bold text-uppercase x-small d-flex align-items-center gap-2 transition-all ${category === cat.id ? 'btn-pizza-primary shadow-sm' : 'btn-light text-muted'}`}
                        onClick={() => setCategory(cat.id)}
                      >
                        <cat.icon size={14} />
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
              <AnimatePresence>
                {filteredProducts.map(product => (
                  <motion.div 
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="col"
                  >
                    <div className="card h-100 premium-card border-0 shadow-sm overflow-hidden group">
                      <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                        <img 
                          src={product.image_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&h=300&auto=format&fit=crop'} 
                          className="w-100 h-100 object-fit-cover transition-transform duration-500 group-hover:scale-110" 
                          alt={product.name} 
                        />
                        <div className="position-absolute top-0 end-0 p-2">
                          <span className="badge bg-white text-dark rounded-pill shadow-sm fw-bold">
                            <Star size={12} className="text-warning me-1 fill-warning" />
                            4.8
                          </span>
                        </div>
                        {!product.is_available && (
                          <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center">
                            <span className="badge bg-danger rounded-pill px-4 py-2 fs-6 fw-bold shadow-lg">Agotado</span>
                          </div>
                        )}
                      </div>
                      <div className="card-body p-4 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="fw-black text-dark mb-0">{product.name}</h5>
                          <span className="text-pizza-red fw-black fs-5">C${product.price}</span>
                        </div>
                        <p className="text-muted small mb-4 flex-grow-1">{product.description}</p>
                        <button 
                          className={`btn btn-pizza-primary w-100 py-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 ${!product.is_available && 'disabled opacity-50'}`}
                          onClick={() => openProductModal(product)}
                          disabled={!product.is_available}
                        >
                          <Plus size={18} />
                          Personalizar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-12 col-lg-4">
            {/* Cart */}
            <div className="card premium-card border-0 shadow-sm mb-4 overflow-hidden rounded-4">
              <div className="card-header bg-pizza-gradient p-4 text-white border-0 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-black d-flex align-items-center gap-2">
                  <ShoppingCart /> Mi Pedido
                </h5>
                <span className="badge bg-white text-pizza-red rounded-circle px-2 py-1">{cart.length}</span>
              </div>
              <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {cart.length === 0 ? (
                  <div className="p-5 text-center text-muted opacity-50">
                    <ShoppingCart size={48} className="mb-3 mx-auto" />
                    <p className="fw-bold mb-0">Tu carrito está vacío</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {cart.map(item => (
                      <div key={item.id} className="list-group-item p-4 border-light">
                        <div className="d-flex justify-content-between mb-2">
                          <h6 className="fw-bold text-dark mb-0">{item.name}</h6>
                          <button className="btn btn-link text-danger p-0" onClick={() => setCart(cart.filter(i => i.id !== item.id))}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <small className="text-muted d-block mb-3">
                          {item.pizzaSize} {item.cheeseBorder && '+ Borde Queso'}
                          {item.extraIngredients.length > 0 && ` + ${item.extraIngredients.join(', ')}`}
                        </small>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-3 bg-light rounded-pill px-3 py-1">
                            <button className="btn btn-link text-pizza-red p-0" onClick={() => updateQuantity(item.id, -1)}><Minus size={18} /></button>
                            <span className="fw-black text-dark">{item.quantity}</span>
                            <button className="btn btn-link text-pizza-red p-0" onClick={() => updateQuantity(item.id, 1)}><Plus size={18} /></button>
                          </div>
                          <span className="fw-black text-pizza-red">C${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <div className="card-footer p-4 bg-white border-top border-light">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span className="text-muted fw-bold text-uppercase x-small">Total estimado</span>
                    <span className="fs-3 fw-black text-pizza-red">C${total.toFixed(2)}</span>
                  </div>
                  <button className="btn btn-pizza-primary w-100 py-3 fs-5 fw-black shadow-lg rounded-3" onClick={handlePlaceOrder}>
                    Confirmar Pedido
                  </button>
                </div>
              )}
            </div>

            {/* Active Orders */}
            <div className="card premium-card border-0 shadow-sm overflow-hidden rounded-4">
              <div className="card-header bg-dark p-4 text-white border-0">
                <h5 className="mb-0 fw-black d-flex align-items-center gap-2">
                  <Clock /> Mis Pedidos
                </h5>
              </div>
              <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {orders.length === 0 ? (
                  <div className="p-5 text-center text-muted opacity-50">
                    <ClipboardList size={48} className="mb-3 mx-auto" />
                    <p className="fw-bold mb-0">No tienes pedidos activos</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {orders.map(order => (
                      <div key={order.id} className="list-group-item p-4 border-light">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <p className="mb-0 fw-bold text-dark">#{order.id.slice(0, 8)}</p>
                            <small className="text-muted">{new Date(order.created_at).toLocaleString()}</small>
                          </div>
                          <span className={`badge rounded-pill px-3 py-2 text-uppercase x-small d-flex align-items-center gap-1 badge-status-${order.status}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="progress mb-3" style={{ height: '6px' }}>
                          <div 
                            className="progress-bar bg-pizza-gradient" 
                            style={{ 
                              width: order.status === 'pendiente' ? '25%' : 
                                     order.status === 'en preparación' ? '50%' : 
                                     order.status === 'listo' ? '75%' : '100%' 
                            }}
                          ></div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-black text-dark">C${order.total}</span>
                          <button className="btn btn-link text-muted p-0 text-decoration-none x-small fw-bold">Ver Detalles <ChevronRight size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {showProductModal && selectedProduct && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="position-relative">
                <img src={selectedProduct.image_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591'} className="w-100" style={{ height: '200px', objectFit: 'cover' }} alt="" />
                <button type="button" className="btn-close position-absolute top-0 end-0 m-3 bg-white rounded-circle p-2" onClick={() => setShowProductModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <h4 className="fw-black mb-1">{selectedProduct.name}</h4>
                <p className="text-muted small mb-4">{selectedProduct.description}</p>

                {selectedProduct.category === 'pizzas' && (
                  <>
                    <div className="mb-4">
                      <label className="form-label x-small fw-bold text-uppercase text-muted tracking-widest">Tamaño</label>
                      <div className="d-flex gap-2">
                        {['Pequeña', 'Mediana', 'Grande', 'Familiar'].map(size => (
                          <button 
                            key={size}
                            className={`btn btn-sm rounded-pill flex-grow-1 py-2 fw-bold ${pizzaSize === size ? 'btn-pizza-primary shadow-sm' : 'btn-light text-muted'}`}
                            onClick={() => setPizzaSize(size)}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label x-small fw-bold text-uppercase text-muted tracking-widest">Extras</label>
                      <div className="form-check form-switch mb-3 bg-light p-3 rounded-3">
                        <input 
                          className="form-check-input" type="checkbox" 
                          checked={cheeseBorder} 
                          onChange={e => setCheeseBorder(e.target.checked)} 
                        />
                        <label className="form-check-label fw-bold">Borde de Queso (+C$50)</label>
                      </div>
                      <div className="row g-2">
                        {['Peperoni', 'Champiñones', 'Jalapeño', 'Extra Queso'].map(ing => (
                          <div key={ing} className="col-6">
                            <button 
                              className={`btn btn-sm w-100 rounded-3 py-2 text-start px-3 d-flex justify-content-between align-items-center ${extraIngredients.includes(ing) ? 'btn-pizza-primary bg-opacity-10 text-pizza-red border-pizza-red' : 'btn-light text-muted border-transparent'}`}
                              onClick={() => {
                                if (extraIngredients.includes(ing)) {
                                  setExtraIngredients(extraIngredients.filter(i => i !== ing));
                                } else {
                                  setExtraIngredients([...extraIngredients, ing]);
                                }
                              }}
                            >
                              <span className="small fw-bold">{ing}</span>
                              <span className="x-small fw-black">+C$30</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button className="btn btn-pizza-primary w-100 py-3 rounded-3 fw-black shadow-lg d-flex justify-content-between align-items-center px-4" onClick={addToCart}>
                  <span>Añadir al Carrito</span>
                  <span className="bg-white text-pizza-red rounded-pill px-3 py-1 fs-6">
                    C${(selectedProduct.price + 
                      (pizzaSize === 'Grande' ? 100 : pizzaSize === 'Familiar' ? 200 : 0) +
                      (cheeseBorder ? 50 : 0) +
                      (extraIngredients.length * 30)).toFixed(2)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Chatbot />
    </div>
  );
};

export default ClientDashboard;
