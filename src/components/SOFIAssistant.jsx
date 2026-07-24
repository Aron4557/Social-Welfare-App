// src/components/SOFIAssistant.jsx
import { useState, useRef, useEffect } from 'react';
import { Send, X, Minimize2, Maximize2, Phone, MessageCircle, Heart, Loader, Sparkles } from 'lucide-react';
import sofiImage from '../assets/sofi.png';
import './SOFIAssistant.css';

const SOFIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [showInitialMessage, setShowInitialMessage] = useState(true);
  const messagesEndRef = useRef(null);
  const initialMessageTimeout = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-hide initial message after 8 seconds
  useEffect(() => {
    if (showInitialMessage) {
      initialMessageTimeout.current = setTimeout(() => {
        setShowInitialMessage(false);
      }, 8000);
    }
    return () => {
      if (initialMessageTimeout.current) {
        clearTimeout(initialMessageTimeout.current);
      }
    };
  }, [showInitialMessage]);

  // Initialize chat with greeting
  const initializeChat = () => {
    const greeting = {
      id: Date.now(),
      type: 'bot',
      text: "💜 **Hello! I'm SOFI** - your AI support assistant.\n\nI'm here to listen, support, and guide you. Whether you need someone to talk to, help finding resources, or just a friendly conversation - I'm here for you.\n\n💭 **What's on your mind today?**"
    };
    setMessages([greeting]);
    setConversationHistory([
      { role: 'system', content: 'You are SOFI, a compassionate AI mental health support assistant.' }
    ]);
    setHasStarted(true);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && !hasStarted) {
      setTimeout(initializeChat, 300);
    }
    if (isOpen) {
      setShowInitialMessage(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    const userMsgObj = {
      id: Date.now(),
      type: 'user',
      text: userMessage
    };
    
    setMessages(prev => [...prev, userMsgObj]);
    setInput('');
    setIsTyping(true);

    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];
    setConversationHistory(updatedHistory);

    try {
      // Simulate AI response - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
      
      const responses = [
        "💜 I hear you. That sounds really tough.\n\nLet me help you work through this. What would be most helpful right now - just listening, some coping strategies, or connecting you with resources?",
        "💜 Thank you for sharing that with me. I want you to know that your feelings are valid and you're not alone in this.\n\nWould you like to explore some gentle ways to feel better right now?",
        "💜 I'm here with you. Sometimes just having someone to talk to makes a difference.\n\nCan you tell me more about what's been going on? I'm listening with an open heart.",
        "💜 That's a lot to carry. I appreciate you trusting me with this.\n\nWhat would help you most right now - talking it through, finding practical solutions, or just having a quiet moment of support?",
        "💜 You're taking such an important step by reaching out.\n\nI want to help you find the support you need. Would you like me to connect you with our human counselors or continue our conversation?"
      ];
      
      const aiResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const botMsgObj = {
        id: Date.now() + 1,
        type: 'bot',
        text: aiResponse
      };
      
      setMessages(prev => [...prev, botMsgObj]);
      
      setConversationHistory([
        ...updatedHistory,
        { role: 'assistant', content: aiResponse }
      ]);

      // Check if user wants to connect to a human
      const lowerMsg = userMessage.toLowerCase();
      if (lowerMsg.includes('human') || lowerMsg.includes('live person') || 
          lowerMsg.includes('talk to someone') || lowerMsg.includes('counselor') || 
          lowerMsg.includes('therapist') || lowerMsg.includes('person to talk to')) {
        setTimeout(() => {
          const humanOffer = {
            id: Date.now() + 2,
            type: 'bot',
            text: "💜 **I understand.** Sometimes we need human connection.\n\nOur team of trained counselors is available. Would you like me to connect you with a real person who can provide more personalized support?\n\n*Click the button below to request a live chat with a counselor.*"
          };
          setMessages(prev => [...prev, humanOffer]);
        }, 500);
      }
    } catch (error) {
      console.error('Error getting response:', error);
      
      const fallbackMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: "💜 I'm here with you. Could you tell me more about what's going on? I want to make sure I understand how to help you best."
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { icon: <Heart size={14} />, text: "I'm feeling anxious" },
    { icon: <MessageCircle size={14} />, text: "I need someone to talk to" },
    { icon: <Phone size={14} />, text: "I need crisis support" },
    { icon: <Sparkles size={14} />, text: "I need counseling" },
  ];

  return (
    <>
      {/* SOFI Avatar - Floating on bottom right */}
      <div className="sofi-avatar-container" onClick={toggleChat}>
        {showInitialMessage && (
          <div className="sofi-initial-message">
            <div className="sofi-message-bubble">
              <p>💜 Hi! I'm SOFI</p>
              <span className="sofi-message-sub">I'm here if you need someone to talk to</span>
            </div>
            <div className="sofi-message-tail"></div>
          </div>
        )}
        <div className={`sofi-avatar ${isOpen ? 'active' : ''}`}>
          <div className="sofi-avatar-ring">
            <div className="sofi-avatar-image">
              <img src={sofiImage} alt="SOFI" className="sofi-avatar-img" />
            </div>
            <div className="sofi-pulse-dot"></div>
          </div>
          <div className="sofi-avatar-label">SOFI</div>
        </div>
        <div className="sofi-wave-ripple"></div>
        <div className="sofi-wave-ripple delay-1"></div>
        <div className="sofi-wave-ripple delay-2"></div>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className={`sofi-chat-container ${isMinimized ? 'minimized' : ''}`}>
          {/* Header */}
          <div className="sofi-chat-header">
            <div className="sofi-chat-header-info">
              <div className="sofi-header-avatar">
                <img src={sofiImage} alt="SOFI" className="sofi-header-img" />
                <span className="sofi-header-dot"></span>
              </div>
              <div>
                <h3>SOFI</h3>
                <span className="sofi-chat-status">
                  <span className="status-dot"></span>
                  Online • Here to help
                </span>
              </div>
            </div>
            <div className="sofi-chat-header-actions">
              <button 
                onClick={() => setIsMinimized(!isMinimized)} 
                className="sofi-icon-btn"
              >
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              <button onClick={toggleChat} className="sofi-icon-btn close-btn">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div className="sofi-chat-messages">
                {messages.map((msg) => (
                  <div key={msg.id} className={`sofi-message ${msg.type}`}>
                    <div className="sofi-message-content">
                      {msg.type === 'bot' && (
                        <div className="sofi-msg-avatar">
                          <img src={sofiImage} alt="SOFI" className="sofi-msg-img" />
                        </div>
                      )}
                      <div className="sofi-msg-text">
                        {msg.text.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="sofi-message bot">
                    <div className="sofi-message-content">
                      <div className="sofi-msg-avatar">
                        <img src={sofiImage} alt="SOFI" className="sofi-msg-img" />
                      </div>
                      <div className="sofi-typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="sofi-quick-actions">
                {quickActions.map((action, index) => (
                  <button 
                    key={index}
                    onClick={() => setInput(action.text)}
                    className="sofi-quick-btn"
                  >
                    {action.icon}
                    {action.text}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="sofi-chat-input">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows="1"
                  disabled={isTyping}
                  className="sofi-textarea"
                />
                <button 
                  onClick={handleSend} 
                  disabled={!input.trim() || isTyping}
                  className="sofi-send-btn"
                >
                  {isTyping ? <Loader size={20} className="spin" /> : <Send size={20} />}
                </button>
              </div>

              {/* Connect to Human */}
              <div className="sofi-human-connect">
                <button className="sofi-human-btn">
                  <Phone size={16} />
                  Connect to a Human Counselor
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default SOFIAssistant;