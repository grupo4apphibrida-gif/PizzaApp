import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Image as ImageIcon, Package, Tag, DollarSign, CheckCircle, XCircle, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../../services/api';
import NotificacionOperacion from '../../../components/NotificacionOperacion';
import CuadroBusquedas from '../../../components/busquedas/CuadroBusquedas';
import Paginacion from '../../../components/Paginacion';

const convertFileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ProductosView = () => {
  const [products, setProducts] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({ 
    nombre: '', descripcion: '', precio: '', categoria: 'pizzas', imagen_url: '', disponible: true 
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [toast, setToast] = useState({ mostrar: false, mensaje: '', tipo: '' });
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const productos = await getProducts();
      setProducts(productos || []);
      setProductosFiltrados(productos || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setToast({ mostrar: true, mensaje: 'Error cargando productos', tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAnimating(true);
    try {
      if (editingId) {
        await updateProduct(editingId, currentProduct);
        setToast({ mostrar: true, mensaje: 'Producto actualizado con éxito', tipo: 'exito' });
      } else {
        await createProduct(currentProduct);
        setToast({ mostrar: true, mensaje: 'Producto creado con éxito', tipo: 'exito' });
      }
      await cargarProductos();
      setShowModal(false);
      setEditingId(null);
      setCurrentProduct({ nombre: '', descripcion: '', precio: '', categoria: 'pizzas', imagen_url: '', disponible: true });
      setImagenFile(null);
      setImagenPreview(null);
    } catch (error) {
      console.error('Error guardando producto:', error);
      setToast({ mostrar: true, mensaje: 'Error guardando producto', tipo: 'error' });
    } finally {
      setAnimating(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await convertFileToBase64(file);
    setImagenFile(file);
    setImagenPreview(base64);
    setCurrentProduct((prev) => ({ ...prev, imagen_url: base64 }));
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setImagenPreview(product.imagen_url);
    setImagenFile(null);
    setEditingId(product.id);
    setShowModal(true);
  };

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setProductosFiltrados(products);
    } else {
      const textoLower = textoBusqueda.toLowerCase();
      const filtrados = products.filter((producto) =>
        producto.nombre?.toLowerCase().includes(textoLower) ||
        producto.descripcion?.toLowerCase().includes(textoLower) ||
        producto.categoria?.toLowerCase().includes(textoLower)
      );
      setProductosFiltrados(filtrados);
    }
    setPaginaActual(1);
  }, [textoBusqueda, products]);

  const indiceUltimoRegistro = paginaActual * registrosPorPagina;
  const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
  const productosPaginados = productosFiltrados.slice(indicePrimerRegistro, indiceUltimoRegistro);

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await deleteProduct(productId);
      await cargarProductos();
      setToast({ mostrar: true, mensaje: 'Producto eliminado correctamente', tipo: 'exito' });
    } catch (error) {
      console.error('Error eliminando producto:', error);
      setToast({ mostrar: true, mensaje: 'Error eliminando producto', tipo: 'error' });
    }
  };

  const categorias = [
    { value: 'pizzas', label: '🍕 Pizzas', color: '#dc3545' },
    { value: 'bebidas', label: '🥤 Bebidas', color: '#17a2b8' },
    { value: 'postres', label: '🍰 Postres', color: '#ffc107' },
    { value: 'extras', label: '🍟 Extras', color: '#28a745' },
    { value: 'combos', label: '📦 Combos', color: '#6f42c1' },
  ];

  const getCategoriaInfo = (categoria) => {
    return categorias.find(c => c.value === categoria) || categorias[0];
  };

  return (
    <motion.div 
      key="productos"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container-fluid py-4"
    >
      <div className="row g-4">
        <div className="col-12">
          {/* Header Mejorado */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-4 shadow-sm mb-4"
            style={{ borderRadius: '24px', border: '1px solid rgba(220, 53, 69, 0.1)' }}
          >
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div className="bg-danger bg-opacity-10 rounded-circle p-2">
                    <Package size={28} color="#dc3545" />
                  </div>
                  <h3 className="fw-bold mb-0 text-dark">Gestión de Menú</h3>
                  <span className="badge bg-danger rounded-pill px-3 py-2">
                    {products.length} Productos
                  </span>
                </div>
                <p className="text-muted small mb-0">Administra tus productos, precios y disponibilidad</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-danger rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
                onClick={() => {
                  setCurrentProduct({ nombre: '', descripcion: '', precio: '', categoria: 'pizzas', imagen_url: '', disponible: true });
                  setImagenPreview(null);
                  setEditingId(null);
                  setShowModal(true);
                }}
              >
                <Plus size={18} />
                Nuevo Producto
              </motion.button>
            </div>
          </motion.div>

          {/* Tabla de Productos Mejorada */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-4 shadow-sm overflow-hidden"
            style={{ borderRadius: '24px', border: '1px solid rgba(220, 53, 69, 0.1)' }}
          >
            {/* Barra de búsqueda */}
            <div className="p-4 border-bottom bg-light">
              <div className="row g-3 align-items-center">
                <div className="col-md-8">
                  <div className="position-relative">
                    <Search size={18} className="position-absolute top-50 start-3 translate-middle-y text-muted" style={{ left: '12px' }} />
                    <input
                      type="text"
                      className="form-control rounded-pill ps-5"
                      placeholder="Buscar producto, categoría o descripción..."
                      value={textoBusqueda}
                      onChange={(e) => setTextoBusqueda(e.target.value)}
                      style={{ padding: '12px 16px 12px 40px', border: '1px solid #e9ecef' }}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <Filter size={14} />
                    <span>{productosFiltrados.length} productos encontrados</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light" style={{ borderBottom: '2px solid #e9ecef' }}>
                  <tr>
                    <th className="py-3 px-4" style={{ width: '35%' }}>Producto</th>
                    <th className="py-3 px-4 text-center" style={{ width: '15%' }}>Categoría</th>
                    <th className="py-3 px-4 text-center" style={{ width: '15%' }}>Precio</th>
                    <th className="py-3 px-4 text-center" style={{ width: '15%' }}>Estado</th>
                    <th className="py-3 px-4 text-end" style={{ width: '20%' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        <div className="spinner-border text-danger" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-2 text-muted small">Cargando productos...</p>
                      </td>
                    </tr>
                  ) : productosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
                          <Package size={32} className="text-muted" />
                        </div>
                        <p className="text-muted mb-0">
                          {textoBusqueda ? `No se encontraron productos para "${textoBusqueda}"` : 'No hay productos registrados aún'}
                        </p>
                        <button 
                          className="btn btn-link text-danger mt-2"
                          onClick={() => {
                            setCurrentProduct({ nombre: '', descripcion: '', precio: '', categoria: 'pizzas', imagen_url: '', disponible: true });
                            setEditingId(null);
                            setShowModal(true);
                          }}
                        >
                          <Plus size={16} className="me-1" />
                          Agregar primer producto
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence>
                      {productosPaginados.map((product, idx) => {
                        const categoriaInfo = getCategoriaInfo(product.categoria);
                        return (
                          <motion.tr 
                            key={product.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="producto-row"
                          >
                            <td className="py-3 px-4">
                              <div className="d-flex align-items-center gap-3">
                                <div className="producto-imagen">
                                  {product.imagen_url ? (
                                    <img 
                                      src={product.imagen_url} 
                                      className="rounded-3"
                                      style={{ width: 50, height: 50, objectFit: 'cover' }} 
                                      alt={product.nombre}
                                    />
                                  ) : (
                                    <div className="bg-light rounded-3 d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                                      <ImageIcon size={20} className="text-muted" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h6 className="fw-bold mb-1">{product.nombre}</h6>
                                  <small className="text-muted">{product.descripcion?.substring(0, 50)}</small>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span 
                                className="badge rounded-pill px-3 py-2"
                                style={{ 
                                  background: `${categoriaInfo.color}15`, 
                                  color: categoriaInfo.color,
                                  fontSize: '0.7rem'
                                }}
                              >
                                {categoriaInfo.label}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="d-flex align-items-center justify-content-center gap-1">
                                <DollarSign size={14} className="text-danger" />
                                <span className="fw-bold text-danger fs-6">{product.precio}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {product.disponible ? (
                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1">
                                  <CheckCircle size={12} />
                                  Disponible
                                </span>
                              ) : (
                                <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1">
                                  <XCircle size={12} />
                                  Agotado
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-end">
                              <div className="d-flex gap-2 justify-content-end">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="btn btn-outline-warning rounded-circle p-2"
                                  style={{ width: 36, height: 36 }}
                                  onClick={() => handleEdit(product)}
                                  title="Editar producto"
                                >
                                  <Edit size={16} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="btn btn-outline-danger rounded-circle p-2"
                                  style={{ width: 36, height: 36 }}
                                  onClick={() => handleDelete(product.id)}
                                  title="Eliminar producto"
                                >
                                  <Trash2 size={16} />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Paginación */}
          {productosFiltrados.length > 0 && (
            <div className="mt-4">
              <Paginacion
                registrosPorPagina={registrosPorPagina}
                totalRegistros={productosFiltrados.length}
                paginaActual={paginaActual}
                establecerPaginaActual={setPaginaActual}
                establecerRegistrosPorPagina={setRegistrosPorPagina}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal de Producto Mejorado */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="modal show d-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1050 }}
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div 
              className="modal-dialog modal-dialog-centered modal-lg"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                <div className="modal-header border-0 p-4" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-white rounded-circle p-2">
                      {editingId ? <Edit size={24} color="#dc3545" /> : <Package size={24} color="#dc3545" />}
                    </div>
                    <div>
                      <h5 className="modal-title fw-bold text-white mb-0">
                        {editingId ? 'Editar Producto' : 'Nuevo Producto'}
                      </h5>
                      <p className="text-white-50 small mb-0">
                        {editingId ? 'Modifica los datos del producto' : 'Agrega un nuevo producto al menú'}
                      </p>
                    </div>
                  </div>
                  <button type="button" className="btn-close-white" onClick={() => setShowModal(false)}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body p-4" style={{ background: '#f8f9fa' }}>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label small fw-bold text-muted">Nombre del producto *</label>
                        <input 
                          type="text" 
                          className="form-control rounded-3" 
                          placeholder="Ej: Pizza Hawaiana"
                          value={currentProduct.nombre} 
                          onChange={e => setCurrentProduct({...currentProduct, nombre: e.target.value})} 
                          required 
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-bold text-muted">Descripción</label>
                        <textarea 
                          className="form-control rounded-3" 
                          rows="3"
                          placeholder="Describe tu producto..."
                          value={currentProduct.descripcion} 
                          onChange={e => setCurrentProduct({...currentProduct, descripcion: e.target.value})} 
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">
                          <DollarSign size={14} className="me-1" />
                          Precio (C$)
                        </label>
                        <input 
                          type="number" 
                          className="form-control rounded-3" 
                          placeholder="0.00"
                          value={currentProduct.precio} 
                          onChange={e => setCurrentProduct({...currentProduct, precio: e.target.value})} 
                          required 
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">
                          <Tag size={14} className="me-1" />
                          Categoría
                        </label>
                        <select 
                          className="form-select rounded-3" 
                          value={currentProduct.categoria} 
                          onChange={e => setCurrentProduct({...currentProduct, categoria: e.target.value})}
                        >
                          {categorias.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-bold text-muted">
                          <Upload size={14} className="me-1" />
                          Imagen del producto
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control rounded-3"
                          onChange={handleImageChange}
                        />
                        <small className="text-muted">Formatos: JPG, PNG, GIF. Máx 2MB</small>
                      </div>

                      {(imagenPreview || currentProduct.imagen_url) && (
                        <div className="col-12">
                          <label className="form-label small fw-bold text-muted">Previsualización</label>
                          <div className="bg-white rounded-3 p-2 text-center">
                            <img
                              src={imagenPreview || currentProduct.imagen_url}
                              alt="Previsualización"
                              className="img-fluid rounded-3"
                              style={{ maxHeight: '180px', objectFit: 'cover' }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="col-12">
                        <div className="bg-white p-3 rounded-3 border">
                          <div className="form-check form-switch">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              id="disponibleSwitch"
                              checked={currentProduct.disponible} 
                              onChange={e => setCurrentProduct({...currentProduct, disponible: e.target.checked})} 
                            />
                            <label className="form-check-label fw-bold" htmlFor="disponibleSwitch">
                              Producto disponible para venta
                            </label>
                          </div>
                          <small className="text-muted">Si está disponible, aparecerá en el catálogo</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer border-0 p-4" style={{ background: '#f8f9fa' }}>
                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>
                      Cancelar
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="btn btn-danger rounded-pill px-4 fw-bold"
                      disabled={animating}
                    >
                      {animating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          {editingId ? 'Actualizar Producto' : 'Crear Producto'}
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />

      <style>{`
        .producto-row {
          transition: all 0.2s ease;
        }
        .producto-row:hover {
          background: #f8f9fa;
        }
        .producto-imagen img {
          transition: transform 0.2s ease;
        }
        .producto-row:hover .producto-imagen img {
          transform: scale(1.05);
        }
        .btn-close-white {
          background: rgba(255,255,255,0.2);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .btn-close-white:hover {
          background: rgba(255,255,255,0.3);
        }
      `}</style>
    </motion.div>
  );
};

export default ProductosView;