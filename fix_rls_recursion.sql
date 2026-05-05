-- ============================================================
-- DESHABILITAR RLS TEMPORALMENTE (Desarrollo)
-- ============================================================
-- Ejecuta esto en Supabase > SQL Editor

-- Opción 1: DESHABILITAR RLS COMPLETAMENTE
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE ingredientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_pedido DISABLE ROW LEVEL SECURITY;
ALTER TABLE promociones DISABLE ROW LEVEL SECURITY;
ALTER TABLE categorias DISABLE ROW LEVEL SECURITY;

-- Opción 2: POLÍTICA PERMISIVA SIMPLE (Si quieres RLS habilitado)
-- Ejecuta esto DESPUÉS de habilitar RLS nuevamente

-- USUARIOS
DROP POLICY IF EXISTS "allow_all_usuarios" ON usuarios;
CREATE POLICY "allow_all_usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);

-- PRODUCTOS
DROP POLICY IF EXISTS "allow_all_productos" ON productos;
CREATE POLICY "allow_all_productos" ON productos FOR ALL USING (true) WITH CHECK (true);

-- INGREDIENTES
DROP POLICY IF EXISTS "allow_all_ingredientes" ON ingredientes;
CREATE POLICY "allow_all_ingredientes" ON ingredientes FOR ALL USING (true) WITH CHECK (true);

-- PEDIDOS
DROP POLICY IF EXISTS "allow_all_pedidos" ON pedidos;
CREATE POLICY "allow_all_pedidos" ON pedidos FOR ALL USING (true) WITH CHECK (true);

-- DETALLE_PEDIDO
DROP POLICY IF EXISTS "allow_all_detalle_pedido" ON detalle_pedido;
CREATE POLICY "allow_all_detalle_pedido" ON detalle_pedido FOR ALL USING (true) WITH CHECK (true);

-- PROMOCIONES
DROP POLICY IF EXISTS "allow_all_promociones" ON promociones;
CREATE POLICY "allow_all_promociones" ON promociones FOR ALL USING (true) WITH CHECK (true);

-- CATEGORIAS
DROP POLICY IF EXISTS "allow_all_categorias" ON categorias;
CREATE POLICY "allow_all_categorias" ON categorias FOR ALL USING (true) WITH CHECK (true);
