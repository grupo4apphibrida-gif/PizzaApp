import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProducts, createOrder } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../database/supabaseconfig';
import Encabezado from '../../components/navegacion/Encabezado';
import Chatbot from '../../components/Chatbot';
import MenuView from './menu/MenuView';
import PedidosView from './pedidos/PedidosView';
import { Pizza, Clock, CheckCircle2, Info, Truck } from 'lucide-react';

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
  
  // Estados de personalización
  const [pizzaSize, setPizzaSize] = useState('Mediana');
  const [cheeseBorder, setCheeseBorder] = useState(false);
  const [extraIngredients, setExtraIngredients] = useState([]);

  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      const { data, error } = await supabase
        .from('pedidos')
        .select('*, detalle_pedido(*, productos(*))')
        .eq('usuario_id', profile.id)
        .order('creado_en', { ascending: false });
      
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
    const finalPrice = selectedProduct.precio + 
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

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
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
        usuario_id: profile.id,
        estado: 'pendiente',
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
          {/* Contenido principal con subvistas */}
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

      {/* Modal de personalización de producto */}
      {showProductModal && selectedProduct && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="position-relative">
                <img src={selectedProduct.imagen_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591'} className="w-100" style={{ height: '200px', objectFit: 'cover' }} alt="" />
                <button type="button" className="btn-close position-absolute top-0 end-0 m-3 bg-white rounded-circle p-2" onClick={() => setShowProductModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <h4 className="fw-black mb-1">{selectedProduct.nombre}</h4>
                <p className="text-muted small mb-4">{selectedProduct.descripcion}</p>

                {selectedProduct.categoria === 'pizzas' && (
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
                    C${(selectedProduct.precio + 
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
