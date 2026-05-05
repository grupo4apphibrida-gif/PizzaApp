import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { supabase } from "../../../database/supabaseconfig";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from "recharts";

const ReportesAdminView = () => {
  const [loading, setLoading] = useState(true);
  const [topProductos, setTopProductos] = useState([]);
  const [ventasPorDia, setVentasPorDia] = useState([]);
  const [ingresosTotales, setIngresosTotales] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [pedidosPorEstado, setPedidosPorEstado] = useState([]);

  const COLORS = ["#dc3545", "#ffc107", "#198754", "#0d6efd", "#fd7e14"];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Top productos más vendidos
      const { data: topData } = await supabase
        .from("detalle_pedido")
        .select("productos(nombre_producto), cantidad")
        .limit(100);
      
      const productosCount = {};
      topData?.forEach(item => {
        const nombre = item.productos?.nombre_producto;
        if (nombre) {
          productosCount[nombre] = (productosCount[nombre] || 0) + item.cantidad;
        }
      });
      
      const topArray = Object.entries(productosCount)
        .map(([name, cantidad]) => ({ name, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10);
      setTopProductos(topArray);

      // Ventas por día (últimos 7 días)
      const { data: pedidosData } = await supabase
        .from("pedidos")
        .select("creado_en, total")
        .eq("estado", "entregado")
        .gte("creado_en", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      const ventasPorDiaMap = {};
      pedidosData?.forEach(pedido => {
        const fecha = new Date(pedido.creado_en).toLocaleDateString();
        ventasPorDiaMap[fecha] = (ventasPorDiaMap[fecha] || 0) + Number(pedido.total || 0);
      });
      
      const ventasArray = Object.entries(ventasPorDiaMap).map(([fecha, total]) => ({ fecha, total }));
      setVentasPorDia(ventasArray);

      // Totales generales
      const { data: todosPedidos } = await supabase
        .from("pedidos")
        .select("total, estado");
      
      let totalIngresos = 0;
      let contadorPedidos = 0;
      const estadoCount = {};

      todosPedidos?.forEach(pedido => {
        if (pedido.estado === "entregado") {
          totalIngresos += Number(pedido.total || 0);
        }
        contadorPedidos++;
        estadoCount[pedido.estado] = (estadoCount[pedido.estado] || 0) + 1;
      });

      setIngresosTotales(totalIngresos);
      setTotalPedidos(contadorPedidos);
      
      const estadoArray = Object.entries(estadoCount).map(([name, value]) => ({ name, value }));
      setPedidosPorEstado(estadoArray);

    } catch (error) {
      console.error("Error cargando reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p>Cargando estadísticas...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">
        <i className="bi bi-graph-up me-2"></i>
        Dashboard de Reportes
      </h2>

      {/* Tarjetas de resumen */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="bg-primary text-white">
            <Card.Body>
              <h5>Ingresos Totales</h5>
              <h2>C$ {ingresosTotales.toFixed(2)}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="bg-success text-white">
            <Card.Body>
              <h5>Total Pedidos</h5>
              <h2>{totalPedidos}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="bg-warning text-dark">
            <Card.Body>
              <h5>Productos Más Vendidos</h5>
              <h2>{topProductos[0]?.name || "N/A"}</h2>
              <small>Top 1</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={7} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header>
              <h5><i className="bi bi-bar-chart me-2"></i>Top 10 Productos Más Vendidos</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topProductos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cantidad" fill="#dc3545" name="Cantidad vendida" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header>
              <h5><i className="bi bi-pie-chart me-2"></i>Pedidos por Estado</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pedidosPorEstado}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pedidosPorEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={12} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header>
              <h5><i className="bi bi-graph-up me-2"></i>Ventas (Últimos 7 días)</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={ventasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip formatter={(value) => `C$ ${value.toFixed(2)}`} />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#dc3545" name="Ventas (C$)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ReportesAdminView;