import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { HeartHandshake, MessageCircle, Send, ShieldCheck, Sparkles } from "lucide-react";
import PageShell from "../components/PageShell";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import "./better_together.css";

const samplePosts = [
  {
    id: "sample-1",
    title: "I feel overwhelmed caring for everyone",
    body: "I am the person my family depends on, but lately I feel like I have nothing left to give. How do other caregivers make space for themselves without feeling guilty?",
    category: "Family & caregiving",
    authorLabel: "Anonymous community member",
    authorType: "user",
    createdAt: { toDate: () => new Date(Date.now() - 7200000) },
    sampleComments: [
      {
        id: "sample-comment-1",
        text: "Rest is part of caring, not a failure to care. Even ten protected minutes can be a beginning.",
        authorLabel: "M. Amutenya · Social worker",
        authorType: "professional",
      },
    ],
  },
  {
    id: "sample-2",
    title: "Looking for ways to manage anxious mornings",
    body: "My thoughts race as soon as I wake up. I would appreciate simple routines that have helped other people begin the day more calmly.",
    category: "Mental wellbeing",
    authorLabel: "Anonymous community member",
    authorType: "user",
    createdAt: { toDate: () => new Date(Date.now() - 86400000) },
    sampleComments: [],
  },
];

function relativeTime(value) {
  const date = value?.toDate ? value.toDate() : new Date();
  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / 1440)}d ago`;
}

function CommentThread({ post, authorLabel, authorType }) {
  const [comments, setComments] = useState(post.sampleComments || []);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (post.id.startsWith("sample-")) return undefined;
    return onSnapshot(
      query(collection(db, "forumPosts", post.id, "comments"), orderBy("createdAt", "asc")),
      (snapshot) => setComments(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
      () => setError("Comments are temporarily unavailable."),
    );
  }, [post.id]);

  const submit = async (event) => {
    event.preventDefault();
    const clean = text.trim();
    if (!clean) return;
    if (post.id.startsWith("sample-")) {
      setComments((current) => [
        ...current,
        { id: `local-${Date.now()}`, text: clean, authorLabel, authorType },
      ]);
      setText("");
      return;
    }
    try {
      await addDoc(collection(db, "forumPosts", post.id, "comments"), {
        text: clean.slice(0, 1200),
        authorLabel,
        authorType,
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch {
      setError("Your comment could not be posted. Deploy the included Firestore rules.");
    }
  };

  return (
    <div className="comment-thread">
      {comments.map((comment) => (
        <div className="forum-comment" key={comment.id}>
          <div className={`comment-avatar ${comment.authorType === "professional" ? "professional" : ""}`}>
            {comment.authorType === "professional" ? "P" : "A"}
          </div>
          <div>
            <span>{comment.authorLabel || "Anonymous community member"}</span>
            <p>{comment.text}</p>
          </div>
        </div>
      ))}
      {error && <p className="forum-error">{error}</p>}
      <form className="comment-form" onSubmit={submit}>
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a supportive comment…" />
        <button aria-label="Post comment"><Send size={16} /></button>
      </form>
    </div>
  );
}

export default function BetterTogether() {
  const { isProfessional, profile } = useAuth();
  const [posts, setPosts] = useState(samplePosts);
  const [form, setForm] = useState({ title: "", body: "", category: "Mental wellbeing" });
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  const authorLabel = isProfessional
    ? `${profile?.name || "Professional"} · ${profile?.position || "Professional"}`
    : "Anonymous community member";
  const authorType = isProfessional ? "professional" : "user";

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "forumPosts"), orderBy("createdAt", "desc")),
        (snapshot) => {
          const cloudPosts = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
          if (cloudPosts.length) setPosts(cloudPosts);
        },
        () => {},
      ),
    [],
  );

  const submitPost = async (event) => {
    event.preventDefault();
    setError("");
    const draft = {
      title: form.title.trim().slice(0, 140),
      body: form.body.trim().slice(0, 3000),
      category: form.category,
      authorLabel,
      authorType,
      createdAt: serverTimestamp(),
    };
    try {
      const result = await addDoc(collection(db, "forumPosts"), draft);
      setPosts((current) => [
        { ...draft, id: result.id, createdAt: { toDate: () => new Date() } },
        ...current,
      ]);
      setForm({ title: "", body: "", category: "Mental wellbeing" });
    } catch {
      setError("Your story could not be published. Deploy the included Firestore rules, then try again.");
    }
  };

  const categories = ["All", "Mental wellbeing", "Family & caregiving", "Access to services", "Youth", "Other"];
  const visiblePosts = filter === "All" ? posts : posts.filter((post) => post.category === filter);

  return (
    <PageShell
      eyebrow="A forum for real life"
      title="Better Together"
      description="Share what is weighing on you, find people who understand, and receive grounded support from the community and professionals."
      actions={<div className="anonymous-badge"><ShieldCheck size={16} /> Members stay anonymous</div>}
    >
      <div className="forum-layout">
        <aside className="forum-compose-card">
          <div className="compose-icon"><HeartHandshake size={24} /></div>
          <p className="eyebrow">Share safely</p>
          <h2>What’s on your mind?</h2>
          <p className="compose-note">
            {isProfessional
              ? "Your professional name and position will appear with your post."
              : "Your name and account details will never appear with this post."}
          </p>
          <form onSubmit={submitPost}>
            <label>
              Topic
              <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Give your story a short title" />
            </label>
            <label>
              Category
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                {categories.slice(1).map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label>
              Your grievance or experience
              <textarea required rows="7" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="Share only what feels safe to make public…" />
            </label>
            {error && <p className="forum-error">{error}</p>}
            <button><Sparkles size={16} /> Publish to the forum</button>
          </form>
          <p className="safety-copy">This peer forum is not an emergency service. If you are in immediate danger, contact local emergency services.</p>
        </aside>

        <section className="forum-feed">
          <div className="forum-filter-row">
            <div>
              <p className="eyebrow">Community voices</p>
              <h2>Recent conversations</h2>
            </div>
            <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter posts by category">
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </div>

          {visiblePosts.map((post) => (
            <article className="forum-post" key={post.id}>
              <div className="post-meta">
                <span className={`forum-avatar ${post.authorType === "professional" ? "professional" : ""}`}>
                  {post.authorType === "professional" ? "P" : "A"}
                </span>
                <div>
                  <strong>{post.authorLabel || "Anonymous community member"}</strong>
                  <span>{relativeTime(post.createdAt)} · {post.category}</span>
                </div>
              </div>
              <h3>{post.title}</h3>
              <p className="post-body">{post.body}</p>
              <div className="comment-label"><MessageCircle size={15} /> Community responses</div>
              <CommentThread post={post} authorLabel={authorLabel} authorType={authorType} />
            </article>
          ))}
        </section>
      </div>
    </PageShell>
  );
}
