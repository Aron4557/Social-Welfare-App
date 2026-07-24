import { useEffect, useRef, useState } from "react";
import {
  Heart,
  Loader,
  Maximize2,
  MessageCircle,
  Minimize2,
  Phone,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import sofiImage from "../assets/sofi.png";
import "./SOFIAssistant.css";

const welcomeMessage = {
  id: 1,
  type: "bot",
  text: "Hi, I’m SOFI. I’m here to listen and offer gentle, practical mental-health support. What has today felt like for you?",
};

export default function SOFIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showInitialMessage, setShowInitialMessage] = useState(true);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowInitialMessage(false), 8500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const toggleChat = () => {
    setIsOpen((value) => !value);
    setIsMinimized(false);
    setShowInitialMessage(false);
  };

  const handleSend = async () => {
    const clean = input.trim();
    if (!clean || isTyping) return;

    const userMessage = { id: Date.now(), type: "user", text: clean };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/sofi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.slice(-10).map((message) => ({
            role: message.type === "bot" ? "model" : "user",
            text: message.text,
          })),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "SOFI is unavailable");
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, type: "bot", text: payload.reply },
      ]);
    } catch (error) {
      const isConfigurationError = error.message?.includes("GEMINI_API_KEY");
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          type: "bot",
          text: isConfigurationError
            ? "SOFI has not been connected to Gemini yet. The project administrator needs to add a GEMINI_API_KEY to the server’s .env file, then restart the app."
            : "I’m having trouble reaching my support service right now. You can still pause, take one slow breath, and tell a trusted person what you need. If you may be in immediate danger, contact local emergency services now.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { icon: <Heart size={14} />, text: "I’m feeling anxious" },
    { icon: <MessageCircle size={14} />, text: "I need someone to listen" },
    { icon: <Sparkles size={14} />, text: "Help me calm down" },
    { icon: <Phone size={14} />, text: "I’m worried about my safety" },
  ];

  return (
    <>
      <button className="sofi-avatar-container" onClick={toggleChat} aria-label="Open SOFI mental health assistant">
        {showInitialMessage && (
          <span className="sofi-initial-message">
            <span className="sofi-message-bubble">
              <strong>Hi, I’m SOFI</strong>
              <span className="sofi-message-sub">I’m here if you need someone to talk to.</span>
            </span>
            <span className="sofi-message-tail" />
          </span>
        )}
        <span className={`sofi-avatar ${isOpen ? "active" : ""}`}>
          <span className="sofi-avatar-ring">
            <span className="sofi-avatar-image">
              <img src={sofiImage} alt="" className="sofi-avatar-img" />
            </span>
            <span className="sofi-pulse-dot" />
          </span>
          <span className="sofi-avatar-label">SOFI</span>
        </span>
        <span className="sofi-wave-ripple" />
        <span className="sofi-wave-ripple delay-1" />
        <span className="sofi-wave-ripple delay-2" />
      </button>

      {isOpen && (
        <section className={`sofi-chat-container ${isMinimized ? "minimized" : ""}`} aria-label="SOFI chat">
          <header className="sofi-chat-header">
            <div className="sofi-chat-header-info">
              <div className="sofi-header-avatar">
                <img src={sofiImage} alt="" className="sofi-header-img" />
                <span className="sofi-header-dot" />
              </div>
              <div>
                <h3>SOFI</h3>
                <span className="sofi-chat-status"><span className="status-dot" /> Mental-health support</span>
              </div>
            </div>
            <div className="sofi-chat-header-actions">
              <button onClick={() => setIsMinimized((value) => !value)} className="sofi-icon-btn" aria-label="Minimize chat">
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              <button onClick={toggleChat} className="sofi-icon-btn close-btn" aria-label="Close chat"><X size={18} /></button>
            </div>
          </header>

          {!isMinimized && (
            <>
              <div className="sofi-chat-messages">
                {messages.map((message) => (
                  <div key={message.id} className={`sofi-message ${message.type}`}>
                    <div className="sofi-message-content">
                      {message.type === "bot" && (
                        <div className="sofi-msg-avatar"><img src={sofiImage} alt="" className="sofi-msg-img" /></div>
                      )}
                      <div className="sofi-msg-text">
                        {message.text.split("\n").map((line, index) => <p key={index}>{line}</p>)}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="sofi-message bot">
                    <div className="sofi-message-content">
                      <div className="sofi-msg-avatar"><img src={sofiImage} alt="" className="sofi-msg-img" /></div>
                      <div className="sofi-typing-indicator"><span /><span /><span /></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="sofi-quick-actions">
                {quickActions.map((action) => (
                  <button key={action.text} onClick={() => setInput(action.text)} className="sofi-quick-btn">
                    {action.icon}{action.text}
                  </button>
                ))}
              </div>
              <div className="sofi-chat-input">
                <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} placeholder="Type your message…" rows="1" disabled={isTyping} className="sofi-textarea" />
                <button onClick={handleSend} disabled={!input.trim() || isTyping} className="sofi-send-btn" aria-label="Send message">
                  {isTyping ? <Loader size={20} className="spin" /> : <Send size={20} />}
                </button>
              </div>
              <p className="sofi-disclaimer">SOFI offers general support, not diagnosis or emergency care.</p>
            </>
          )}
        </section>
      )}
    </>
  );
}
