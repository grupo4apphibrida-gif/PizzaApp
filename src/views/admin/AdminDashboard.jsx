import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  getProducts, createProduct, updateProduct, deleteProduct, 
  getInventory, updateInventoryStock, getUsers, getSalesStats, getTopSellingProducts 
} from '../../services/api';
import Encabezado from '../../components/navegacion/Encabezado';
import { Package, Users, ShoppingBag, TrendingUp } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ReportesView from './reportes/ReportesView';
import ProductosView from './productos/ProductosView';
import InventarioView from './inventario/InventarioView';
import UsuariosView from './usuarios/UsuariosView';

const AdminDashboard = () => {
  // Estados principales
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [users, setUsers] = useState([]);
  const [salesStats, setSalesStats] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Navegación
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener la sección activa desde la URL o usar 'reportes' por defecto
  const getActiveTab = () => {
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    if (['reportes', 'productos', 'inventario', 'usuarios'].includes(lastPart)) {
      return lastPart;
    }
    return 'reportes';
  };
  
  const activeTab = getActiveTab();

  // Cargar datos iniciales
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
      const date = new Date(order.creado_en).toLocaleDateString();
      acc[date] = (acc[date] || 0) + Number(order.total);
      return acc;
    }, {});
    return Object.keys(groups).map(date => ({ date, total: groups[date] })).slice(-7);
  };

  const processTopProducts = (data) => {
    const groups = data.reduce((acc, item) => {
      const name = item.productos?.nombre || 'Producto eliminado';
      acc[name] = (acc[name] || 0) + item.cantidad;
      return acc;
    }, {});
    return Object.keys(groups).map(name => ({ name, value: groups[name] })).sort((a, b) => b.value - a.value).slice(0, 5);
  };

  // Manejadores de eventos para productos
  const handleAddProduct = async (product) => {
    try {
      await createProduct(product);
      fetchData();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Error al guardar el producto.');
    }
  };

  const handleEditProduct = async (id, product) => {
    try {
      await updateProduct(id, product);
      fetchData();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Error al guardar el producto.');
    }
  };

  const handleDeleteProduct = async (id) => {
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

  // Manejador para inventario
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

  // Cambiar de sección
  const handleTabChange = (tab) => {
    navigate(`/admin/${tab}`);
  };

  // Pantalla de carga
  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="text-center">
        <div className="spinner-border text-pizza-red mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
        <p className="text-muted fw-bold">Preparando el dashboard...</p>
      </div>
    </div>
  );

  const totalSales = salesStats.reduce((acc, curr) => acc + curr.total, 0);

  const tabs = [
    { id: 'reportes', label: 'Reportes', icon: TrendingUp, path: '/admin/reportes' },
    { id: 'productos', label: 'Productos', icon: ShoppingBag, path: '/admin/productos' },
    { id: 'inventario', label: 'Inventario', icon: Package, path: '/admin/inventario' },
    { id: 'usuarios', label: 'Usuarios', icon: Users, path: '/admin/usuarios' }
  ];

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Encabezado />
      <div className="container-fluid px-4 px-md-5">
        {/* Encabezado del dashboard con navegación */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="bg-white p-4 rounded-4 shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h2 className="fw-black mb-1 text-dark fs-2">Panel Administrativo</h2>
                <p className="text-muted mb-0">Gestión profesional de PizzApp Juigalpa</p>
              </div>
              <div className="d-flex gap-2 bg-light p-1 rounded-pill overflow-auto">
                {tabs.map(tab => (
                  <button 
                    key={tab.id}
                    className={`btn rounded-pill px-4 py-2 fw-bold text-uppercase x-small d-flex align-items-center gap-2 transition-all ${activeTab === tab.id ? 'btn-pizza-primary shadow-sm' : 'btn-link text-muted text-decoration-none'}`}
                    onClick={() => handleTabChange(tab.id)}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido dinámico según la sección activa */}
        <AnimatePresence mode="wait">
          {activeTab === 'reportes' && (
            <ReportesView 
              salesStats={salesStats}
              topProducts={topProducts}
              totalSales={totalSales}
              products={products}
              inventory={inventory}
              users={users}
            />
          )}

          {activeTab === 'productos' && (
            <ProductosView 
              products={products}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onAddProduct={handleAddProduct}
            />
          )}

          {activeTab === 'inventario' && (
            <InventarioView 
              inventory={inventory}
              onUpdateStock={handleStockUpdate}
            />
          )}

          {activeTab === 'usuarios' && (
            <UsuariosView users={users} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
