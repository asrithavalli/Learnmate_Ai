import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';

const SUGGESTIONS = [
  "How does the roadmap work?",
  "Suggest beginner React projects",
  "Help me prepare for a coding job",
  "How do I use the Quiz page?"
];

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hi! I'm your LearnMate AI Tutor. 🎓 I can guide you through roadmaps, recommend projects, explain engineering topics, or review skills. What are you studying today?",
      time: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen(p => !p);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    // Clear input if sent via input field
    if (!textToSend) setInputValue('');

    // Append User Message
    const userMsg = { sender: 'user', text, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await axios.post('/api/chat', { message: text });
      const botMsg = { sender: 'bot', text: response.data.reply, time: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('[Chat] Failed to get response:', err);
      const errorMsg = {
        sender: 'bot',
        text: "I'm having trouble connecting to the server. Please verify your connection and try again.",
        time: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="cb-wrapper">
      {/* Floating Action Button (FAB) */}
      <button 
        className={`cb-fab ${isOpen ? 'cb-fab--active' : ''}`}
        onClick={toggleChat}
        aria-label="Toggle Learning Tutor Chat"
        title="Chat with AI Tutor"
      >
        {isOpen ? (
          <span className="cb-fab__close">×</span>
        ) : (
          <span className="cb-fab__icon" role="img" aria-label="Tutor Bubble">💬</span>
        )}
      </button>

      {/* Chat Window */}
      <div className={`cb-window ${isOpen ? 'cb-window--open' : ''}`}>
        {/* Header */}
        <header className="cb-header">
          <div className="cb-header__info">
            <span className="cb-header__avatar" role="img" aria-label="Graduate Cap">🎓</span>
            <div>
              <h4 className="cb-header__title">AI Tutor</h4>
              <span className="cb-header__status">Online</span>
            </div>
          </div>
          <button className="cb-header__close-btn" onClick={toggleChat}>×</button>
        </header>

        {/* Messages Body */}
        <div className="cb-body">
          <div className="cb-messages-list">
            {messages.map((m, index) => (
              <div 
                key={index} 
                className={`cb-message cb-message--${m.sender}`}
              >
                <div className="cb-message__bubble">
                  {m.text}
                </div>
                <span className="cb-message__time">
                  {m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            
            {/* Loading / Typing Indicator */}
            {loading && (
              <div className="cb-message cb-message--bot">
                <div className="cb-message__bubble cb-message__bubble--typing">
                  <span className="cb-dot" />
                  <span className="cb-dot" />
                  <span className="cb-dot" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && !loading && (
          <div className="cb-suggestions">
            {SUGGESTIONS.map((s, idx) => (
              <button 
                key={idx} 
                className="cb-suggestion-chip"
                onClick={() => handleSendMessage(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <footer className="cb-footer">
          <input
            type="text"
            placeholder="Ask AI Tutor a question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
            className="cb-input"
          />
          <button 
            onClick={() => handleSendMessage()} 
            disabled={loading || !inputValue.trim()}
            className="cb-send-btn"
            aria-label="Send Message"
          >
            ➤
          </button>
        </footer>
      </div>
    </div>
  );
}

export default Chatbot;
