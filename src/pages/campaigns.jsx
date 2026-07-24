import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import {
  limitToLast,
  onValue,
  push,
  query as realtimeQuery,
  ref,
  serverTimestamp as realtimeTimestamp,
} from "firebase/database";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  Pin,
  Plus,
  Send,
  Users,
  X,
} from "lucide-react";
import PageShell from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { db, realtimeDb } from "../firebase";
import "./campaigns.css";

const sampleCampaigns = [
  {
    id: "mental-health-walk",
    title: "Walk for Mental Wellness",
    description: "A gentle community walk, conversation circle, and free wellbeing screening.",
    date: "2026-07-25",
    time: "08:30",
    location: "Zoo Park, Windhoek",
    capacity: 120,
    category: "Mental health",
  },
  {
    id: "katutura-clinic-day",
    title: "Katutura Community Care Day",
    description: "Free basic health checks and referrals from local care professionals.",
    date: "2026-07-28",
    time: "09:00",
    location: "Katutura Community Hall",
    capacity: 80,
    category: "Community care",
  },
  {
    id: "family-support-circle",
    title: "Family Support Circle",
    description: "A facilitated, welcoming session for caregivers and families.",
    date: "2026-08-02",
    time: "14:00",
    location: "Khomas Regional Library",
    capacity: 35,
    category: "Family",
  },
];

const emptyCampaign = {
  title: "",
  description: "",
  date: "",
  time: "",
  location: "",
  capacity: "",
  category: "Mental health",
};

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function Calendar({ month, setMonth, campaigns, selectedDate, setSelectedDate }) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array(firstDay.getDay()).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, index) => index + 1),
  );

  return (
    <section className="calendar-card" aria-label="Campaign calendar">
      <div className="calendar-head">
        <div>
          <p className="eyebrow">Event calendar</p>
          <h2>{month.toLocaleDateString([], { month: "long", year: "numeric" })}</h2>
        </div>
        <div className="calendar-controls">
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft size={18} /></button>
          <button onClick={() => setMonth(new Date())}>Today</button>
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="calendar-grid calendar-weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="calendar-grid">
        {cells.map((day, index) => {
          if (!day) return <span className="calendar-empty" key={`empty-${index}`} />;
          const key = dateKey(new Date(month.getFullYear(), month.getMonth(), day));
          const count = campaigns.filter((campaign) => campaign.date === key).length;
          return (
            <button
              key={key}
              className={`calendar-day ${selectedDate === key ? "selected" : ""} ${count ? "has-events" : ""}`}
              onClick={() => setSelectedDate(selectedDate === key ? "" : key)}
            >
              <span>{day}</span>
              {count > 0 && <small>{count} {count === 1 ? "event" : "events"}</small>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CampaignChat({ campaign, author }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!campaign) return undefined;
    const messagesRef = realtimeQuery(
      ref(realtimeDb, `campaignChats/${campaign.id}/messages`),
      limitToLast(60),
    );
    return onValue(
      messagesRef,
      (snapshot) => {
        const value = snapshot.val() || {};
        setMessages(Object.entries(value).map(([id, message]) => ({ id, ...message })));
        setError("");
      },
      () => setError("Live chat needs the included Realtime Database rules to be deployed."),
    );
  }, [campaign]);

  const send = async (event) => {
    event.preventDefault();
    const clean = text.trim();
    if (!clean) return;
    try {
      await push(ref(realtimeDb, `campaignChats/${campaign.id}/messages`), {
        text: clean.slice(0, 800),
        author,
        createdAt: realtimeTimestamp(),
      });
      setText("");
    } catch {
      setError("Your message could not be sent. Please try again.");
    }
  };

  return (
    <aside className="campaign-chat">
      <div className="chat-heading">
        <div>
          <p className="eyebrow">Public group chat</p>
          <h3>{campaign.title}</h3>
        </div>
        <MessageCircle size={22} />
      </div>
      <p className="chat-notice">Community messages are public. Avoid sharing private medical information.</p>
      <div className="chat-messages">
        {messages.length === 0 && <p className="empty-copy">Start the conversation for this campaign.</p>}
        {messages.map((message) => (
          <div className="chat-message" key={message.id}>
            <span>{message.author || "Anonymous community member"}</span>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      {error && <p className="inline-error">{error}</p>}
      <form className="chat-compose" onSubmit={send}>
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Message the campaign group…" />
        <button aria-label="Send message"><Send size={17} /></button>
      </form>
    </aside>
  );
}

export default function Campaigns() {
  const { isProfessional, profile } = useAuth();
  const [campaigns, setCampaigns] = useState(sampleCampaigns);
  const [month, setMonth] = useState(new Date(2026, 6, 1));
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(sampleCampaigns[0]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyCampaign);
  const [saveError, setSaveError] = useState("");
  const [pinned, setPinned] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sw-pinned-campaigns") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "campaigns"), orderBy("date", "asc")),
        (snapshot) => {
          const cloudCampaigns = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
          if (cloudCampaigns.length) setCampaigns(cloudCampaigns);
        },
        () => {},
      ),
    [],
  );

  const visibleCampaigns = useMemo(
    () => (selectedDate ? campaigns.filter((campaign) => campaign.date === selectedDate) : campaigns),
    [campaigns, selectedDate],
  );

  const togglePin = (campaignId) => {
    const next = pinned.includes(campaignId)
      ? pinned.filter((id) => id !== campaignId)
      : [...pinned, campaignId];
    setPinned(next);
    localStorage.setItem("sw-pinned-campaigns", JSON.stringify(next));
  };

  const createCampaign = async (event) => {
    event.preventDefault();
    setSaveError("");
    try {
      const created = await addDoc(collection(db, "campaigns"), {
        ...form,
        capacity: Number(form.capacity),
        createdBy: profile?.id,
        organizer: profile?.name || "Verified professional",
        createdAt: serverTimestamp(),
      });
      const nextCampaign = { id: created.id, ...form, capacity: Number(form.capacity) };
      setCampaigns((current) => [...current, nextCampaign].sort((a, b) => a.date.localeCompare(b.date)));
      setSelectedCampaign(nextCampaign);
      setForm(emptyCampaign);
      setShowCreate(false);
    } catch {
      setSaveError("Campaign publishing needs Firestore access. Deploy the included firestore.rules first.");
    }
  };

  const chatAuthor = isProfessional
    ? `${profile?.name || "Professional"} · Professional`
    : "Anonymous community member";

  return (
    <PageShell
      eyebrow="Care in motion"
      title="Community campaigns"
      description="Discover health and welfare events across Namibia, pin the ones that matter, and join each campaign’s public conversation."
      actions={
        isProfessional ? (
          <button className="primary-action" onClick={() => setShowCreate(true)}><Plus size={17} /> Add campaign</button>
        ) : (
          <span className="role-note">Only registered professionals can publish dates.</span>
        )
      }
    >
      <Calendar month={month} setMonth={setMonth} campaigns={campaigns} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

      <div className="campaign-layout">
        <section className="campaign-list">
          <div className="section-heading-row">
            <h2>{selectedDate ? `Campaigns on ${new Date(`${selectedDate}T12:00`).toLocaleDateString([], { day: "numeric", month: "long" })}` : "Upcoming campaigns"}</h2>
            {selectedDate && <button className="text-button" onClick={() => setSelectedDate("")}>Show all</button>}
          </div>
          {visibleCampaigns.length === 0 && <div className="empty-state">No campaigns are scheduled for this date yet.</div>}
          {visibleCampaigns.map((campaign) => (
            <article className={`campaign-card ${selectedCampaign?.id === campaign.id ? "active" : ""}`} key={campaign.id}>
              <button className={`pin-button ${pinned.includes(campaign.id) ? "pinned" : ""}`} onClick={() => togglePin(campaign.id)} aria-label="Pin campaign">
                <Pin size={17} fill={pinned.includes(campaign.id) ? "currentColor" : "none"} />
              </button>
              <div className="campaign-date-block">
                <strong>{new Date(`${campaign.date}T12:00`).toLocaleDateString([], { day: "2-digit" })}</strong>
                <span>{new Date(`${campaign.date}T12:00`).toLocaleDateString([], { month: "short" })}</span>
              </div>
              <div className="campaign-card-copy">
                <span className="category-pill">{campaign.category}</span>
                <h3>{campaign.title}</h3>
                <p>{campaign.description}</p>
                <div className="campaign-meta">
                  <span><Clock3 size={14} /> {campaign.time}</span>
                  <span><MapPin size={14} /> {campaign.location}</span>
                  <span><Users size={14} /> {campaign.capacity} places</span>
                </div>
                <button className="discussion-button" onClick={() => setSelectedCampaign(campaign)}>
                  <MessageCircle size={16} /> Open group chat
                </button>
              </div>
            </article>
          ))}
        </section>
        {selectedCampaign && <CampaignChat campaign={selectedCampaign} author={chatAuthor} />}
      </div>

      {showCreate && (
        <div className="modal-backdrop" role="presentation">
          <section className="campaign-modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
            <button className="modal-close" onClick={() => setShowCreate(false)}><X size={20} /></button>
            <p className="eyebrow">Professional tool</p>
            <h2 id="create-title">Schedule a campaign</h2>
            <form onSubmit={createCampaign}>
              <label>Campaign title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
              <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Mental health</option><option>Community care</option><option>Family</option><option>Public health</option><option>Youth</option></select></label>
              <label>Date<input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
              <label>Time<input required type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></label>
              <label>Location<input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
              <label>Capacity<input required min="1" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></label>
              <label className="modal-full">Description<textarea required rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
              {saveError && <p className="inline-error modal-full">{saveError}</p>}
              <button className="primary-action modal-full"><CalendarDays size={17} /> Publish campaign</button>
            </form>
          </section>
        </div>
      )}
    </PageShell>
  );
}
