// src/pages/TalkToSomeone.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import gsap from "gsap";
import {
  ArrowLeft, Search, Send, MessageCircle,
  MapPin, Briefcase, Circle, CheckCheck, Phone, Mail, Star
} from "lucide-react";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import "./TalkToSomeone.css";

// Mock data for social workers
const SOCIAL_WORKERS = [
  { 
    id: 1, 
    name: "Dr. Sarah Johnson", 
    specialty: "Mental Health Counselor", 
    location: "Windhoek",
    available: true,
    rating: 4.9,
    reviews: 127,
    online: true,
    lastActive: "Online now",
    avatar: "SJ"
  },
  { 
    id: 2, 
    name: "Peter Nangolo", 
    specialty: "Social Worker", 
    location: "Windhoek",
    available: true,
    rating: 4.8,
    reviews: 98,
    online: true,
    lastActive: "Online now",
    avatar: "PN"
  },
  { 
    id: 3, 
    name: "Maria Kambonde", 
    specialty: "Child Protection Specialist", 
    location: "Windhoek",
    available: false,
    rating: 4.9,
    reviews: 156,
    online: false,
    lastActive: "Last seen 2 hours ago",
    avatar: "MK"
  },
  { 
    id: 4, 
    name: "Dr. David Nghipondoka", 
    specialty: "Psychologist", 
    location: "Windhoek",
    available: true,
    rating: 4.7,
    reviews: 203,
    online: true,
    lastActive: "Online now",
    avatar: "DN"
  },
  { 
    id: 5, 
    name: "Rachel Thomas", 
    specialty: "Family Counselor", 
    location: "Windhoek",
    available: true,
    rating: 4.6,
    reviews: 89,
    online: false,
    lastActive: "Last seen 1 hour ago",
    avatar: "RT"
  },
];

// Initial conversation messages
const INITIAL_MESSAGES = [
  { id: 1, sender: 'user', text: "Hello, I need help with anxiety and stress", timestamp: Date.now() - 3600000 },
  { id: 2, sender: 'worker', text: "Hi there! I'm here to help. Can you tell me more about what you're experiencing?", timestamp: Date.now() - 3000000 },
  { id: 3, sender: 'user', text: "I've been feeling overwhelmed lately and having trouble sleeping", timestamp: Date.now() - 2400000 },
  { id: 4, sender: 'worker', text: "I understand. That sounds really difficult. Let me share some coping strategies that might help.", timestamp: Date.now() - 1800000 },
];

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDay(timestamp) {
  return new Date(timestamp).toLocaleDateString([], { day: "numeric", month: "short" });
}

export default function TalkToSomeone() {
  const { isProfessional, profile } = useAuth();
  const [workers, setWorkers] = useState(SOCIAL_WORKERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const messagesEndRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    gsap.fromTo(panelRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
  }, []);

  useEffect(
    () =>
      onSnapshot(
        collection(db, "Professionals"),
        (snapshot) => {
          const professionals = snapshot.docs.map((item) => {
            const data = item.data();
            const name = data.name || data.Name || item.id;
            return {
              id: item.id,
              name,
              specialty: data.position || data.Position || "Social welfare professional",
              location: data.location || data.Location || "Namibia",
              available: data.available !== false,
              rating: data.rating || data.Rating || 0,
              reviews: data.reviews || 0,
              online: data.online !== false,
              lastActive: data.lastActive || "Profile available",
              avatar: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
              qualifications: data.qualifications || data.certification || data.Certification || "",
            };
          });
          if (professionals.length) setWorkers(professionals);
        },
        () => {},
      ),
    [],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedWorker = workers.find(w => w.id === selectedWorkerId);

  const handleSend = () => {
    const text = messageText.trim();
    if (!text) return;
    
    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: text,
      timestamp: Date.now()
    };
    
    setMessages([...messages, newMessage]);
    setMessageText("");

    // Simulate worker response after 1-2 seconds
    setTimeout(() => {
      const responses = [
        "Thank you for sharing that. I'm here to support you.",
        "I hear you. That must be really challenging. Let's work through this together.",
        "That's a very valid feeling. Many people experience similar things.",
        "I appreciate you opening up to me. What would be most helpful for you right now?",
        "You're taking an important step by reaching out. Let's explore this further."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const workerReply = {
        id: messages.length + 2,
        sender: 'worker',
        text: randomResponse,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, workerReply]);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewConversation = (worker) => {
    setSelectedWorkerId(worker.id);
    setMessages(INITIAL_MESSAGES);
    setSearchQuery("");
  };

  return (
    <div className="talk-page">
      {/* Header */}
      <header className="talk-header">
        <div className="talk-header-left">
          <Link to="/" className="talk-header-back">
            <ArrowLeft size={18} />
          </Link>
          <img src={logo} alt="Social Welfare logo" className="talk-header-logo" />
          <h1 className="talk-header-title">
            <MessageCircle size={18} />
            Talk to Someone
          </h1>
        </div>
        <div className="talk-header-right">
          <span className="talk-user-badge">
            {isProfessional ? profile?.name || "Professional" : "Anonymous member"}
          </span>
        </div>
      </header>

      <div className="talk-body" ref={panelRef}>
        {/* Sidebar */}
        <aside className={`talk-sidebar ${selectedWorker ? "hide-on-mobile" : ""}`}>
          <div className="talk-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search for social workers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="talk-sidebar-scroll">
            <div className="talk-section">
              <p className="talk-section-label">
                {searchQuery ? "Search Results" : "Available Social Workers"}
              </p>
              {filteredWorkers.length === 0 && (
                <p className="talk-empty-note">No social workers match your search.</p>
              )}
              {filteredWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className={`talk-list-item ${selectedWorkerId === worker.id ? "active" : ""}`}
                  onClick={() => startNewConversation(worker)}
                >
                  <div className="talk-avatar">
                    {worker.avatar}
                    {worker.online && <span className="talk-online-dot"></span>}
                  </div>
                  <div className="talk-list-item-info">
                    <div className="talk-list-item-top">
                      <h4>{worker.name}</h4>
                      <span className="talk-worker-status">
                        {worker.online ? (
                          <span className="online-status">Online</span>
                        ) : (
                          <span className="offline-status">Offline</span>
                        )}
                      </span>
                    </div>
                    <p className="talk-provider-specialty">
                      <Briefcase size={12} /> {worker.specialty}
                    </p>
                    <p className="talk-provider-location">
                      <MapPin size={12} /> {worker.location}
                    </p>
                    <p className="talk-provider-rating">
                      <Star size={12} /> {worker.rating} ({worker.reviews} reviews)
                    </p>
                    {worker.qualifications && (
                      <p className="talk-provider-location">{worker.qualifications}</p>
                    )}
                    {worker.available && (
                      <span className="talk-available-badge">Available Now</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Chat panel */}
        <section className={`talk-chat ${selectedWorker ? "" : "hide-on-mobile"}`}>
          {!selectedWorker && (
            <div className="talk-chat-empty">
              <MessageCircle size={48} />
              <h3>Start a Conversation</h3>
              <p>
                Search for a social worker and start a private, confidential conversation.
                Our team is here to support you.
              </p>
              <div className="talk-empty-features">
                <span>Confidential</span>
                <span>Professional</span>
                <span>Supportive</span>
              </div>
            </div>
          )}

          {selectedWorker && (
            <>
              <div className="talk-chat-header">
                <button className="talk-chat-back" onClick={() => setSelectedWorkerId(null)}>
                  <ArrowLeft size={18} />
                </button>
                <div className="talk-avatar">
                  {selectedWorker.avatar}
                  {selectedWorker.online && <span className="talk-online-dot"></span>}
                </div>
                <div className="talk-chat-header-info">
                  <h4>{selectedWorker.name}</h4>
                  <span className="talk-online-status">
                    <Circle size={8} fill={selectedWorker.online ? "#34C759" : "#9C93AC"} stroke="none" />
                    {selectedWorker.online ? "Online" : selectedWorker.lastActive}
                  </span>
                </div>
                <div className="talk-chat-header-actions">
                  <button className="talk-header-action" title="Call">
                    <Phone size={16} />
                  </button>
                  <button className="talk-header-action" title="Email">
                    <Mail size={16} />
                  </button>
                </div>
              </div>

              <div className="talk-messages">
                {messages.length === 0 && (
                  <div className="talk-chat-intro">
                    <p>
                      This is the start of your private, confidential conversation with{" "}
                      {selectedWorker.name}. Messages here are only visible to the two of you.
                    </p>
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isMine = msg.sender === 'user';
                  const prev = messages[i - 1];
                  const showDay = !prev || formatDay(prev.timestamp) !== formatDay(msg.timestamp);
                  return (
                    <div key={msg.id}>
                      {showDay && (
                        <div className="talk-day-divider">
                          <span>{formatDay(msg.timestamp)}</span>
                        </div>
                      )}
                      <div className={`talk-bubble-row ${isMine ? "mine" : ""}`}>
                        <div className={`talk-bubble ${isMine ? "mine" : "theirs"}`}>
                          <p>{msg.text}</p>
                          <span className="talk-bubble-time">
                            {formatTime(msg.timestamp)}
                            {isMine && <CheckCheck size={14} />}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="talk-input-bar">
                <textarea
                  rows={1}
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="talk-send-btn" onClick={handleSend} disabled={!messageText.trim()}>
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
