import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import { supabase } from "../../database/supabaseconfig";
import { useNavigate } from "react-router-dom";
import { 
  Users, Pizza, ShoppingBag, DollarSign, TrendingUp, TrendingDown,
  PlusCircle, UserPlus, ClipboardList, BarChart3, Clock, CheckCircle,
  XCircle, Package, AlertCircle, ArrowRight, Calendar
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalProductos: 0,
    totalPedidos: 0,
    totalIngresos: 0,
    pedidosHoy: 0,
    pedidosPendientes: 0,
    pedidosEnPreparacion: 0,
    pedidosEntregados: 0,
    pedidosCancelados: 0,
    productosBajoStock: 0,
    ventasSemana: 0,
    ventasMes: 0,
    crecimiento: 0
  });
  const [cargando, setCargando] = useState(true);
  const [ultimosPedidos, setUltimosPedidos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    cargarEstadisticas();
    cargarUltimosPedidos();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);

      // Obtener estadísticas básicas
      const [usuariosRes, productosRes, pedidosRes] = await Promise.all([
        supabase.from("usuarios").select("id", { count: "exact", head: true }),
        supabase.from("productos").select("id", { count: "exact", head: true }),
        supabase.from("pedidos").select("id, total, estado, creado_en"),
      ]);

      const totalUsuarios = usuariosRes.count || 0;
      const totalProductos = productosRes.count || 0;
      const pedidos = pedidosRes.data || [];
      const totalPedidos = pedidos.length;
      
      // Ingresos totales (solo pedidos entregados)
      const totalIngresos = pedidos
        .filter(p => p.estado === "entregado")
        .reduce((sum, pedido) => sum + (pedido.total || 0), 0);

      // Pedidos de hoy
      const hoy = new Date().toISOString().split('T')[0];
      const pedidosHoy = pedidos.filter(p => p.creado_en?.split('T')[0] === hoy).length;
      
      // Pedidos por estado
      const pedidosPendientes = pedidos.filter(p => p.estado === "pendiente").length;
      const pedidosEnPreparacion = pedidos.filter(p => p.estado === "en_preparacion").length;
      const pedidosEntregados = pedidos.filter(p => p.estado === "entregado").length;
      const pedidosCancelados = pedidos.filter(p => p.estado === "cancelado").length;
      
      // Ventas de la semana
      const fechaSemana = new Date();
      fechaSemana.setDate(fechaSemana.getDate() - 7);
      const ventasSemana = pedidos
        .filter(p => p.estado === "entregado" && new Date(p.creado_en) >= fechaSemana)
        .reduce((sum, p) => sum + (p.total || 0), 0);
      
      // Ventas del mes
      const fechaMes = new Date();
      fechaMes.setDate(fechaMes.getDate() - 30);
      const ventasMes = pedidos
        .filter(p => p.estado === "entregado" && new Date(p.creado_en) >= fechaMes)
        .reduce((sum, p) => sum + (p.total || 0), 0);
      
      // Crecimiento (comparativa mes anterior)
      const fechaMesAnterior = new Date();
      fechaMesAnterior.setDate(fechaMesAnterior.getDate() - 60);
      const ventasMesAnterior = pedidos
        .filter(p => p.estado === "entregado" && new Date(p.creado_en) >= fechaMesAnterior && new Date(p.creado_en) < fechaMes)
        .reduce((sum, p) => sum + (p.total || 0), 0);
      
      const crecimiento = ventasMesAnterior > 0 ? ((ventasMes - ventasMesAnterior) / ventasMesAnterior * 100).toFixed(0) : 0;

      // Productos con stock bajo
      const { data: productos, error: prodError } = await supabase
        .from("productos")
        .select("stock, stock_minimo");
      
      let productosBajoStock = 0;
      if (!prodError && productos) {
        productosBajoStock = productos.filter(p => (p.stock || 0) <= (p.stock_minimo || 0)).length;
      }

      setStats({
        totalUsuarios,
        totalProductos,
        totalPedidos,
        totalIngresos: totalIngresos.toFixed(2),
        pedidosHoy,
        pedidosPendientes,
        pedidosEnPreparacion,
        pedidosEntregados,
        pedidosCancelados,
        productosBajoStock,
        ventasSemana: ventasSemana.toFixed(2),
        ventasMes: ventasMes.toFixed(2),
        crecimiento
      });
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setCargando(false);
    }
  };

  const cargarUltimosPedidos = async () => {
    try {
      const { data, error } = await supabase
        .from("pedidos")
        .select("id, total, estado, creado_en, nombre_cliente")
        .order("creado_en", { ascending: false })
        .limit(5);

      if (!error && data) {
        setUltimosPedidos(data);
      }
    } catch (error) {
      console.error("Error cargando últimos pedidos:", error);
    }
  };

  const getEstadoBadge = (estado) => {
    const config = {
      pendiente: { variant: "warning", icon: <Clock size={12} />, text: "Pendiente" },
      en_preparacion: { variant: "info", icon: <Package size={12} />, text: "En Preparación" },
      entregado: { variant: "success", icon: <CheckCircle size={12} />, text: "Entregado" },
      cancelado: { variant: "danger", icon: <XCircle size={12} />, text: "Cancelado" }
    };
    const conf = config[estado] || config.pendiente;
    return <Badge bg={conf.variant} className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>{conf.icon}<span>{conf.text}</span></Badge>;
  };

  const tarjetasEstadisticas = [
    {
      titulo: "Usuarios",
      valor: stats.totalUsuarios,
      icono: <Users size={28} />,
      color: "primary",
      bgColor: "#0d6efd",
      ruta: "/admin/usuarios",
      subtitulo: "registrados"
    },
    {
      titulo: "Productos",
      valor: stats.totalProductos,
      icono: <Pizza size={28} />,
      color: "success",
      bgColor: "#198754",
      ruta: "/admin/productos",
      subtitulo: "en el menú"
    },
    {
      titulo: "Pedidos",
      valor: stats.totalPedidos,
      icono: <ShoppingBag size={28} />,
      color: "warning",
      bgColor: "#ffc107",
      ruta: "/admin/pedidos",
      subtitulo: "totales"
    },
    {
      titulo: "Ingresos",
      valor: `C$ ${stats.totalIngresos}`,
      icono: <DollarSign size={28} />,
      color: "danger",
      bgColor: "#dc3545",
      ruta: "/admin/reportes",
      subtitulo: "totales"
    }
  ];

  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Spinner animation="border" variant="danger" size="lg" />
        </motion.div>
        <p className="mt-3 text-muted">Cargando dashboard...</p>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container-fluid py-4"
    >
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="display-5 fw-bold text-danger mb-2">
              <i className="bi bi-speedometer2 me-3"></i>
              Panel de Administración
            </h1>
            <p className="text-muted lead mb-0">
              Gestiona tu pizzería de manera eficiente
            </p>
          </div>
          <div className="d-flex gap-2">
            <Badge bg="light" text="dark" className="rounded-pill px-3 py-2">
              <Calendar size={14} className="me-1" />
              {new Date().toLocaleDateString()}
            </Badge>
            <Badge bg={stats.crecimiento >= 0 ? "success" : "danger"} className="rounded-pill px-3 py-2">
              {stats.crecimiento >= 0 ? <TrendingUp size={14} className="me-1" /> : <TrendingDown size={14} className="me-1" />}
              {stats.crecimiento >= 0 ? `+${stats.crecimiento}%` : `${stats.crecimiento}%`} vs mes anterior
            </Badge>
          </div>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Principales */}
      <Row className="g-4 mb-5">
        {tarjetasEstadisticas.map((stat, index) => (
          <Col key={index} xs={12} sm={6} lg={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="h-100 border-0 shadow-sm hover-card"
                style={{ borderRadius: '20px', cursor: 'pointer' }}
                onClick={() => navigate(stat.ruta)}
              >
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 className="text-muted mb-1 small">{stat.titulo}</h6>
                      <h2 className="fw-bold mb-0">{stat.valor}</h2>
                      <small className="text-muted">{stat.subtitulo}</small>
                    </div>
                    <div className="rounded-circle p-2" style={{ background: `${stat.bgColor}15` }}>
                      <div style={{ color: stat.bgColor }}>{stat.icono}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Button 
                      variant="link" 
                      className="p-0 text-decoration-none d-flex align-items-center gap-1"
                      style={{ color: stat.bgColor }}
                    >
                      Ver detalles <ArrowRight size={14} />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Segunda fila de estadísticas - Estado de Pedidos */}
      <Row className="g-4 mb-5">
        <Col xs={12}>
          <h5 className="mb-3 fw-bold d-flex align-items-center gap-2">
            <ClipboardList size={20} />
            Estado de Pedidos
          </h5>
        </Col>
        <Col xs={6} sm={4} lg={2}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '20px' }}>
            <Card.Body className="p-3 text-center">
              <h6 className="text-muted small mb-1">Hoy</h6>
              <h3 className="fw-bold mb-0 text-warning">{stats.pedidosHoy}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} sm={4} lg={2}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '20px' }}>
            <Card.Body className="p-3 text-center">
              <h6 className="text-muted small mb-1">Pendientes</h6>
              <h3 className="fw-bold mb-0 text-info">{stats.pedidosPendientes}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} sm={4} lg={2}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '20px' }}>
            <Card.Body className="p-3 text-center">
              <h6 className="text-muted small mb-1">En Preparación</h6>
              <h3 className="fw-bold mb-0 text-primary">{stats.pedidosEnPreparacion}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} sm={4} lg={2}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '20px' }}>
            <Card.Body className="p-3 text-center">
              <h6 className="text-muted small mb-1">Entregados</h6>
              <h3 className="fw-bold mb-0 text-success">{stats.pedidosEntregados}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} sm={4} lg={2}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '20px' }}>
            <Card.Body className="p-3 text-center">
              <h6 className="text-muted small mb-1">Cancelados</h6>
              <h3 className="fw-bold mb-0 text-danger">{stats.pedidosCancelados}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} sm={4} lg={2}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '20px' }}>
            <Card.Body className="p-3 text-center">
              <h6 className="text-muted small mb-1">Stock Bajo</h6>
              <h3 className="fw-bold mb-0 text-danger">{stats.productosBajoStock}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tercera fila - Ventas */}
      <Row className="g-4 mb-5">
        <Col xs={12}>
          <h5 className="mb-3 fw-bold d-flex align-items-center gap-2">
            <DollarSign size={20} />
            Resumen de Ventas
          </h5>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #28a745, #34ce57)' }}>
            <Card.Body className="text-white p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="opacity-75 mb-1">Ventas de la Semana</h6>
                  <h2 className="fw-bold mb-0">C$ {stats.ventasSemana}</h2>
                </div>
                <TrendingUp size={32} className="opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #17a2b8, #20c997)' }}>
            <Card.Body className="text-white p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="opacity-75 mb-1">Ventas del Mes</h6>
                  <h2 className="fw-bold mb-0">C$ {stats.ventasMes}</h2>
                </div>
                <Calendar size={32} className="opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Últimos Pedidos */}
      <Row className="mb-5">
        <Col xs={12}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '24px' }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <ClipboardList size={20} />
                  Últimos Pedidos
                </h5>
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  className="rounded-pill"
                  onClick={() => navigate("/admin/pedidos")}
                >
                  Ver todos
                </Button>
              </div>
              
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th className="py-3">ID</th>
                      <th>Cliente</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimosPedidos.length > 0 ? (
                      ultimosPedidos.map((pedido, idx) => (
                        <motion.tr
                          key={pedido.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <td className="fw-semibold">{pedido.id?.substring(0, 8)}</td>
                          <td>{pedido.nombre_cliente || "Invitado"}</td>
                          <td className="fw-bold text-danger">C$ {pedido.total?.toFixed(2)}</td>
                          <td>{getEstadoBadge(pedido.estado)}</td>
                          <td className="text-muted small">
                            {new Date(pedido.creado_en).toLocaleString()}
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No hay pedidos recientes
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Acciones Rápidas */}
      <Row>
        <Col xs={12}>
          <h5 className="mb-3 fw-bold d-flex align-items-center gap-2">
            <i className="bi bi-lightning-charge"></i>
            Acciones Rápidas
          </h5>
        </Col>
        <Col xs={12}>
          <div className="row g-3">
            <div className="col-md-3 col-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-outline-success w-100 py-3 rounded-4 d-flex flex-column align-items-center gap-2"
                onClick={() => navigate("/admin/productos")}
              >
                <PlusCircle size={24} />
                <span className="fw-bold small">Agregar Producto</span>
              </motion.button>
            </div>
            <div className="col-md-3 col-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-outline-primary w-100 py-3 rounded-4 d-flex flex-column align-items-center gap-2"
                onClick={() => navigate("/admin/usuarios")}
              >
                <UserPlus size={24} />
                <span className="fw-bold small">Agregar Usuario</span>
              </motion.button>
            </div>
            <div className="col-md-3 col-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-outline-warning w-100 py-3 rounded-4 d-flex flex-column align-items-center gap-2"
                onClick={() => navigate("/admin/pedidos")}
              >
                <ClipboardList size={24} />
                <span className="fw-bold small">Ver Pedidos</span>
              </motion.button>
            </div>
            <div className="col-md-3 col-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-outline-danger w-100 py-3 rounded-4 d-flex flex-column align-items-center gap-2"
                onClick={() => navigate("/admin/reportes")}
              >
                <BarChart3 size={24} />
                <span className="fw-bold small">Ver Reportes</span>
              </motion.button>
            </div>
          </div>
        </Col>
      </Row>

      <style>{`
        .hover-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12) !important;
        }
      `}</style>
    </motion.div>
  );
};

// ✅ SOLO UN EXPORT DEFAULT - ¡CORREGIDO!
export default AdminDashboard;