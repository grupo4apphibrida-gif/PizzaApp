import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../database/supabaseconfig';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: '¡Hola! Bienvenido a PizzApp. ¿En qué puedo ayudarte?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages([...messages, { text: userMessage, sender: 'user' }]);
    setInput('');

    // Chatbot logic simple
    let botResponse = "Lo siento, no entiendo tu pregunta. Puedes preguntar por nuestro horario, ubicación, precios o estado de tu pedido.";

    if (userMessage.toLowerCase().includes('horario')) {
      botResponse = "Nuestro horario es de lunes a domingo de 11:00 AM a 10:00 PM.";
    } else if (userMessage.toLowerCase().includes('ubicación') || userMessage.toLowerCase().includes('ubicacion')) {
      botResponse = "Estamos ubicados en Juigalpa, cerca del parque central.";
    } else if (userMessage.toLowerCase().includes('precio') || userMessage.toLowerCase().includes('precios')) {
      botResponse = "Nuestros precios varían según el producto. Puedes revisar el menú para ver los precios detallados.";
    } else if (userMessage.toLowerCase().includes('estado') || userMessage.toLowerCase().includes('pedido')) {
      if (!user) {
        botResponse = "Por favor inicia sesión para consultar el estado de tu pedido.";
      } else {
        try {
          // Fetch last order status
          const { data: order } = await supabase
            .from('pedidos')
            .select('estado')
            .eq('usuario_id', user.id)
            .order('creado_en', { ascending: false })
            .limit(1)
            .single();
          
          if (order) {
            botResponse = `Tu último pedido se encuentra en estado: ${order.estado}.`;
          } else {
            botResponse = "No hemos encontrado pedidos recientes a tu nombre.";
          }
        } catch (err) {
          botResponse = "Ocurrió un error al consultar tu pedido. Inténtalo más tarde.";
        }
      }
    }

    setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
  };

  return (
    <>
      <div className="chatbot-bubble">
        <button 
          className="btn btn-pizza-primary rounded-circle shadow-lg p-3"
          onClick={() => setIsOpen(!isOpen)}
        >
          <i className={`bi bi-${isOpen ? 'x-lg' : 'chat-dots-fill'} fs-4`}></i>
        </button>
      </div>

      {isOpen && (
        <div className="chatbot-window premium-card shadow-lg overflow-hidden border-0">
          <div className="bg-pizza-gradient p-3 text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">PizzBot</h5>
            <small>En línea</small>
          </div>
          
          <div className="flex-grow-1 overflow-auto p-3 bg-light">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div 
                  className={`p-3 rounded-4 shadow-sm max-w-75 ${
                    msg.sender === 'user' 
                      ? 'bg-pizza-gradient text-white' 
                      : 'bg-white text-dark border border-light'
                  }`}
                  style={{ maxWidth: '80%' }}
                >
                  <p className="mb-0 small">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-top">
            <div className="input-group">
              <input
                type="text"
                className="form-control border-0 bg-light rounded-pill px-4"
                placeholder="Escribe un mensaje..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button className="btn btn-pizza-primary rounded-circle ms-2 p-2 px-3" type="submit">
                <i className="bi bi-send-fill"></i>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
