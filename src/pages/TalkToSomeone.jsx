import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import gsap from "gsap";
import { ArrowLeft, Briefcase, CheckCheck, Circle, LockKeyhole, MapPin, MessageCircle, Search, Send, ShieldCheck, UserRound } from "lucide-react";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import "./TalkToSomeone.css";

const FALLBACK_WORKERS = [
  { id: "sarah", name: "Dr. Sarah Johnson", specialty: "Mental Health Counselor", location: "Windhoek", online: true },
  { id: "peter", name: "Peter Nangolo", specialty: "Social Worker", location: "Windhoek", online: true },
  { id: "maria", name: "Maria Kambonde", specialty: "Child Protection Specialist", location: "Windhoek", online: false },
];

const initials = (name = "Anonymous member") => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
const toMillis = (value) => value?.toMillis?.() || value || Date.now();
const formatTime = (value) => new Date(toMillis(value)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const formatDay = (value) => new Date(toMillis(value)).toLocaleDateString([], { day: "numeric", month: "short" });

export default function TalkToSomeone() {
  const { user, isProfessional, profile } = useAuth();
  const [workers, setWorkers] = useState(FALLBACK_WORKERS);
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [error, setError] = useState("");
  const panelRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(panelRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
    }
  }, []);

  useEffect(() => onSnapshot(collection(db, "Professionals"), (snapshot) => {
    const loaded = snapshot.docs.map((item) => {
      const data = item.data();
      const name = data.name || data.Name || "Support professional";
      return {
        id: item.id,
        name,
        specialty: data.position || data.Position || "Social welfare professional",
        location: data.location || data.Location || "Namibia",
        online: data.online !== false,
      };
    });
    if (loaded.length) setWorkers(loaded);
  }, () => {}), []);

  useEffect(() => {
    if (!user) return undefined;
    const chatsQuery = query(collection(db, "supportChats"), where(isProfessional ? "professionalId" : "userId", "==", user.uid));
    return onSnapshot(chatsQuery, (snapshot) => {
      const loaded = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
        .sort((a, b) => toMillis(b.updatedAt) - toMillis(a.updatedAt));
      setConversations(loaded);
    }, () => setError("Chats could not be loaded. Check your connection and Firestore rules."));
  }, [isProfessional, user]);

  useEffect(() => {
    if (!selectedId) return undefined;
    const messagesQuery = query(collection(db, "supportChats", selectedId, "messages"), orderBy("createdAt", "asc"));
    return onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, () => setError("Messages could not be loaded."));
  }, [selectedId]);

  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const selectedConversation = conversations.find((chat) => chat.id === selectedId);
  const selectedWorker = workers.find((worker) => worker.id === (selectedConversation?.professionalId || selectedId));
  const sidebarItems = useMemo(() => {
    const source = isProfessional ? conversations : workers;
    const term = searchQuery.toLowerCase().trim();
    if (!term) return source;
    return source.filter((item) => {
      const text = isProfessional
        ? `${item.userDisplayName || "Anonymous member"} ${item.lastMessage || ""}`
        : `${item.name} ${item.specialty} ${item.location}`;
      return text.toLowerCase().includes(term);
    });
  }, [conversations, isProfessional, searchQuery, workers]);

  const memberName = () => profile?.name || profile?.fullName || user?.displayName || user?.email || "Member";
  const selectChat = (id) => {
    setMessages([]);
    setSelectedId(id);
  };

  const openWorkerChat = async (worker) => {
    const conversationId = `${user.uid}_${worker.id}`;
    try {
      await setDoc(doc(db, "supportChats", conversationId), {
        userId: user.uid,
        professionalId: worker.id,
        professionalName: worker.name,
        userDisplayName: anonymous ? "Anonymous member" : memberName(),
        isAnonymous: anonymous,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      selectChat(conversationId);
      setError("");
    } catch {
      setError("The conversation could not be opened. Please try again.");
    }
  };

  const changePrivacy = async (nextAnonymous) => {
    setAnonymous(nextAnonymous);
    if (!selectedConversation || isProfessional) return;
    try {
      await updateDoc(doc(db, "supportChats", selectedConversation.id), {
        isAnonymous: nextAnonymous,
        userDisplayName: nextAnonymous ? "Anonymous member" : memberName(),
        updatedAt: serverTimestamp(),
      });
    } catch {
      setError("Your privacy choice could not be updated.");
    }
  };

  const handleSend = async () => {
    const text = messageText.trim();
    if (!text || !selectedId || !user) return;
    setMessageText("");
    try {
      await addDoc(collection(db, "supportChats", selectedId, "messages"), {
        text, senderId: user.uid, senderRole: isProfessional ? "professional" : "user", createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "supportChats", selectedId), { lastMessage: text, updatedAt: serverTimestamp() });
      setError("");
    } catch {
      setMessageText(text);
      setError("Your message was not sent. Please try again.");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const chatName = isProfessional
    ? selectedConversation?.userDisplayName || "Anonymous member"
    : selectedConversation?.professionalName || selectedWorker?.name;

  return (
    <div className="talk-page">
      <header className="talk-header">
        <div className="talk-header-left">
          <Link to="/" className="talk-header-back" aria-label="Back to home"><ArrowLeft size={18} /></Link>
          <img src={logo} alt="Social Welfare logo" className="talk-header-logo" />
          <div>
            <h1 className="talk-header-title"><MessageCircle size={18} />{isProfessional ? "Professional inbox" : "Talk to Someone"}</h1>
            {isProfessional && <p className="talk-header-subtitle">All of your user conversations</p>}
          </div>
        </div>
        <span className="talk-user-badge">
          {isProfessional ? profile?.name || "Professional" : anonymous ? "Anonymous mode" : "Identified mode"}
        </span>
      </header>

      <div className="talk-body" ref={panelRef}>
        <aside className={`talk-sidebar ${selectedId ? "hide-on-mobile" : ""}`}>
          {!isProfessional && (
            <div className="talk-privacy-card">
              <div><ShieldCheck size={18} /><strong>How should you appear?</strong></div>
              <div className="talk-privacy-options" role="group" aria-label="Chat identity">
                <button className={anonymous ? "active" : ""} type="button" onClick={() => changePrivacy(true)}>
                  <LockKeyhole size={15} /> Anonymous
                </button>
                <button className={!anonymous ? "active" : ""} type="button" onClick={() => changePrivacy(false)}>
                  <UserRound size={15} /> Use my name
                </button>
              </div>
              <p>{anonymous ? "The professional will not see your name." : "The professional will see your profile name."}</p>
            </div>
          )}

          <div className="talk-search">
            <Search size={17} />
            <input type="search" placeholder={isProfessional ? "Search conversations..." : "Search professionals..."} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
          </div>

          <div className="talk-sidebar-scroll">
            <div className="talk-section">
              <p className="talk-section-label">{isProfessional ? `Conversations (${conversations.length})` : "Available professionals"}</p>
              {!sidebarItems.length && (
                <div className="talk-inbox-empty"><MessageCircle size={26} /><p>{isProfessional ? "No user conversations yet." : "No professionals match your search."}</p></div>
              )}

              {isProfessional ? sidebarItems.map((chat) => (
                <button type="button" key={chat.id} className={`talk-conversation-item ${selectedId === chat.id ? "active" : ""}`} onClick={() => selectChat(chat.id)}>
                  <span className={`talk-avatar ${chat.isAnonymous ? "anonymous" : ""}`}>{chat.isAnonymous ? "A" : initials(chat.userDisplayName)}</span>
                  <span className="talk-conversation-copy">
                    <span className="talk-conversation-top"><strong>{chat.userDisplayName || "Anonymous member"}</strong><small>{chat.updatedAt ? formatTime(chat.updatedAt) : ""}</small></span>
                    <span>{chat.lastMessage || "Conversation started"}</span>
                    <em>{chat.isAnonymous ? "Anonymous" : "Identity shared"}</em>
                  </span>
                </button>
              )) : sidebarItems.map((worker) => (
                <button type="button" key={worker.id} className={`talk-list-item ${selectedWorker?.id === worker.id ? "active" : ""}`} onClick={() => openWorkerChat(worker)}>
                  <span className="talk-avatar">{initials(worker.name)}{worker.online && <span className="talk-online-dot" />}</span>
                  <span className="talk-list-item-info">
                    <span className="talk-list-item-top"><strong>{worker.name}</strong><small className={worker.online ? "online-status" : "offline-status"}>{worker.online ? "Online" : "Offline"}</small></span>
                    <span className="talk-provider-specialty"><Briefcase size={12} /> {worker.specialty}</span>
                    <span className="talk-provider-location"><MapPin size={12} /> {worker.location}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className={`talk-chat ${selectedId ? "" : "hide-on-mobile"}`}>
          {!selectedId ? (
            <div className="talk-chat-empty">
              <MessageCircle size={48} />
              <h3>{isProfessional ? "Select a conversation" : "Choose a professional"}</h3>
              <p>{isProfessional ? "All chats assigned to you appear in the inbox on the left." : "Choose whether to share your name, then select a professional to start a private conversation."}</p>
              <div className="talk-empty-features"><span>Private</span><span>Professional</span><span>Supportive</span></div>
            </div>
          ) : (
            <>
              <div className="talk-chat-header">
                <button className="talk-chat-back" type="button" onClick={() => selectChat(null)}><ArrowLeft size={18} /></button>
                <div className={`talk-avatar ${selectedConversation?.isAnonymous ? "anonymous" : ""}`}>{isProfessional && selectedConversation?.isAnonymous ? "A" : initials(chatName)}</div>
                <div className="talk-chat-header-info">
                  <h4>{chatName || "Conversation"}</h4>
                  <span className="talk-online-status"><Circle size={8} fill="#34C759" stroke="none" />{isProfessional ? selectedConversation?.isAnonymous ? "Anonymous user" : "Identity shared" : "Private conversation"}</span>
                </div>
              </div>

              <div className="talk-messages">
                {!messages.length && <div className="talk-chat-intro">This is the start of a private conversation. Please avoid sharing passwords, banking details, or other information that is not needed for support.</div>}
                {messages.map((message, index) => {
                  const mine = message.senderId === user?.uid;
                  const previous = messages[index - 1];
                  const showDay = !previous || formatDay(previous.createdAt) !== formatDay(message.createdAt);
                  return (
                    <div key={message.id}>
                      {showDay && <div className="talk-day-divider"><span>{formatDay(message.createdAt)}</span></div>}
                      <div className={`talk-bubble-row ${mine ? "mine" : ""}`}>
                        <div className={`talk-bubble ${mine ? "mine" : "theirs"}`}><p>{message.text}</p><span className="talk-bubble-time">{formatTime(message.createdAt)}{mine && <CheckCheck size={14} />}</span></div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {error && <p className="talk-error" role="alert">{error}</p>}
              <div className="talk-input-bar">
                <textarea rows={1} placeholder={isProfessional ? "Reply to this user..." : "Type a message..."} value={messageText} onChange={(event) => setMessageText(event.target.value)} onKeyDown={handleKeyDown} />
                <button className="talk-send-btn" type="button" aria-label="Send message" onClick={handleSend} disabled={!messageText.trim()}><Send size={18} /></button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
