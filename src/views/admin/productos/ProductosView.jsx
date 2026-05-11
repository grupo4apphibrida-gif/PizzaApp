import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../../services/api';

const convertFileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ProductosView = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({ 
    nombre: '', descripcion: '', precio: '', categoria: 'pizzas', imagen_url: '', disponible: true 
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagenFile, setImagenFile] = useState(null);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const productos = await getProducts();
      setProducts(productos || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProduct(editingId, currentProduct);
      } else {
        await createProduct(currentProduct);
      }
      await cargarProductos();
      setShowModal(false);
      setEditingId(null);
      setCurrentProduct({ nombre: '', descripcion: '', precio: '', categoria: 'pizzas', imagen_url: '', disponible: true });
      setImagenFile(null);
    } catch (error) {
      console.error('Error guardando producto:', error);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await convertFileToBase64(file);
    setImagenFile(file);
    setCurrentProduct((prev) => ({ ...prev, imagen_url: base64 }));
  };

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setImagenFile(null);
    setEditingId(product.id);
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await deleteProduct(productId);
      await cargarProductos();
    } catch (error) {
      console.error('Error eliminando producto:', error);
    }
  };

  return (
    <motion.div 
      key="productos"
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
                setCurrentProduct({ nombre: '', descripcion: '', precio: '', categoria: 'pizzas', imagen_url: '', disponible: true });
                setEditingId(null);
                setShowModal(true);
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
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      <div className="spinner-border text-pizza-red" role="status"></div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">No hay productos registrados aún.</td>
                  </tr>
                ) : products.map(product => (
                  <tr key={product.id}>
                    <td className="py-4 px-4 fw-bold">
                      <div className="d-flex align-items-center gap-3">
                        <img src={product.imagen_url || 'https://via.placeholder.com/50'} className="rounded-3" style={{ width: 45, height: 45, objectFit: 'cover' }} alt="" />
                        {product.nombre}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="badge bg-light text-dark rounded-pill px-3 py-1 text-uppercase x-small">{product.categoria}</span>
                    </td>
                    <td className="py-4 px-4 text-center fw-black text-pizza-red">C${product.precio}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`badge rounded-pill px-3 py-1 text-uppercase x-small ${product.disponible ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                        {product.disponible ? 'Disponible' : 'Agotado'}
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

      {/* Modal de Producto */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 p-4">
                <h5 className="modal-title fw-black">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4 pt-0">
                  <div className="mb-3">
                    <label className="form-label x-small fw-bold text-uppercase text-muted">Nombre</label>
                    <input 
                      type="text" className="form-control rounded-3" 
                      value={currentProduct.nombre} 
                      onChange={e => setCurrentProduct({...currentProduct, nombre: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label x-small fw-bold text-uppercase text-muted">Descripción</label>
                    <textarea 
                      className="form-control rounded-3" 
                      value={currentProduct.descripcion} 
                      onChange={e => setCurrentProduct({...currentProduct, descripcion: e.target.value})} 
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label x-small fw-bold text-uppercase text-muted">Precio (C$)</label>
                      <input 
                        type="number" className="form-control rounded-3" 
                        value={currentProduct.precio} 
                        onChange={e => setCurrentProduct({...currentProduct, precio: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label x-small fw-bold text-uppercase text-muted">Categoría</label>
                      <select 
                        className="form-select rounded-3" 
                        value={currentProduct.categoria} 
                        onChange={e => setCurrentProduct({...currentProduct, categoria: e.target.value})}
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
                    <label className="form-label x-small fw-bold text-uppercase text-muted">Seleccionar imagen</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control rounded-3"
                      onChange={handleImageChange}
                    />
                  </div>
                  {currentProduct.imagen_url && (
                    <div className="mb-3">
                      <label className="form-label x-small fw-bold text-uppercase text-muted">Previsualización</label>
                      <img
                        src={currentProduct.imagen_url}
                        alt="Previsualización"
                        className="img-fluid rounded-3"
                        style={{ maxHeight: '220px', objectFit: 'cover', width: '100%' }}
                      />
                    </div>
                  )}
                  <div className="form-check form-switch mb-3">
                    <input 
                      className="form-check-input" type="checkbox" 
                      checked={currentProduct.disponible} 
                      onChange={e => setCurrentProduct({...currentProduct, disponible: e.target.checked})} 
                    />
                    <label className="form-check-label fw-bold">Disponible para venta</label>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-pizza-primary rounded-pill px-4 shadow-sm">Guardar Cambios</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProductosView;
