import { supabase } from '../database/supabaseconfig';

// Productos
export const getProducts = async () => {
  const { data, error } = await supabase.from('products').select('*').order('name');
  if (error) throw error;
  return data;
};

export const createProduct = async (product) => {
  const { data, error } = await supabase.from('products').insert([product]).select();
  if (error) throw error;
  return data[0];
};

export const updateProduct = async (id, product) => {
  const { data, error } = await supabase.from('products').update(product).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

export const deleteProduct = async (id) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
};

// Inventario
export const getInventory = async () => {
  const { data, error } = await supabase.from('inventory').select('*, products(name)').order('id');
  if (error) throw error;
  return data;
};

export const updateInventoryStock = async (id, stock) => {
  const { data, error } = await supabase.from('inventory').update({ stock }).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

// Usuarios
export const getUsers = async () => {
  const { data, error } = await supabase.from('profiles').select('*').order('name');
  if (error) throw error;
  return data;
};

// Pedidos
export const getOrders = async () => {
  const { data, error } = await supabase.from('orders').select('*, profiles(name)').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createOrder = async (order, items) => {
  const { data: orderData, error: orderError } = await supabase.from('orders').insert([order]).select();
  if (orderError) throw orderError;
  
  const orderItems = items.map(item => ({
    order_id: orderData[0].id,
    product_id: item.id,
    quantity: item.quantity,
    price: item.price
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) throw itemsError;
  
  return orderData[0];
};

export const updateOrderStatus = async (id, status) => {
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select();
  if (error) throw error;
  return data[0];
};

// Estadísticas
export const getSalesStats = async () => {
  const { data, error } = await supabase.from('orders').select('total, created_at').eq('status', 'entregado');
  if (error) throw error;
  return data;
};

export const getTopSellingProducts = async () => {
  const { data, error } = await supabase.from('order_items').select('quantity, products(name)');
  if (error) throw error;
  return data;
};

// FAQ / Chatbot
export const getFAQ = async () => {
  const { data, error } = await supabase.from('faq').select('*');
  if (error) throw error;
  return data;
};

export const logChatbotMessage = async (message) => {
  const { error } = await supabase.from('chatbot_logs').insert([message]);
  if (error) throw error;
};