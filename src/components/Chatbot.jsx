import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../database/supabaseconfig';
import { MessageSquare, X, Send, Bot, Clock, MapPin, Tag, Pizza, ClipboardList, Phone, ChefHat, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: '¡Hola! 🍕 Soy PizzBot, tu asistente virtual. ¿En qué puedo ayudarte hoy?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [productos, setProductos] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const { user, profile } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const { data: prods } = await supabase.from('productos').select('*').eq('disponible', true).limit(20);
        if (prods) setProductos(prods);
        const { data: promos } = await supabase.from('promociones').select('*').eq('activa', true);
        if (promos) setPromociones(promos);
      } catch (err) {
        console.error('Chatbot data error:', err);
      }
    };
    cargarDatos();
  }, []);

  const procesarMensaje = async (textoUsuario) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 900));
    const query = textoUsuario.toLowerCase().trim();
    let botResponse = '';

    if (query.includes('menú') || query.includes('menu') || query.includes('pizzas') || query.includes('especialidades') || query.includes('comer') || query.includes('carta')) {
      if (productos.length > 0) {
        const porCategoria = productos.reduce((acc, curr) => {
          acc[curr.categoria] = acc[curr.categoria] || [];
          if (acc[curr.categoria].length < 3) acc[curr.categoria].push(curr);
          return acc;
        }, {});
        botResponse = '🍕 Nuestro Menú Destacado:\n\n';
        Object.keys(porCategoria).forEach(cat => {
          botResponse += `📌 ${cat?.toUpperCase()}\n`;
          porCategoria[cat].forEach(p => {
            botResponse += `• ${p.nombre} — C$${p.precio}\n`;
          });
          botResponse += '\n';
        });
        botResponse += '¡Puedes verlo todo en el Catálogo con fotos y detalles!';
      } else {
        botResponse = '🍕 Ofrecemos pizzas clásicas y gourmet, calzones, bebidas y postres. ¡Visita la sección Catálogo para ver todo!';
      }
    }
    else if (query.includes('promo') || query.includes('descuento') || query.includes('oferta')) {
      if (promociones.length > 0) {
        botResponse = '🔥 Promociones Activas:\n\n';
        promociones.forEach(p => {
          botResponse += `🏷️ ${p.titulo}\n${p.descripcion}\n✨ Descuento del ${p.descuento}%\n\n`;
        });
      } else {
        botResponse = '⚠️ No hay promociones activas en este momento. ¡Mantente atento, pronto tendremos ofertas especiales!';
      }
    }
    else if (query.includes('horario') || query.includes('abierto') || query.includes('hora')) {
      botResponse = '🕒 Horarios de Atención:\nLunes a Domingo — 11:00 AM a 10:00 PM\n\n🛵 Hacemos envíos a domicilio hasta las 9:30 PM.';
    }
    else if (query.includes('ubicación') || query.includes('donde') || query.includes('dónde') || query.includes('dirección')) {
      botResponse = '📍 Estamos ubicados en Juigalpa, Chontales.\nCostado Oeste del Parque Central.\n\n¡Visítanos para disfrutar una pizza recién salida del horno! 🔥';
    }
    else if (query.includes('pedido') || query.includes('estado') || query.includes('mi orden') || query.includes('rastreo')) {
      const emailUsuario = profile?.email || user?.email;
      if (!emailUsuario) {
        botResponse = '🔑 Para ver el estado de tu pedido, primero inicia sesión en tu cuenta.';
      } else {
        try {
          const { data: ultimoPedido, error } = await supabase
            .from('pedidos')
            .select('*')
            .eq('email_cliente', emailUsuario)
            .order('creado_en', { ascending: false })
            .limit(1)
            .single();
          if (error || !ultimoPedido) {
            botResponse = `Hola! No encontramos pedidos recientes para ${emailUsuario}. ¡Anímate a realizar tu primer pedido! 🍕`;
          } else {
            const fecha = new Date(ultimoPedido.creado_en).toLocaleString('es-NI');
            const estadoEmoji = { pendiente: '⏳', en_preparacion: '👨‍🍳', listo: '✅', entregado: '🍕', cancelado: '❌' };
            const estadoTexto = { pendiente: 'Esperando confirmación', en_preparacion: 'Tu pizza está en el horno', listo: 'Lista para retirar/entregar', entregado: '¡Entregado! Buen provecho', cancelado: 'Pedido cancelado' };
            botResponse = `📦 Tu Último Pedido:\n\n• ID: #${ultimoPedido.id?.toString().substring(0, 8)}\n• Fecha: ${fecha}\n• Total: C$${ultimoPedido.total}\n• Entrega: ${ultimoPedido.tipo_entrega === 'envio' ? 'A domicilio 🛵' : 'Retiro en local 🏪'}\n• Estado: ${estadoEmoji[ultimoPedido.estado] || ''} ${estadoTexto[ultimoPedido.estado] || ultimoPedido.estado}`;
          }
        } catch {
          botResponse = 'No pude consultar tus pedidos. Revisa la sección "Mis Pedidos" en el menú.';
        }
      }
    }
    else if (query.includes('contacto') || query.includes('telefono') || query.includes('teléfono') || query.includes('whatsapp')) {
      botResponse = '📞 Contáctanos:\n• Teléfono: +505 8888-8888\n• WhatsApp: +505 7777-7777\n• Correo: contacto@pizzapp.com\n\n¡Estamos para servirte! 😊';
    }
    else if (query.includes('como pedir') || query.includes('cómo pedir') || query.includes('ordenar') || query.includes('comprar')) {
      botResponse = '🛒 ¿Cómo hacer un pedido?\n\n1. Ve al Catálogo 🍕\n2. Elige tu pizza favorita\n3. Selecciona el tamaño y extras\n4. Agrégala al carrito 🛒\n5. Elige envío o retiro\n6. ¡Confirma y listo!\n\nEn minutos estará en camino 🚀';
    }
    else if (query.includes('tamaño') || query.includes('tamano') || query.includes('grande') || query.includes('chica') || query.includes('familiar')) {
      botResponse = '📏 Tamaños disponibles:\n\n• 🍕 Pequeña (8") — ideal para 1 persona\n• 🍕🍕 Mediana (12") — perfecta para 2\n• 🍕🍕🍕 Grande (14") — para 3-4 personas\n• 🎉 Familiar (16") — ¡la fiesta completa!\n\nTodos los tamaños se pueden personalizar con toppings extra.';
    }
    else if (query.includes('ingredientes') || query.includes('toppings') || query.includes('extra') || query.includes('queso')) {
      botResponse = '🧀 Nuestros ingredientes estrella:\n\n🫒 Aceitunas negras\n🍄 Champiñones\n🌶️ Jalapeños\n🥓 Tocino crujiente\n🧅 Cebolla caramelizada\n🫑 Pimientos coloridos\n🧀 Queso mozzarella extra\n\n¡Personaliza tu pizza al 100%!';
    }
    else {
      botResponse = '😊 Puedo ayudarte con:\n\n🍕 Nuestro Menú\n🏷️ Promociones del día\n🕒 Horarios y Ubicación\n📦 Estado de tu Pedido\n📞 Contacto\n🛒 Cómo hacer un pedido\n\n¿Qué necesitas?';
    }

    setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    setIsTyping(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    await procesarMensaje(userMessage);
  };

  const handleSugerencia = async (msg) => {
    setMessages(prev => [...prev, { text: msg, sender: 'user' }]);
    await procesarMensaje(msg);
  };

  const sugerencias = [
    { label: 'Menú', icon: <Pizza size={13} />, msg: 'Mostrar menú' },
    { label: 'Promos', icon: <Tag size={13} />, msg: 'Ver promociones' },
    { label: 'Horario', icon: <Clock size={13} />, msg: 'Horario y ubicación' },
    { label: 'Mi Pedido', icon: <ClipboardList size={13} />, msg: 'Estado de mi pedido' },
    { label: 'Contacto', icon: <Phone size={13} />, msg: 'Información de contacto' },
  ];

  return (
    <>
      {/* Botón Flotante */}
      <div className="chatbot-bubble">
        <motion.button
          whileHover={{ scale: 1.12, rotate: isOpen ? 0 : 10 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: 62,
            height: 62,
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.4)',
            background: 'linear-gradient(135deg, #c0392b, #ff6b35)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 28px rgba(192,57,43,0.45)',
            position: 'relative',
          }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                <X size={26} />
              </motion.div>
            ) : (
              <motion.div key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                <MessageSquare size={26} />
              </motion.div>
            )}
          </AnimatePresence>
          {!isOpen && (
            <motion.div
              style={{
                position: 'absolute', top: -3, right: -3, width: 16, height: 16,
                background: '#27ae60', borderRadius: '50%', border: '2px solid white',
              }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
        </motion.button>
      </div>

      {/* Ventana del Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="chatbot-window"
            style={{
              background: '#fffaf7',
              borderRadius: 28,
              border: '1px solid rgba(192,57,43,0.15)',
              boxShadow: '0 20px 60px rgba(192,57,43,0.2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 60%, #ff6b35 100%)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42, height: 42,
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid rgba(255,255,255,0.35)',
                }}>
                  <ChefHat size={22} color="white" />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem', fontFamily: 'Nunito, sans-serif' }}>
                    PizzBot 🍕
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                    <div style={{ width: 7, height: 7, background: '#2ecc71', borderRadius: '50%' }} />
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem' }}>Asistente Virtual • En línea</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10,
                  width: 32, height: 32, color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: '#fdf6ef',
            }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}
                >
                  {msg.sender === 'bot' && (
                    <div style={{
                      width: 28, height: 28, background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
                      borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginRight: 8, flexShrink: 0, alignSelf: 'flex-end',
                    }}>
                      <Bot size={15} color="white" />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                    background: msg.sender === 'user'
                      ? 'linear-gradient(135deg, #c0392b, #e74c3c)'
                      : 'white',
                    color: msg.sender === 'user' ? 'white' : '#2d1206',
                    fontSize: '0.84rem',
                    lineHeight: 1.55,
                    whiteSpace: 'pre-line',
                    boxShadow: msg.sender === 'user'
                      ? '0 4px 14px rgba(192,57,43,0.25)'
                      : '0 2px 8px rgba(0,0,0,0.07)',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: msg.sender === 'user' ? 600 : 500,
                    border: msg.sender === 'bot' ? '1px solid rgba(192,57,43,0.1)' : 'none',
                  }}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}
                >
                  <div style={{
                    width: 28, height: 28, background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
                    borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Bot size={15} color="white" />
                  </div>
                  <div style={{
                    background: 'white',
                    padding: '12px 16px',
                    borderRadius: '4px 18px 18px 18px',
                    display: 'flex', gap: 4, alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    border: '1px solid rgba(192,57,43,0.1)',
                  }}>
                    {[0, 150, 300].map((delay, i) => (
                      <motion.div
                        key={i}
                        style={{ width: 7, height: 7, background: '#c0392b', borderRadius: '50%' }}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: delay / 1000 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions */}
            {!isTyping && (
              <div style={{
                padding: '10px 14px',
                borderTop: '1px solid rgba(192,57,43,0.1)',
                background: '#fff5ee',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
              }}>
                {sugerencias.map((s, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSugerencia(s.msg)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 12px',
                      border: '1px solid rgba(192,57,43,0.25)',
                      borderRadius: 60,
                      background: 'white',
                      color: '#c0392b',
                      fontSize: '0.73rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'Nunito, sans-serif',
                    }}
                  >
                    {s.icon} {s.label}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} style={{
              padding: '12px 16px',
              background: 'white',
              borderTop: '1px solid rgba(192,57,43,0.1)',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isTyping}
                placeholder="Escribe tu pregunta..."
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: '1.5px solid rgba(192,57,43,0.2)',
                  borderRadius: 60,
                  fontSize: '0.85rem',
                  fontFamily: 'Nunito, sans-serif',
                  background: '#fdf6ef',
                  color: '#2d1206',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#c0392b'}
                onBlur={e => e.target.style.borderColor = 'rgba(192,57,43,0.2)'}
              />
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                type="submit"
                disabled={isTyping || !input.trim()}
                style={{
                  width: 42, height: 42,
                  borderRadius: '50%',
                  border: 'none',
                  background: input.trim() && !isTyping
                    ? 'linear-gradient(135deg, #c0392b, #e74c3c)'
                    : 'rgba(192,57,43,0.15)',
                  color: input.trim() && !isTyping ? 'white' : '#c0392b',
                  cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: input.trim() && !isTyping ? '0 4px 14px rgba(192,57,43,0.3)' : 'none',
                }}
              >
                <Send size={17} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
