import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../database/supabaseconfig";
import { Plus, Package, Search, Filter, AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown } from "lucide-react";

import ModalRegistroIngrediente from "../../../components/ingredientes/ModalRegistroIngrediente";
import ModalEdicionIngrediente from "../../../components/ingredientes/ModalEdicionIngrediente";
import ModalEliminacionIngrediente from "../../../components/ingredientes/ModalEliminacionIngrediente";
import TablaIngredientes from "../../../components/ingredientes/TablaIngredientes";
import TarjetasIngredientes from "../../../components/ingredientes/TarjetasIngredientes";

import NotificacionOperacion from "../../../components/NotificacionOperacion";
import CuadroBusquedas from "../../../components/busquedas/CuadroBusquedas";
import Paginacion from "../../../components/Paginacion";

const IngredientesView = () => {
  const [ingredientes, setIngredientes] = useState([]);
  const [ingredientesFiltrados, setIngredientesFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);

  const [nuevoIngrediente, setNuevoIngrediente] = useState({
    nombre: "",
    unidad: "",
    stock: 0,
    stock_minimo: 0,
    fecha_vencimiento: "",
  });

  const [ingredienteEditar, setIngredienteEditar] = useState({
    id: "",
    nombre: "",
    unidad: "",
    stock: 0,
    stock_minimo: 0,
    fecha_vencimiento: "",
    actualizado_en: "",
  });

  const [ingredienteEliminar, setIngredienteEliminar] = useState(null);

  const [toast, setToast] = useState({
    mostrar: false,
    mensaje: "",
    tipo: "",
  });

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    stockBajo: 0,
    sinStock: 0,
    valorTotal: 0
  });

  const cargarIngredientes = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("ingredientes")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) throw error;
      setIngredientes(data || []);
      setIngredientesFiltrados(data || []);
      
      // Calcular estadísticas
      const total = data?.length || 0;
      const stockBajo = data?.filter(i => i.stock > 0 && i.stock <= i.stock_minimo).length || 0;
      const sinStock = data?.filter(i => i.stock === 0).length || 0;
      
      setStats({ total, stockBajo, sinStock, valorTotal: 0 });
    } catch (err) {
      console.error("Error al cargar ingredientes:", err);
      setToast({ mostrar: true, mensaje: "Error al cargar ingredientes", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarIngredientes();
  }, []);

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setIngredientesFiltrados(ingredientes);
    } else {
      const textoLower = textoBusqueda.toLowerCase();
      const filtrados = ingredientes.filter((ing) => {
        return (
          ing.nombre?.toLowerCase().includes(textoLower) ||
          ing.unidad?.toLowerCase().includes(textoLower)
        );
      });
      setIngredientesFiltrados(filtrados);
    }
    setPaginaActual(1);
  }, [textoBusqueda, ingredientes]);

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoIngrediente((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setIngredienteEditar((prev) => ({ ...prev, [name]: value }));
  };

  const abrirModalEdicion = (ingrediente) => {
    setIngredienteEditar({
      id: ingrediente.id,
      nombre: ingrediente.nombre,
      unidad: ingrediente.unidad,
      stock: ingrediente.stock || 0,
      stock_minimo: ingrediente.stock_minimo || 0,
      fecha_vencimiento: ingrediente.fecha_vencimiento || "",
      actualizado_en: ingrediente.actualizado_en,
    });
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (ingrediente) => {
    setIngredienteEliminar(ingrediente);
    setMostrarModalEliminacion(true);
  };

  const agregarIngrediente = async () => {
    try {
      if (!nuevoIngrediente.nombre?.trim()) throw new Error("El nombre es obligatorio");
      if (!nuevoIngrediente.unidad) throw new Error("La unidad es obligatoria");

      const { error } = await supabase.from("ingredientes").insert([{
        nombre: nuevoIngrediente.nombre.trim(),
        unidad: nuevoIngrediente.unidad,
        stock: Number(nuevoIngrediente.stock) || 0,
        stock_minimo: Number(nuevoIngrediente.stock_minimo) || 0,
        fecha_vencimiento: nuevoIngrediente.fecha_vencimiento || null,
      }]);

      if (error) throw error;

      setMostrarModal(false);
      setNuevoIngrediente({ nombre: "", unidad: "", stock: 0, stock_minimo: 0, fecha_vencimiento: "" });
      setToast({ mostrar: true, mensaje: "Ingrediente agregado exitosamente", tipo: "exito" });
      await cargarIngredientes();
    } catch (err) {
      setToast({ mostrar: true, mensaje: err.message, tipo: "error" });
    }
  };

  const actualizarIngrediente = async () => {
    try {
      if (!ingredienteEditar.nombre?.trim()) throw new Error("El nombre es obligatorio");

      const { error } = await supabase
        .from("ingredientes")
        .update({
          nombre: ingredienteEditar.nombre.trim(),
          unidad: ingredienteEditar.unidad,
          stock: Number(ingredienteEditar.stock) || 0,
          stock_minimo: Number(ingredienteEditar.stock_minimo) || 0,
          fecha_vencimiento: ingredienteEditar.fecha_vencimiento || null,
          actualizado_en: new Date(),
        })
        .eq("id", ingredienteEditar.id);

      if (error) throw error;

      setMostrarModalEdicion(false);
      setToast({ mostrar: true, mensaje: "Ingrediente actualizado correctamente", tipo: "exito" });
      await cargarIngredientes();
    } catch (err) {
      setToast({ mostrar: true, mensaje: err.message, tipo: "error" });
    }
  };

  const eliminarIngrediente = async () => {
    try {
      const { error } = await supabase
        .from("ingredientes")
        .delete()
        .eq("id", ingredienteEliminar.id);

      if (error) throw error;

      setMostrarModalEliminacion(false);
      setToast({ mostrar: true, mensaje: "Ingrediente eliminado correctamente", tipo: "exito" });
      await cargarIngredientes();
    } catch (err) {
      setToast({ mostrar: true, mensaje: err.message, tipo: "error" });
    }
  };

  const indiceUltimoRegistro = paginaActual * registrosPorPagina;
  const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
  const ingredientesPaginados = ingredientesFiltrados.slice(indicePrimerRegistro, indiceUltimoRegistro);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container-fluid py-4"
    >
      {/* Header con estadísticas */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-4 shadow-sm"
            style={{ borderRadius: '24px', border: '1px solid rgba(220, 53, 69, 0.1)' }}
          >
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div className="bg-danger bg-opacity-10 rounded-circle p-2">
                    <Package size={28} color="#dc3545" />
                  </div>
                  <h3 className="fw-bold mb-0 text-dark">Gestión de Ingredientes</h3>
                  <span className="badge bg-danger rounded-pill px-3 py-2">
                    {stats.total} Ingredientes
                  </span>
                </div>
                <p className="text-muted small mb-0">Administra el inventario de ingredientes y controla tu stock</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-danger rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
                onClick={() => setMostrarModal(true)}
              >
                <Plus size={18} />
                Nuevo Ingrediente
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-3 rounded-4 shadow-sm"
            style={{ borderRadius: '16px' }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted small mb-1">Total Ingredientes</h6>
                <h3 className="fw-bold mb-0">{stats.total}</h3>
              </div>
              <div className="bg-info bg-opacity-10 rounded-circle p-3">
                <Package size={24} color="#17a2b8" />
              </div>
            </div>
          </motion.div>
        </div>
        <div className="col-md-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-3 rounded-4 shadow-sm"
            style={{ borderRadius: '16px' }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted small mb-1">Stock Bajo</h6>
                <h3 className="fw-bold mb-0 text-warning">{stats.stockBajo}</h3>
              </div>
              <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                <TrendingDown size={24} color="#ffc107" />
              </div>
            </div>
          </motion.div>
        </div>
        <div className="col-md-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-3 rounded-4 shadow-sm"
            style={{ borderRadius: '16px' }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted small mb-1">Sin Stock</h6>
                <h3 className="fw-bold mb-0 text-danger">{stats.sinStock}</h3>
              </div>
              <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                <AlertTriangle size={24} color="#dc3545" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tabla de Ingredientes */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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
                  placeholder="Buscar por nombre o unidad..."
                  value={textoBusqueda}
                  onChange={(e) => setTextoBusqueda(e.target.value)}
                  style={{ padding: '12px 16px 12px 40px', border: '1px solid #e9ecef' }}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-2 text-muted small">
                <Filter size={14} />
                <span>{ingredientesFiltrados.length} ingredientes encontrados</span>
              </div>
            </div>
          </div>
        </div>

        {cargando ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="danger" />
            <p className="mt-2 text-muted">Cargando ingredientes...</p>
          </div>
        ) : (
          <>
            {textoBusqueda && ingredientesFiltrados.length === 0 && (
              <div className="text-center py-5">
                <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
                  <Search size={32} className="text-muted" />
                </div>
                <p className="text-muted mb-0">No se encontraron ingredientes para "{textoBusqueda}"</p>
              </div>
            )}

            {ingredientesFiltrados.length > 0 ? (
              <>
                <div className="d-none d-lg-block">
                  <TablaIngredientes
                    ingredientes={ingredientesPaginados}
                    abrirModalEdicion={abrirModalEdicion}
                    abrirModalEliminacion={abrirModalEliminacion}
                  />
                </div>
                <div className="d-block d-lg-none p-3">
                  <TarjetasIngredientes
                    ingredientes={ingredientesPaginados}
                    abrirModalEdicion={abrirModalEdicion}
                    abrirModalEliminacion={abrirModalEliminacion}
                  />
                </div>

                <div className="p-3 border-top">
                  <Paginacion
                    registrosPorPagina={registrosPorPagina}
                    totalRegistros={ingredientesFiltrados.length}
                    paginaActual={paginaActual}
                    establecerPaginaActual={setPaginaActual}
                    establecerRegistrosPorPagina={setRegistrosPorPagina}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-5">
                <div className="bg-light rounded-circle d-inline-flex p-3 mb-3">
                  <Package size={32} className="text-muted" />
                </div>
                <h5 className="mt-3">No hay ingredientes registrados</h5>
                <p className="text-muted mb-3">Comienza agregando tu primer ingrediente</p>
                <button 
                  className="btn btn-danger rounded-pill px-4"
                  onClick={() => setMostrarModal(true)}
                >
                  <Plus size={16} className="me-2" />
                  Agregar Ingrediente
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Modales */}
      <ModalRegistroIngrediente
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoIngrediente={nuevoIngrediente}
        manejoCambioInput={manejoCambioInput}
        agregarIngrediente={agregarIngrediente}
      />

      <ModalEdicionIngrediente
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        ingredienteEditar={ingredienteEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        actualizarIngrediente={actualizarIngrediente}
      />

      <ModalEliminacionIngrediente
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarIngrediente={eliminarIngrediente}
        ingrediente={ingredienteEliminar}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </motion.div>
  );
};

export default IngredientesView;