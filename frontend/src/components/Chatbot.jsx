import React, { useState, useRef, useEffect } from 'react';
import { RiArrowUpLine, RiCloseLine, RiRobot2Line, RiUserLine } from 'react-icons/ri';
import { chatbotService } from '../services/api';
import './Chatbot.css';

const Chatbot = ({ onClose, isFullPage = false }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm Greenie, your AI green space guide. I can help you find Lagos' hidden gems, check current conditions, or help you plan your visit. How can I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const reply = await chatbotService.sendMessage(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again in a bit!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const ChatContent = (
    <div className={`chatbot-container ${isFullPage ? 'full-page' : 'animate-slide-up'}`}>
      {/* Header */}
      <div className="chatbot-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <RiRobot2Line size={24} />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 leading-tight">Greenie</h3>
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">AI Support</p>
          </div>
        </div>
        {!isFullPage && (
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400">
            <RiCloseLine size={24} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="chatbot-messages content-scroll">
        <div className="max-w-[800px] mx-auto w-full flex flex-col gap-6 py-4">
          {messages.map((msg, i) => (
            <div key={i} className={`message-wrapper ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'assistant' ? <RiRobot2Line size={18} /> : <RiUserLine size={18} />}
              </div>
              <div className="message-bubble shadow-sm">
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message-wrapper assistant">
              <div className="message-avatar">
                <RiRobot2Line size={18} />
              </div>
              <div className="message-bubble typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="chatbot-input-container bg-white border-t border-neutral-100">
        <form className="chatbot-input-area max-w-[800px] mx-auto w-full" onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about green spaces in Lagos..."
            autoFocus
          />
          <button type="submit" disabled={!input.trim() || isTyping} className="chatbot-send-btn">
            <RiArrowUpLine size={28} />
          </button>
        </form>
      </div>
    </div>
  );

  if (isFullPage) return ChatContent;

  return (
    <div className="chatbot-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {ChatContent}
    </div>
  );
};

export default Chatbot;
