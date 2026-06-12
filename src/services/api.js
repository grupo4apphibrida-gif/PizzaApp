import { supabase } from '../database/supabaseconfig';

// Productos
export const getProducts = async () => {
  try {
    const { data, error } = await supabase.from('productos').select('*').order('nombre');
    if (error) {
      console.error('Error getProducts:', error);
      throw error;
    }
    console.log('Productos cargados:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('Exception en getProducts:', err);
    throw err;
  }
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
  try {
    const { data, error } = await supabase.from('ingredientes').select('*').order('id');
    if (error) {
      console.error('Error getInventory:', error);
      throw error;
    }
    console.log('Ingredientes cargados:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('Exception en getInventory:', err);
    throw err;
  }
};

export const updateInventoryStock = async (id, stock) => {
  const { data, error } = await supabase.from('ingredientes').update({ stock }).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

// Usuarios
export const getUsers = async () => {
  try {
    const { data, error } = await supabase.from('usuarios').select('*').order('nombre');
    if (error) {
      console.error('Error getUsers:', error);
      throw error;
    }
    console.log('Usuarios cargados:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('Exception en getUsers:', err);
    throw err;
  }
};

export const createUser = async (user) => {
  try {
    const { data, error } = await supabase.from('usuarios').insert([user]).select();
    if (error) {
      console.error('Error createUser:', error);
      throw error;
    }
    console.log('Usuario creado:', data[0]);
    return data[0];
  } catch (err) {
    console.error('Exception en createUser:', err);
    throw err;
  }
};

export const updateUser = async (id, user) => {
  try {
    const { data, error } = await supabase.from('usuarios').update(user).eq('id', id).select();
    if (error) {
      console.error('Error updateUser:', error);
      throw error;
    }
    console.log('Usuario actualizado:', data[0]);
    return data[0];
  } catch (err) {
    console.error('Exception en updateUser:', err);
    throw err;
  }
};

export const deleteUser = async (id) => {
  try {
    const { error } = await supabase.from('usuarios').delete().eq('id', id);
    if (error) {
      console.error('Error deleteUser:', error);
      throw error;
    }
    console.log('Usuario eliminado:', id);
  } catch (err) {
    console.error('Exception en deleteUser:', err);
    throw err;
  }
};

// Pedidos
export const getOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('creado_en', { ascending: false });
    if (error) {
      console.error('Error getOrders:', error);
      throw error;
    }
    console.log('Pedidos cargados:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('Exception en getOrders:', err);
    throw err;
  }
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
