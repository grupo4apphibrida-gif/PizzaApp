import React from 'react';
import { Pagination, Form, Row, Col } from 'react-bootstrap';

const Paginacion = ({
  registrosPorPagina = 10,
  totalRegistros = 0,
  paginaActual = 1,
  establecerPaginaActual,
  establecerRegistrosPorPagina,
  opcionesPorPagina = [5, 10, 20, 50]
}) => {
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / registrosPorPagina));

  const cambiarPagina = (page) => {
    if (page >= 1 && page <= totalPaginas) {
      establecerPaginaActual(page);
    }
  };

  const paginas = [];
  const start = Math.max(1, paginaActual - 2);
  const end = Math.min(totalPaginas, start + 4);

  for (let i = start; i <= end; i += 1) {
    paginas.push(i);
  }

  if (totalRegistros === 0) return null;

  return (
    <Row className="align-items-center justify-content-between mt-4">
      <Col xs="auto" className="mb-2 mb-md-0">
        <Pagination className="mb-0">
          <Pagination.Prev disabled={paginaActual === 1} onClick={() => cambiarPagina(paginaActual - 1)} />
          {start > 1 && <Pagination.Item onClick={() => cambiarPagina(1)}>1</Pagination.Item>}
          {start > 2 && <Pagination.Ellipsis />}
          {paginas.map((page) => (
            <Pagination.Item
              key={page}
              active={page === paginaActual}
              onClick={() => cambiarPagina(page)}
            >
              {page}
            </Pagination.Item>
          ))}
          {end < totalPaginas - 1 && <Pagination.Ellipsis />}
          {end < totalPaginas && <Pagination.Item onClick={() => cambiarPagina(totalPaginas)}>{totalPaginas}</Pagination.Item>}
          <Pagination.Next disabled={paginaActual === totalPaginas} onClick={() => cambiarPagina(paginaActual + 1)} />
        </Pagination>
      </Col>
      <Col xs="auto">
        <Form.Select
          value={registrosPorPagina}
          onChange={(e) => establecerRegistrosPorPagina(Number(e.target.value))}
          className="form-select-sm"
        >
          {opcionesPorPagina.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion} por página
            </option>
          ))}
        </Form.Select>
      </Col>
    </Row>
  );
};

export default Paginacion;
