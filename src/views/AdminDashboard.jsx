import React, { useState, useEffect } from 'react';
import { 
  getProducts, createProduct, updateProduct, deleteProduct, 
  getInventory, updateInventoryStock, getUsers, getSalesStats, getTopSellingProducts 
} from '../services/api';
import Encabezado from '../components/navegacion/Encabezado';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  Package, Users, ShoppingBag, TrendingUp, Plus, Edit, Trash2, 
  AlertTriangle, CheckCircle, RefreshCcw, DollarSign 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [users, setUsers] = useState([]);
  const [salesStats, setSalesStats] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports');

  // Form states
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({ 
    name: '', description: '', price: '', category: 'pizzas', image_url: '', is_available: true 
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, inventoryData, usersData, salesData, topProdData] = await Promise.all([
        getProducts(),
        getInventory(),
        getUsers(),
        getSalesStats(),
        getTopSellingProducts()
      ]);
      setProducts(productsData);
      setInventory(inventoryData);
      setUsers(usersData);
      setSalesStats(processSalesData(salesData));
      setTopProducts(processTopProducts(topProdData));
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const processSalesData = (data) => {
    // Agrupar por fecha
    const groups = data.reduce((acc, order) => {
      const date = new Date(order.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + Number(order.total);
      return acc;
    }, {});
    return Object.keys(groups).map(date => ({ date, total: groups[date] })).slice(-7);
  };

  const processTopProducts = (data) => {
    const groups = data.reduce((acc, item) => {
      const name = item.products?.name || 'Producto eliminado';
      acc[name] = (acc[name] || 0) + item.quantity;
      return acc;
    }, {});
    return Object.keys(groups).map(name => ({ name, value: groups[name] })).sort((a, b) => b.value - a.value).slice(0, 5);
  };


  const COLORS = ['#d32f2f', '#ffc107', '#4caf50', '#2196f3', '#9c27b0'];

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProduct(editingId, currentProduct);
      } else {
        await createProduct(currentProduct);
      }
      setShowProductModal(false);
      setEditingId(null);
      setCurrentProduct({ name: '', description: '', price: '', category: 'pizzas', image_url: '', is_available: true });
      fetchData();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Error al guardar el producto.');
    }
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setEditingId(product.id);
    setShowProductModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteProduct(id);
        fetchData();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Error al eliminar el producto.');
      }
    }
  };

  const handleStockUpdate = async (inventoryId, currentStock) => {
    const newStock = prompt('Ingresa el nuevo stock:', currentStock);
    if (newStock === null || isNaN(newStock)) return;
    try {
      await updateInventoryStock(inventoryId, parseInt(newStock));
      fetchData();
    } catch (err) {
      console.error('Error updating stock:', err);
      alert('Error al actualizar el stock.');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-12 col-md-6 col-lg-3"
    >
      <div className="card premium-card border-0 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className={`p-3 rounded-4 bg-opacity-10 bg-${color} text-${color}`}>
            <Icon size={24} />
          </div>
          {trend && (
            <span className={`badge rounded-pill bg-success bg-opacity-10 text-success fw-bold`}>
              +{trend}%
            </span>
          )}
        </div>
        <h3 className="fw-black mb-1">{value}</h3>
        <p className="text-muted small mb-0 text-uppercase tracking-wider fw-bold">{title}</p>
      </div>
    </motion.div>
  );

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="text-center">
        <div className="spinner-border text-pizza-red mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
        <p className="text-muted fw-bold">Preparando el dashboard...</p>
      </div>
    </div>
  );

  const totalSales = salesStats.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Encabezado />
      <div className="container-fluid px-4 px-md-5">
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="bg-white p-4 rounded-4 shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h2 className="fw-black mb-1 text-dark fs-2">Panel Administrativo</h2>
                <p className="text-muted mb-0">Gestión profesional de PizzApp Juigalpa</p>
              </div>
              <div className="d-flex gap-2 bg-light p-1 rounded-pill overflow-auto">
                {[
                  { id: 'reports', label: 'Reportes', icon: TrendingUp },
                  { id: 'products', label: 'Productos', icon: ShoppingBag },
                  { id: 'inventory', label: 'Inventario', icon: Package },
                  { id: 'users', label: 'Usuarios', icon: Users }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    className={`btn rounded-pill px-4 py-2 fw-bold text-uppercase x-small d-flex align-items-center gap-2 transition-all ${activeTab === tab.id ? 'btn-pizza-primary shadow-sm' : 'btn-link text-muted text-decoration-none'}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'reports' && (
            <motion.div 
              key="reports"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="row g-4"
            >
              <StatCard title="Ventas Totales" value={`C$${totalSales.toLocaleString()}`} icon={DollarSign} color="danger" trend="12" />
              <StatCard title="Productos" value={products.length} icon={ShoppingBag} color="warning" />
              <StatCard title="Stock Bajo" value={inventory.filter(i => i.stock <= i.min_stock).length} icon={AlertTriangle} color="danger" />
              <StatCard title="Clientes" value={users.filter(u => u.role === 'cliente').length} icon={Users} color="primary" />

              <div className="col-12 col-lg-8">
                <div className="card premium-card border-0 p-4 h-100">
                  <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                    <TrendingUp size={20} className="text-pizza-red" />
                    Tendencia de Ventas (Últimos 7 días)
                  </h5>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <AreaChart data={salesStats}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d32f2f" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#d32f2f" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="total" stroke="#d32f2f" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-4">
                <div className="card premium-card border-0 p-4 h-100">
                  <h5 className="fw-bold mb-4">Productos más Vendidos</h5>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={topProducts}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {topProducts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3">
                    {topProducts.map((p, i) => (
                      <div key={p.name} className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: COLORS[i % COLORS.length] }}></div>
                          <span className="small fw-bold">{p.name}</span>
                        </div>
                        <span className="badge bg-light text-dark rounded-pill">{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div 
              key="products"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="row g-4"
            >
              <div className="col-12">
                <div className="bg-white p-4 rounded-4 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-black mb-0 text-dark fs-4">Gestión de Menú</h3>
                    <button 
                      className="btn btn-pizza-primary rounded-pill px-4 py-2 fw-bold text-uppercase x-small shadow-sm d-flex align-items-center gap-2"
                      onClick={() => {
                        setCurrentProduct({ name: '', description: '', price: '', category: 'pizzas', image_url: '', is_available: true });
                        setEditingId(null);
                        setShowProductModal(true);
                      }}
                    >
                      <Plus size={18} />
                      Nuevo Producto
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="bg-light text-muted x-small text-uppercase fw-bold tracking-widest border-0">
                        <tr>
                          <th className="py-3 border-0 px-4">Producto</th>
                          <th className="py-3 border-0 px-4 text-center">Categoría</th>
                          <th className="py-3 border-0 px-4 text-center">Precio</th>
                          <th className="py-3 border-0 px-4 text-center">Estado</th>
                          <th className="py-3 border-0 px-4 text-end">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(product => (
                          <tr key={product.id}>
                            <td className="py-4 px-4 fw-bold">
                              <div className="d-flex align-items-center gap-3">
                                <img src={product.image_url || 'https://via.placeholder.com/50'} className="rounded-3" style={{ width: 45, height: 45, objectFit: 'cover' }} alt="" />
                                {product.name}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="badge bg-light text-dark rounded-pill px-3 py-1 text-uppercase x-small">{product.category}</span>
                            </td>
                            <td className="py-4 px-4 text-center fw-black text-pizza-red">C${product.price}</td>
                            <td className="py-4 px-4 text-center">
                              <span className={`badge rounded-pill px-3 py-1 text-uppercase x-small ${product.is_available ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                                {product.is_available ? 'Disponible' : 'Agotado'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-end">
                              <button className="btn btn-link text-primary p-0 me-3" onClick={() => handleEdit(product)}><Edit size={18} /></button>
                              <button className="btn btn-link text-danger p-0" onClick={() => handleDelete(product.id)}><Trash2 size={18} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div 
              key="inventory"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="row g-4"
            >
              <div className="col-12">
                <div className="bg-white p-4 rounded-4 shadow-sm">
                  <h3 className="fw-black mb-4 text-dark fs-4">Control de Inventario</h3>
                  <div className="row g-4">
                    {inventory.map(item => (
                      <div key={item.id} className="col-12 col-md-6 col-xl-4">
                        <div className={`card border-0 p-4 rounded-4 shadow-sm ${item.stock <= item.min_stock ? 'bg-danger bg-opacity-10 border border-danger' : 'bg-white'}`}>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold mb-0">{item.products.name}</h6>
                            <span className="badge bg-light text-dark rounded-pill">{item.products.category}</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-end">
                            <div>
                              <p className="text-muted x-small text-uppercase mb-1 fw-bold">Stock Actual</p>
                              <h2 className={`fw-black mb-0 ${item.stock <= item.min_stock ? 'text-danger' : 'text-dark'}`}>{item.stock}</h2>
                            </div>
                            <button 
                              className="btn btn-dark rounded-pill px-3 py-1 x-small fw-bold d-flex align-items-center gap-2"
                              onClick={() => handleStockUpdate(item.id, item.stock)}
                            >
                              <RefreshCcw size={14} />
                              Actualizar
                            </button>
                          </div>
                          {item.stock <= item.min_stock && (
                            <div className="mt-3 text-danger x-small fw-bold d-flex align-items-center gap-1">
                              <AlertTriangle size={14} />
                              Stock bajo (Mín: {item.min_stock})
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="row g-4"
            >
              <div className="col-12">
                <div className="bg-white p-4 rounded-4 shadow-sm">
                  <h3 className="fw-black mb-4 text-dark fs-4">Gestión de Usuarios</h3>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="bg-light text-muted x-small text-uppercase fw-bold tracking-widest border-0">
                        <tr>
                          <th className="py-3 border-0 px-4">Usuario</th>
                          <th className="py-3 border-0 px-4">Correo</th>
                          <th className="py-3 border-0 px-4 text-center">Rol</th>
                          <th className="py-3 border-0 px-4 text-end">Registro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id}>
                            <td className="py-4 px-4 fw-bold">{user.name}</td>
                            <td className="py-4 px-4 text-muted">{user.email}</td>
                            <td className="py-4 px-4 text-center">
                              <span className={`badge rounded-pill px-3 py-1 text-uppercase x-small ${user.role === 'admin' ? 'bg-danger text-white' : user.role === 'empleado' ? 'bg-primary text-white' : 'bg-light text-dark'}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-end text-muted small">{new Date(user.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

        {/* Product Modal */}
        {showProductModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow-lg">
                <div className="modal-header border-0 p-4">
                  <h5 className="modal-title fw-black">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowProductModal(false)}></button>
                </div>
                <form onSubmit={handleProductSubmit}>
                  <div className="modal-body p-4 pt-0">
                    <div className="mb-3">
                      <label className="form-label x-small fw-bold text-uppercase text-muted">Nombre</label>
                      <input 
                        type="text" className="form-control rounded-3" 
                        value={currentProduct.name} 
                        onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label x-small fw-bold text-uppercase text-muted">Descripción</label>
                      <textarea 
                        className="form-control rounded-3" 
                        value={currentProduct.description} 
                        onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} 
                      />
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label x-small fw-bold text-uppercase text-muted">Precio (C$)</label>
                        <input 
                          type="number" className="form-control rounded-3" 
                          value={currentProduct.price} 
                          onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})} 
                          required 
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label x-small fw-bold text-uppercase text-muted">Categoría</label>
                        <select 
                          className="form-select rounded-3" 
                          value={currentProduct.category} 
                          onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}
                        >
                          <option value="pizzas">Pizzas</option>
                          <option value="bebidas">Bebidas</option>
                          <option value="postres">Postres</option>
                          <option value="extras">Extras</option>
                          <option value="combos">Combos</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label x-small fw-bold text-uppercase text-muted">URL Imagen</label>
                      <input 
                        type="text" className="form-control rounded-3" 
                        value={currentProduct.image_url} 
                        onChange={e => setCurrentProduct({...currentProduct, image_url: e.target.value})} 
                      />
                    </div>
                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" type="checkbox" 
                        checked={currentProduct.is_available} 
                        onChange={e => setCurrentProduct({...currentProduct, is_available: e.target.checked})} 
                      />
                      <label className="form-check-label fw-bold">Disponible para venta</label>
                    </div>
                  </div>
                  <div className="modal-footer border-0 p-4 pt-0">
                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowProductModal(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-pizza-primary rounded-pill px-4 shadow-sm">Guardar Cambios</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdminDashboard;
