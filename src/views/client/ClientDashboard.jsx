import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProducts } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../database/supabaseconfig';
import Encabezado from '../../components/navegacion/Encabezado';
import MenuView from './menu/MenuView';
import PedidosView from './pedidos/PedidosView';
import { 
  Pizza, Clock, CheckCircle2, Info, Truck, ShoppingBag, 
  CreditCard, MapPin, Sparkles, Heart, Star, TrendingUp,
  Check, AlertCircle, X, Plus, Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Función para validar si un ID es UUID
const isUUID = (id) => {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(String(id));
};

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
  const [procesando, setProcesando] = useState(false);
  const [showModalPago, setShowModalPago] = useState(false);
  const [direccionEnvio, setDireccionEnvio] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState('retiro');
  
  const [pizzaSize, setPizzaSize] = useState('Mediana');
  const [cheeseBorder, setCheeseBorder] = useState(false);
  const [extraIngredients, setExtraIngredients] = useState([]);

  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchProducts();
    if (profile) {
      fetchOrders();
    }

    const subscription = supabase
      .channel('public:orders_client')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, payload => {
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
      filtered = filtered.filter(p => p.categoria === category);
    }
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
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
      let query = supabase
        .from('pedidos')
        .select('*, detalle_pedido(*)')
        .order('creado_en', { ascending: false });
      
      // Buscar por email del cliente o por usuario_id
      const emailCliente = profile?.email || user?.email;
      if (emailCliente) {
        query = query.eq('email_cliente', emailCliente);
      } else if (user?.id) {
        const esUUID = isUUID(user.id);
        if (esUUID) {
          query = query.eq('usuario_id', user.id);
        } else {
          query = query.eq('cliente_id', Number(user.id));
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setOrders(data || []);
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

  const calcularPrecioFinal = () => {
    let precio = selectedProduct?.precio || 0;
    
    if (pizzaSize === 'Grande') precio += 100;
    if (pizzaSize === 'Familiar') precio += 200;
    if (cheeseBorder) precio += 50;
    precio += extraIngredients.length * 30;
    
    return precio;
  };

  const addToCart = () => {
    const finalPrice = calcularPrecioFinal();

    const cartItem = {
      id: selectedProduct.id,
      cartItemId: `${selectedProduct.id}-${pizzaSize}-${cheeseBorder}-${extraIngredients.join(',')}`,
      nombre: selectedProduct.nombre,
      descripcion: selectedProduct.descripcion,
      imagen: selectedProduct.imagen_url,
      precio: finalPrice,
      cantidad: 1,
      tamanio: pizzaSize,
      cheeseBorder: cheeseBorder,
      extraIngredients: extraIngredients,
      tipoEntrega: tipoEntrega
    };

    const existingIndex = cart.findIndex(item => item.cartItemId === cartItem.cartItemId);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].cantidad += 1;
      setCart(newCart);
    } else {
      setCart([...cart, cartItem]);
    }
    setShowProductModal(false);
  };

  const updateQuantity = (cartItemId, delta) => {
    setCart(cart.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = item.cantidad + delta;
        return newQty > 0 ? { ...item, cantidad: newQty } : item;
      }
      return item;
    }).filter(item => item.cantidad > 0));
  };

  const removeFromCart = (cartItemId) => {
    setCart(cart.filter(item => item.cartItemId !== cartItemId));
  };

  const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const costoEnvio = tipoEntrega === "envio" ? 30 : 0;
  const totalConEnvio = total + costoEnvio;

  const handlePlaceOrder = () => {
    if (!profile) {
      if (window.confirm('Para realizar un pedido necesitas iniciar sesión. ¿Deseas ir al login?')) {
        navigate('/login');
      }
      return;
    }
    if (cart.length === 0) return;
    setShowModalPago(true);
  };

  const procesarPedido = async () => {
    if (tipoEntrega === "envio" && !direccionEnvio) {
      alert("Por favor, ingresa tu dirección de envío");
      return;
    }
    
    setProcesando(true);
    
    try {
      const userId = user?.id;
      const esUUID = isUUID(userId);
      
      const pedidoData = {
        nombre_cliente: profile?.nombre || profile?.name || "Invitado",
        email_cliente: profile?.email || user?.email || null,
        telefono_cliente: profile?.telefono || null,
        total: totalConEnvio,
        estado: "pendiente",
        prioridad: "normal",
        tipo: "cliente",
        tipo_entrega: tipoEntrega,
        direccion_envio: tipoEntrega === "envio" ? direccionEnvio : null,
        costo_envio: costoEnvio,
        creado_en: new Date().toISOString()
      };
      
      // Si es UUID, usar usuario_id; si es número, usar cliente_id
      if (esUUID) {
        pedidoData.usuario_id = userId;
      } else if (userId && !isNaN(Number(userId))) {
        pedidoData.cliente_id = Number(userId);
      }

      console.log("📦 Creando pedido:", pedidoData);

      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos")
        .insert([pedidoData])
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      const detalles = cart.map(item => ({
        pedido_id: pedido.id,
        producto_id: String(item.id),
        cantidad: item.cantidad,
        precio: item.precio,
        tamanio: item.tamanio || null,
        tipo_entrega: tipoEntrega,
        direccion_envio: tipoEntrega === "envio" ? direccionEnvio : null
      }));

      const { error: detalleError } = await supabase
        .from("detalle_pedido")
        .insert(detalles);

      if (detalleError) throw detalleError;

      setCart([]);
      setShowModalPago(false);
      setDireccionEnvio('');
      setTipoEntrega('retiro');
      
      alert("✅ ¡Pedido realizado con éxito!");
      fetchOrders();
      
    } catch (err) {
      console.error("Error al realizar pedido:", err);
      alert("Error al realizar el pedido: " + err.message);
    } finally {
      setProcesando(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendiente': return <Clock size={14} />;
      case 'en_preparacion': return <Pizza size={14} />;
      case 'entregado': return <CheckCircle2 size={14} />;
      case 'cancelado': return <AlertCircle size={14} />;
      default: return <Info size={14} />;
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
          <Pizza size={48} color="#dc3545" />
        </motion.div>
        <p className="mt-3 text-muted">Horneando el menú...</p>
      </div>
    </div>
  );

  return (
    <div className="client-dashboard">
      <Encabezado />
      
      <div className="container-fluid px-4 px-md-5 py-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="welcome-banner mb-4"
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h1 className="display-6 fw-bold mb-1">
                ¡Bienvenido, {profile?.nombre?.split(' ')[0] || 'Cliente'}! 
                <Sparkles size={24} className="ms-2 text-warning" />
              </h1>
              <p className="text-muted mb-0">Descubre nuestras deliciosas pizzas hechas con amor</p>
            </div>
            <div className="d-flex gap-2">
              <div className="bg-white rounded-pill px-3 py-2 shadow-sm">
                <Star size={16} className="text-warning me-1" />
                <span className="small">¡Ofertas especiales hoy!</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="row g-4">
          <MenuView 
            products={products}
            filteredProducts={filteredProducts}
            category={category}
            searchTerm={searchTerm}
            onCategoryChange={setCategory}
            onSearchChange={setSearchTerm}
            onOpenProductModal={openProductModal}
          />
          
          <PedidosView 
            cart={cart}
            orders={orders}
            total={total}
            onUpdateQuantity={updateQuantity}
            onRemoveFromCart={removeFromCart}
            onPlaceOrder={handlePlaceOrder}
            getStatusIcon={getStatusIcon}
          />
        </div>
      </div>

      {/* Modal de personalización */}
      <AnimatePresence>
        {showProductModal && selectedProduct && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowProductModal(false)}
          >
            <motion.div 
              className="product-modal"
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="modal-header-custom">
                <div className="modal-image">
                  <img 
                    src={selectedProduct.imagen_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591'} 
                    alt={selectedProduct.nombre}
                  />
                  <button className="modal-close" onClick={() => setShowProductModal(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-badge">
                  <Heart size={14} /> Popular
                </div>
              </div>

              <div className="modal-body-custom">
                <h3 className="product-title">{selectedProduct.nombre}</h3>
                <p className="product-description">{selectedProduct.descripcion}</p>

                {selectedProduct.categoria === 'pizzas' && (
                  <>
                    <div className="option-group">
                      <label className="option-label"><Pizza size={16} /> Tamaño</label>
                      <div className="size-options">
                        {['Pequeña', 'Mediana', 'Grande', 'Familiar'].map(size => (
                          <button 
                            key={size}
                            className={`size-option ${pizzaSize === size ? 'active' : ''}`}
                            onClick={() => setPizzaSize(size)}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="option-group">
                      <label className="option-label">Extras</label>
                      <div className="form-check form-switch mb-3">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          checked={cheeseBorder} 
                          onChange={e => setCheeseBorder(e.target.checked)} 
                        />
                        <label className="form-check-label fw-bold">Borde de Queso (+C$50)</label>
                      </div>
                      <div className="ingredients-grid">
                        {['Peperoni', 'Champiñones', 'Jalapeño', 'Extra Queso'].map(ing => (
                          <button 
                            key={ing}
                            className={`ingredient-btn ${extraIngredients.includes(ing) ? 'active' : ''}`}
                            onClick={() => {
                              if (extraIngredients.includes(ing)) {
                                setExtraIngredients(extraIngredients.filter(i => i !== ing));
                              } else {
                                setExtraIngredients([...extraIngredients, ing]);
                              }
                            }}
                          >
                            <span>{ing}</span>
                            <span className="price">+C$30</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="price-footer">
                  <div className="total-price">
                    <span>Total:</span>
                    <strong>C$ {calcularPrecioFinal().toFixed(2)}</strong>
                  </div>
                  <button className="add-to-cart-btn" onClick={addToCart}>
                    <ShoppingBag size={18} /> Añadir al Carrito
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Pago */}
      <AnimatePresence>
        {showModalPago && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowModalPago(false)}
          >
            <motion.div 
              className="payment-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="payment-header">
                <CreditCard size={24} />
                <h3>Confirmar Pedido</h3>
                <button className="payment-close" onClick={() => setShowModalPago(false)}><X size={20} /></button>
              </div>

              <div className="payment-body">
                <div className="delivery-options">
                  <label className="section-label">¿Cómo quieres recibir tu pedido?</label>
                  <div className="delivery-grid">
                    <div className={`delivery-option ${tipoEntrega === "retiro" ? 'active' : ''}`} onClick={() => setTipoEntrega("retiro")}>
                      <ShoppingBag size={28} />
                      <strong>Retiro en Tienda</strong>
                      <small>Sin costo extra</small>
                    </div>
                    <div className={`delivery-option ${tipoEntrega === "envio" ? 'active' : ''}`} onClick={() => setTipoEntrega("envio")}>
                      <Truck size={28} />
                      <strong>Envío a Domicilio</strong>
                      <small>+C$30</small>
                    </div>
                  </div>
                </div>

                {tipoEntrega === "envio" && (
                  <motion.div className="address-input" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label><MapPin size={16} /> Dirección de envío</label>
                    <input type="text" placeholder="Ej: Calle Principal #123, Barrio San Juan" value={direccionEnvio} onChange={(e) => setDireccionEnvio(e.target.value)} />
                  </motion.div>
                )}

                <div className="order-summary">
                  <h4>Resumen del Pedido</h4>
                  <div className="summary-row"><span>Subtotal</span><span>C$ {total.toFixed(2)}</span></div>
                  {costoEnvio > 0 && <div className="summary-row"><span>Envío</span><span>C$ {costoEnvio.toFixed(2)}</span></div>}
                  <div className="summary-row total"><span>Total</span><strong>C$ {totalConEnvio.toFixed(2)}</strong></div>
                </div>
              </div>

              <div className="payment-footer">
                <button className="btn-cancel" onClick={() => setShowModalPago(false)}>Cancelar</button>
                <button className="btn-confirm" onClick={procesarPedido} disabled={procesando || (tipoEntrega === "envio" && !direccionEnvio)}>
                  {procesando ? "Procesando..." : `Confirmar Pedido - C$ ${totalConEnvio.toFixed(2)}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .client-dashboard { background: linear-gradient(135deg, #f8f9fa 0%, #f1f3f5 100%); min-height: 100vh; }
        .welcome-banner { background: white; padding: 1.5rem 2rem; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid rgba(220,53,69,0.1); }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 1100; display: flex; align-items: center; justify-content: center; }
        .product-modal { background: white; border-radius: 32px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px rgba(0,0,0,0.25); }
        .modal-header-custom { position: relative; height: 220px; }
        .modal-image { width: 100%; height: 100%; overflow: hidden; border-radius: 32px 32px 0 0; }
        .modal-image img { width: 100%; height: 100%; object-fit: cover; }
        .modal-close { position: absolute; top: 16px; right: 16px; background: rgba(0,0,0,0.5); border: none; border-radius: 50%; width: 40px; height: 40px; color: white; cursor: pointer; backdrop-filter: blur(4px); }
        .modal-badge { position: absolute; bottom: 16px; left: 16px; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); color: white; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; display: flex; align-items: center; gap: 6px; }
        .modal-body-custom { padding: 24px; }
        .product-title { font-size: 1.5rem; font-weight: 800; margin-bottom: 8px; }
        .product-description { color: #6c757d; font-size: 0.85rem; margin-bottom: 24px; }
        .option-group { margin-bottom: 24px; }
        .option-label { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.85rem; margin-bottom: 12px; color: #495057; }
        .size-options { display: flex; gap: 12px; }
        .size-option { flex: 1; padding: 10px; border: 1px solid #e9ecef; border-radius: 12px; background: white; font-weight: 500; transition: all 0.2s; cursor: pointer; }
        .size-option.active { background: #dc3545; color: white; border-color: #dc3545; }
        .ingredients-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .ingredient-btn { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border: 1px solid #e9ecef; border-radius: 12px; background: white; font-size: 0.85rem; cursor: pointer; }
        .ingredient-btn.active { background: #dc3545; color: white; border-color: #dc3545; }
        .ingredient-btn .price { font-size: 0.7rem; font-weight: 600; }
        .price-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e9ecef; }
        .total-price { font-size: 0.9rem; }
        .total-price strong { font-size: 1.3rem; color: #dc3545; margin-left: 8px; }
        .add-to-cart-btn { background: #dc3545; color: white; border: none; border-radius: 40px; padding: 10px 20px; display: flex; align-items: center; gap: 8px; font-weight: 600; cursor: pointer; }
        .add-to-cart-btn:hover { background: #c82333; transform: scale(1.02); }
        .payment-modal { background: white; border-radius: 32px; width: 90%; max-width: 500px; box-shadow: 0 25px 50px rgba(0,0,0,0.25); }
        .payment-header { background: linear-gradient(135deg, #dc3545, #c82333); padding: 20px 24px; border-radius: 32px 32px 0 0; color: white; display: flex; align-items: center; gap: 12px; position: relative; }
        .payment-header h3 { margin: 0; flex: 1; }
        .payment-close { background: rgba(255,255,255,0.2); border: none; border-radius: 50%; width: 36px; height: 36px; color: white; cursor: pointer; }
        .payment-body { padding: 24px; }
        .section-label { font-weight: 600; margin-bottom: 12px; display: block; color: #495057; }
        .delivery-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
        .delivery-option { border: 2px solid #e9ecef; border-radius: 16px; padding: 16px; text-align: center; cursor: pointer; transition: all 0.2s; }
        .delivery-option.active { border-color: #dc3545; background: #fff5f5; }
        .delivery-option strong { display: block; margin: 8px 0 4px; }
        .address-input { margin-bottom: 24px; }
        .address-input label { display: flex; align-items: center; gap: 6px; font-weight: 500; font-size: 0.85rem; margin-bottom: 8px; }
        .address-input input { width: 100%; padding: 12px; border: 1px solid #e9ecef; border-radius: 12px; }
        .order-summary { background: #f8f9fa; border-radius: 20px; padding: 20px; }
        .order-summary h4 { margin-bottom: 16px; font-size: 1rem; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .summary-row.total { padding-top: 12px; border-top: 1px solid #dee2e6; margin-top: 8px; font-size: 1.1rem; }
        .payment-footer { display: flex; gap: 12px; padding: 20px 24px; border-top: 1px solid #e9ecef; }
        .btn-cancel { flex: 1; padding: 12px; border: 1px solid #dee2e6; background: white; border-radius: 40px; cursor: pointer; }
        .btn-confirm { flex: 2; padding: 12px; background: #dc3545; color: white; border: none; border-radius: 40px; font-weight: 600; cursor: pointer; }
        .btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-confirm:hover:not(:disabled) { background: #c82333; }
        @media (max-width: 768px) { .delivery-grid { grid-template-columns: 1fr; } .ingredients-grid { grid-template-columns: 1fr; } .size-options { flex-wrap: wrap; } }
      `}</style>
    </div>
  );
};

export default ClientDashboard;