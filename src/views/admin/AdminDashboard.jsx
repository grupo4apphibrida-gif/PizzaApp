import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../../database/supabaseconfig";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalProductos: 0,
    totalPedidos: 0,
    totalIngresos: 0,
  });
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);

      // Obtener estadísticas
      const [usuariosRes, productosRes, pedidosRes] = await Promise.all([
        supabase.from("usuarios").select("id", { count: "exact", head: true }),
        supabase.from("productos").select("id", { count: "exact", head: true }),
        supabase.from("pedidos").select("id, total", { count: "exact" }),
      ]);

      const totalUsuarios = usuariosRes.count || 0;
      const totalProductos = productosRes.count || 0;
      const totalPedidos = pedidosRes.count || 0;
      const totalIngresos = pedidosRes.data?.reduce((sum, pedido) => sum + (pedido.total || 0), 0) || 0;

      setStats({
        totalUsuarios,
        totalProductos,
        totalPedidos,
        totalIngresos: totalIngresos.toFixed(2),
      });
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setCargando(false);
    }
  };

  const tarjetasEstadisticas = [
    {
      titulo: "Total Usuarios",
      valor: stats.totalUsuarios,
      icono: "👥",
      color: "primary",
      ruta: "/admin/usuarios",
    },
    {
      titulo: "Total Productos",
      valor: stats.totalProductos,
      icono: "🍕",
      color: "success",
      ruta: "/admin/productos",
    },
    {
      titulo: "Pedidos Hoy",
      valor: stats.totalPedidos,
      icono: "📦",
      color: "warning",
      ruta: "/admin/pedidos",
    },
    {
      titulo: "Ingresos Totales",
      valor: `C$ ${stats.totalIngresos}`,
      icono: "💰",
      color: "danger",
      ruta: "/admin/reportes",
    },
  ];

  const accionesRapidas = [
    {
      titulo: "Agregar Producto",
      descripcion: "Crear nuevo producto en el menú",
      icono: "➕",
      ruta: "/admin/productos",
      color: "success",
    },
    {
      titulo: "Gestionar Usuarios",
      descripcion: "Ver y administrar usuarios",
      icono: "👤",
      ruta: "/admin/usuarios",
      color: "primary",
    },
    {
      titulo: "Ver Pedidos",
      descripcion: "Revisar pedidos pendientes",
      icono: "📋",
      ruta: "/admin/pedidos",
      color: "warning",
    },
    {
      titulo: "Reportes",
      descripcion: "Ver estadísticas y reportes",
      icono: "📊",
      ruta: "/admin/reportes",
      color: "info",
    },
  ];

  if (cargando) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" size="lg" />
        <p className="mt-3">Cargando dashboard...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h1 className="display-5 fw-bold text-danger mb-3">
          <i className="bi bi-speedometer2 me-3"></i>
          Panel de Administración
        </h1>
        <p className="text-muted lead">
          Gestiona tu pizzería de manera eficiente
        </p>
      </div>

      {/* Estadísticas */}
      <Row className="mb-5">
        {tarjetasEstadisticas.map((stat, index) => (
          <Col key={index} xs={12} sm={6} lg={3} className="mb-4">
            <Card
              className={`h-100 border-0 shadow-sm hover-card cursor-pointer`}
              onClick={() => navigate(stat.ruta)}
              style={{ cursor: "pointer" }}
            >
              <Card.Body className="text-center p-4">
                <div className={`text-${stat.color} mb-3`} style={{ fontSize: "2.5rem" }}>
                  {stat.icono}
                </div>
                <h3 className={`text-${stat.color} fw-bold mb-2`}>{stat.valor}</h3>
                <p className="text-muted mb-0 small">{stat.titulo}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Acciones Rápidas */}
      <Row>
        <Col xs={12}>
          <h3 className="mb-4">
            <i className="bi bi-lightning-charge me-2 text-warning"></i>
            Acciones Rápidas
          </h3>
        </Col>
        {accionesRapidas.map((accion, index) => (
          <Col key={index} xs={12} sm={6} lg={3} className="mb-4">
            <Card
              className="h-100 border-0 shadow-sm hover-card cursor-pointer"
              onClick={() => navigate(accion.ruta)}
              style={{ cursor: "pointer" }}
            >
              <Card.Body className="text-center p-4">
                <div className={`text-${accion.color} mb-3`} style={{ fontSize: "2rem" }}>
                  {accion.icono}
                </div>
                <h5 className="fw-bold mb-2">{accion.titulo}</h5>
                <p className="text-muted small mb-3">{accion.descripcion}</p>
                <Button variant={accion.color} size="sm" className="w-100">
                  Ir a {accion.titulo}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <style jsx>{`
        .hover-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </Container>
  );
};

export default AdminDashboard;