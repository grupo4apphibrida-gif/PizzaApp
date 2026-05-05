-- ============================================================
-- RLS POLICIES PARA PIZZAAPP - SUPABASE
-- ============================================================
-- Ejecutar en SQL Editor de Supabase en el orden indicado

-- 1. HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE promociones ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLA: USUARIOS
-- ============================================================
-- Admin: puede ver, crear, editar, eliminar todos
-- Empleado: solo ver (no editar ni eliminar)
-- Cliente: solo ver/editar su propio perfil

DROP POLICY IF EXISTS "usuarios_admin_all" ON usuarios;
CREATE POLICY "usuarios_admin_all" ON usuarios
  FOR ALL USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "usuarios_read_all" ON usuarios;
CREATE POLICY "usuarios_read_all" ON usuarios
  FOR SELECT USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('admin', 'empleado', 'cliente')
  );

DROP POLICY IF EXISTS "usuarios_update_own" ON usuarios;
CREATE POLICY "usuarios_update_own" ON usuarios
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "usuarios_insert_public" ON usuarios;
CREATE POLICY "usuarios_insert_public" ON usuarios
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- TABLA: PRODUCTOS
-- ============================================================
-- Admin y Empleado: acceso total
-- Cliente: solo lectura

DROP POLICY IF EXISTS "productos_admin_empleado_all" ON productos;
CREATE POLICY "productos_admin_empleado_all" ON productos
  FOR ALL USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('admin', 'empleado')
  )
  WITH CHECK (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('admin', 'empleado')
  );

DROP POLICY IF EXISTS "productos_cliente_read" ON productos;
CREATE POLICY "productos_cliente_read" ON productos
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "productos_insert" ON productos;
CREATE POLICY "productos_insert" ON productos
  FOR INSERT WITH CHECK (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('admin', 'empleado')
  );

DROP POLICY IF EXISTS "productos_update" ON productos;
CREATE POLICY "productos_update" ON productos
  FOR UPDATE USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('admin', 'empleado')
  )
  WITH CHECK (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('admin', 'empleado')
  );

DROP POLICY IF EXISTS "productos_delete" ON productos;
CREATE POLICY "productos_delete" ON productos
  FOR DELETE USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================
-- TABLA: INGREDIENTES
-- ============================================================
-- Admin y Empleado: acceso total
-- Cliente: solo lectura

DROP POLICY IF EXISTS "ingredientes_admin_empleado_all" ON ingredientes;
CREATE POLICY "ingredientes_admin_empleado_all" ON ingredientes
  FOR ALL USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('admin', 'empleado')
  )
  WITH CHECK (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('admin', 'empleado')
  );

DROP POLICY IF EXISTS "ingredientes_read_all" ON ingredientes;
CREATE POLICY "ingredientes_read_all" ON ingredientes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "ingredientes_insert" ON ingredientes;
CREATE POLICY "ingredientes_insert" ON ingredientes
  FOR INSERT WITH CHECK (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('admin', 'empleado')
  );

DROP POLICY IF EXISTS "ingredientes_update" ON ingredientes;
CREATE POLICY "ingredientes_update" ON ingredientes
  FOR UPDATE USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('admin', 'empleado')
  )
  WITH CHECK (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('admin', 'empleado')
  );

DROP POLICY IF EXISTS "ingredientes_delete" ON ingredientes;
CREATE POLICY "ingredientes_delete" ON ingredientes
  FOR DELETE USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================
-- TABLA: PEDIDOS
-- ============================================================
-- Admin: acceso total
-- Empleado: puede ver todos, actualizar estado
-- Cliente: solo ver/crear propios pedidos

DROP POLICY IF EXISTS "pedidos_admin_all" ON pedidos;
CREATE POLICY "pedidos_admin_all" ON pedidos
  FOR ALL USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "pedidos_empleado_read" ON pedidos;
CREATE POLICY "pedidos_empleado_read" ON pedidos
  FOR SELECT USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'empleado'
  );

DROP POLICY IF EXISTS "pedidos_empleado_update_status" ON pedidos;
CREATE POLICY "pedidos_empleado_update_status" ON pedidos
  FOR UPDATE USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'empleado'
  )
  WITH CHECK (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'empleado'
  );

DROP POLICY IF EXISTS "pedidos_cliente_own" ON pedidos;
CREATE POLICY "pedidos_cliente_own" ON pedidos
  FOR SELECT USING (
    usuario_id = auth.uid()
  );

DROP POLICY IF EXISTS "pedidos_cliente_insert" ON pedidos;
CREATE POLICY "pedidos_cliente_insert" ON pedidos
  FOR INSERT WITH CHECK (
    usuario_id = auth.uid()
  );

DROP POLICY IF EXISTS "pedidos_cliente_update_own" ON pedidos;
CREATE POLICY "pedidos_cliente_update_own" ON pedidos
  FOR UPDATE USING (
    usuario_id = auth.uid()
  )
  WITH CHECK (
    usuario_id = auth.uid()
  );

-- ============================================================
-- TABLA: DETALLE_PEDIDO
-- ============================================================
-- Admin: acceso total
-- Empleado: solo lectura
-- Cliente: solo ver detalles de sus propios pedidos

DROP POLICY IF EXISTS "detalle_pedido_admin_all" ON detalle_pedido;
CREATE POLICY "detalle_pedido_admin_all" ON detalle_pedido
  FOR ALL USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "detalle_pedido_empleado_read" ON detalle_pedido;
CREATE POLICY "detalle_pedido_empleado_read" ON detalle_pedido
  FOR SELECT USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'empleado'
  );

DROP POLICY IF EXISTS "detalle_pedido_cliente_own" ON detalle_pedido;
CREATE POLICY "detalle_pedido_cliente_own" ON detalle_pedido
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pedidos WHERE pedidos.id = detalle_pedido.pedido_id 
      AND pedidos.usuario_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "detalle_pedido_insert" ON detalle_pedido;
CREATE POLICY "detalle_pedido_insert" ON detalle_pedido
  FOR INSERT WITH CHECK (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) IN ('admin', 'empleado')
  );

-- ============================================================
-- TABLA: PROMOCIONES
-- ============================================================
-- Admin: acceso total
-- Empleado: solo lectura
-- Cliente: solo lectura de promociones activas

DROP POLICY IF EXISTS "promociones_admin_all" ON promociones;
CREATE POLICY "promociones_admin_all" ON promociones
  FOR ALL USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "promociones_empleado_read" ON promociones;
CREATE POLICY "promociones_empleado_read" ON promociones
  FOR SELECT USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'empleado'
  );

DROP POLICY IF EXISTS "promociones_cliente_read_active" ON promociones;
CREATE POLICY "promociones_cliente_read_active" ON promociones
  FOR SELECT USING (
    activa = true
  );

-- ============================================================
-- TABLA: CATEGORIAS
-- ============================================================
-- Admin: acceso total
-- Empleado: lectura
-- Cliente: lectura

DROP POLICY IF EXISTS "categorias_admin_all" ON categorias;
CREATE POLICY "categorias_admin_all" ON categorias
  FOR ALL USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "categorias_read_all" ON categorias;
CREATE POLICY "categorias_read_all" ON categorias
  FOR SELECT USING (true);

-- ============================================================
-- FIN DE POLÍTICAS RLS
-- ============================================================
