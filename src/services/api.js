import { supabase } from '../database/supabaseconfig';

// Productos
export const getProducts = async () => {
  const { data, error } = await supabase.from('productos').select('*').order('nombre');
  if (error) throw error;
  return data;
};

export const createProduct = async (product) => {
  const { data, error } = await supabase.from('productos').insert([product]).select();
  if (error) throw error;
  return data[0];
};

export const updateProduct = async (id, product) => {
  const { data, error } = await supabase.from('productos').update(product).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

export const deleteProduct = async (id) => {
  const { error } = await supabase.from('productos').delete().eq('id', id);
  if (error) throw error;
};

// Inventario (Ingredientes)
export const getInventory = async () => {
  const { data, error } = await supabase.from('ingredientes').select('*').order('id');
  if (error) throw error;
  return data;
};

export const updateInventoryStock = async (id, stock) => {
  const { data, error } = await supabase.from('ingredientes').update({ stock }).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

// Usuarios
export const getUsers = async () => {
  const { data, error } = await supabase.from('usuarios').select('*').order('nombre');
  if (error) throw error;
  return data;
};

// Pedidos
export const getOrders = async () => {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*, usuarios(nombre), detalle_pedido(*, productos(nombre))')
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return data;
};

export const createOrder = async (order, items) => {
  const { data: orderData, error: orderError } = await supabase.from('pedidos').insert([order]).select();
  if (orderError) throw orderError;
  
  const orderItems = items.map(item => ({
    pedido_id: orderData[0].id,
    producto_id: item.product_id,
    cantidad: item.quantity,
    precio: item.price
  }));

  const { error: itemsError } = await supabase.from('detalle_pedido').insert(orderItems);
  if (itemsError) throw itemsError;
  
  return orderData[0];
};

export const updateOrderStatus = async (id, status) => {
  const { data, error } = await supabase.from('pedidos').update({ estado: status }).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

// Estadísticas
export const getSalesStats = async () => {
  const { data, error } = await supabase.from('pedidos').select('total, creado_en').eq('estado', 'entregado');
  if (error) throw error;
  return data;
};

export const getTopSellingProducts = async () => {
  const { data, error } = await supabase.from('detalle_pedido').select('cantidad, productos(nombre)');
  if (error) throw error;
  return data;
};

// FAQ / Chatbot (no se ve en el diagrama, lo dejamos comentado por si acaso)
// export const getFAQ = async () => {
//   const { data, error } = await supabase.from('faq').select('*');
//   if (error) throw error;
//   return data;
// };
//
// export const logChatbotMessage = async (message) => {
//   const { error } = await supabase.from('chatbot_logs').insert([message]);
//   if (error) throw error;
// };
