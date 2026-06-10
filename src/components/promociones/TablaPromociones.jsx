import React, { useState } from "react";
import { Table, Spinner, Button, Badge } from "react-bootstrap";
import { motion } from "framer-motion";
import { Edit, Trash2, Eye, EyeOff, Clock, Calendar, Tag } from "lucide-react";

const TablaPromociones = ({
  promociones = [],
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  const [loading, setLoading] = useState(false);

  const isActiva = (promocion) => {
    if (!promocion.activa) return false;
    if (promocion.fecha_inicio && new Date(promocion.fecha_inicio) > new Date()) return false;
    if (promocion.fecha_fin && new Date(promocion.fecha_fin) < new Date()) return false;
    return true;
  };

  const getEstadoInfo = (promocion) => {
    const activa = isActiva(promocion);
    if (!promocion.activa) return { text: "Inactiva", variant: "secondary", icon: <EyeOff size={12} /> };
    if (!activa) return { text: "Expirada", variant: "danger", icon: <Clock size={12} /> };
    return { text: "Activa", variant: "success", icon: <Eye size={12} /> };
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="danger" />
        <p className="mt-3 text-muted">Cargando promociones...</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table striped hover className="mb-0 align-middle">
        <thead className="bg-light">
          <tr>
            <th style={{ width: '80px' }}>Imagen</th>
            <th>Título</th>
            <th>Descuento</th>
            <th>Vigencia</th>
            <th>Estado</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {promociones.map((prom, idx) => {
            const activa = isActiva(prom);
            const estadoInfo = getEstadoInfo(prom);
            return (
              <motion.tr
                key={prom.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <td>
                  <img
                    src={prom.imagen_url || 'https://via.placeholder.com/50?text=Promo'}
                    alt={prom.titulo}
                    className="rounded-3"
                    style={{ width: 50, height: 50, objectFit: 'cover' }}
                  />
                </td>
                <td>
                  <div className="fw-semibold">{prom.titulo}</div>
                  <small className="text-muted">{prom.descripcion?.substring(0, 50)}</small>
                </td>
                <td>
                  <Badge bg="warning" className="text-dark px-3 py-2 rounded-pill">
                    <Tag size={12} className="me-1" />
                    {prom.descuento}% OFF
                  </Badge>
                </td>
                <td>
                  <div className="small">
                    <div className="d-flex align-items-center gap-1">
                      <Calendar size={12} className="text-muted" />
                      {prom.fecha_inicio ? new Date(prom.fecha_inicio).toLocaleDateString() : "Siempre"}
                    </div>
                    <div className="d-flex align-items-center gap-1 mt-1">
                      <Calendar size={12} className="text-muted" />
                      {prom.fecha_fin ? new Date(prom.fecha_fin).toLocaleDateString() : "Siempre"}
                    </div>
                  </div>
                </td>
                <td>
                  <Badge bg={estadoInfo.variant} className="px-3 py-2 rounded-pill">
                    {estadoInfo.icon}
                    <span className="ms-1">{estadoInfo.text}</span>
                  </Badge>
                </td>
                <td className="text-center">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="me-2 rounded-circle"
                    style={{ width: '32px', height: '32px' }}
                    onClick={() => abrirModalEdicion(prom)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="rounded-circle"
                    style={{ width: '32px', height: '32px' }}
                    onClick={() => abrirModalEliminacion(prom)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default TablaPromociones;