import React, { useState, useRef, useEffect } from 'react';
import { RiSendPlane2Fill, RiCloseLine, RiRobot2Line, RiUserLine } from 'react-icons/ri';
import { chatbotService } from '../services/api';
import './Chatbot.css';

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m Greenie. I can help you find the best parks in Lagos. What are you looking for today?' }
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
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="chatbot-container animate-slide-up">
        {/* Header */}
        <div className="chatbot-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <RiRobot2Line size={24} />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 leading-tight">Greenie</h3>
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider">AI Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400">
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages content-scroll">
          {messages.map((msg, i) => (
            <div key={i} className={`message-wrapper ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'assistant' ? <RiRobot2Line size={16} /> : <RiUserLine size={16} />}
              </div>
              <div className="message-bubble">
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message-wrapper assistant">
              <div className="message-avatar">
                <RiRobot2Line size={16} />
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

        {/* Input */}
        <form className="chatbot-input-area" onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Greenie anything..."
            autoFocus
          />
          <button type="submit" disabled={!input.trim() || isTyping}>
            <RiSendPlane2Fill size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
