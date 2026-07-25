// src/pages/Home.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  BookOpen, MapPin, MessageCircle, Megaphone, HeartHandshake, 
  Users, Heart, Coffee, Phone, Search, ArrowRight, Shield, Sparkles,
  LogIn, UserRoundPlus, LogOut
} from "lucide-react";
import SOFIAssistant from "../components/SOFIAssistant";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import bg from "../assets/background.jpg";
import "./Home.css";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  { 
    title: "Info Hub", 
    desc: "Verified answers on health, mind, and family.", 
    Icon: BookOpen,
    link: "/info-hub"
  },
  { 
    title: "Find Help Near Me", 
    desc: "Clinics, counselors, and social workers nearby.", 
    Icon: MapPin,
    link: "/find-help"
  },
  { 
    title: "Talk to Someone", 
    desc: "Anonymous chat with a real person. No judgment.", 
    Icon: MessageCircle,
    link: "/talk-to-someone"
  },
  { 
    title: "Campaigns", 
    desc: "Awareness drives and events happening near you.", 
    Icon: Megaphone,
    link: "/campaigns"
  },
  { 
    title: "Better Together", 
    desc: "Share anonymously and find community support.", 
    Icon: HeartHandshake,
    link: "/better-together"
  },
];

const DONATION_CARDS = [
  { 
    title: "Help Children", 
    desc: "Provide education, healthcare, and hope to children in need.", 
    Icon: Users,
    color: "#FF7A45",
    bgColor: "rgba(255, 122, 69, 0.1)",
    target: "2,500 children"
  },
  { 
    title: "Support Elderly", 
    desc: "Bring comfort and care to seniors who need our support.", 
    Icon: Heart,
    color: "#3AC4A3",
    bgColor: "rgba(58, 196, 163, 0.1)",
    target: "1,200 seniors"
  },
  { 
    title: "Feed the Poor", 
    desc: "Provide meals and basic necessities to those in need.", 
    Icon: Coffee,
    color: "#FFB088",
    bgColor: "rgba(255, 176, 136, 0.1)",
    target: "5,000 meals"
  },
];

const HEADLINE_WORDS = ["We're", "better", "together."];

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const headlineRef = useRef(null);
  const cardsRef = useRef([]);
  const donationRef = useRef([]);
  const logoRef = useRef(null);
  const emergencyRef = useRef(null);
  const searchRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  const handleFeatureClick = (link) => {
    if (link === "#") {
      alert("This feature is coming soon!");
    } else {
      navigate(link);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/info-hub?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const words = headlineRef.current?.querySelectorAll(".word span") || [];

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set(words, { opacity: 1, y: 0, filter: "blur(0px)" });
        gsap.set(".beacon-subhead", { opacity: 1, y: 0 });
        gsap.set(".feature-card", { opacity: 1, y: 0 });
        gsap.set(".donation-card", { opacity: 1, y: 0 });
      } else {
        // Logo breathing animation
        gsap.to(logoRef.current, {
          scale: 1.08,
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        // Emergency button animations
        gsap.to(emergencyRef.current, {
          y: -10,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        gsap.to(emergencyRef.current, {
          boxShadow: "0 0 30px rgba(255, 0, 0, 0.4)",
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        // Search bar animation
        gsap.fromTo(searchRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, delay: 0.5 }
        );

        // Headline animation
        gsap.set(words, { opacity: 0, y: 18, filter: "blur(10px)" });
        gsap.set(".beacon-subhead", { opacity: 0, y: 10 });
        gsap.set(".feature-card", { opacity: 0, y: 30 });
        gsap.set(".donation-card", { opacity: 0, y: 30 });

        const tl = gsap.timeline({ delay: 0.2 });
        
        tl.to(words, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.12,
        })
        .to(".beacon-subhead", { 
          opacity: 1, 
          y: 0, 
          duration: 0.6 
        }, "-=0.3")
        .to(".feature-card", {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08,
        }, "-=0.2")
        .to(".donation-card", {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.1,
        }, "-=0.1");

        gsap.to(".scroll-cue", { 
          y: 6, 
          repeat: -1, 
          yoyo: true, 
          duration: 1.2, 
          ease: "sine.inOut" 
        });
      }

      // Card floating animations
      cardsRef.current.forEach((card, i) => {
        if (!card || prefersReduced) return;
        gsap.to(card, {
          y: i % 2 === 0 ? -6 : 6,
          duration: 2 + (i * 0.3),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.1,
        });
      });

      // Donation cards floating
      donationRef.current.forEach((card, i) => {
        if (!card || prefersReduced) return;
        gsap.to(card, {
          y: i % 2 === 0 ? 8 : -8,
          duration: 2.5 + (i * 0.2),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.15,
        });
      });

      ScrollTrigger.refresh();
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="beacon-home">
      {/* Header */}
      <header className="beacon-header">
        <div className="beacon-logo-wrap">
          <img 
            ref={logoRef}
            src={logo} 
            alt="Social Welfare logo" 
            className="beacon-logo" 
          />
        </div>
        <div className="header-actions">
          {user ? (
            <button className="home-auth-btn home-auth-secondary" onClick={logout}>
              <LogOut size={16} /> <span>Sign out</span>
            </button>
          ) : (
            <>
              <button className="home-auth-btn home-auth-secondary" onClick={() => navigate("/sign-in")}>
                <LogIn size={16} /> <span>Sign in</span>
              </button>
              <button className="home-auth-btn" onClick={() => navigate("/sign-up")}>
                <UserRoundPlus size={16} /> <span>Sign up</span>
              </button>
            </>
          )}
          <button
            className="emergency-btn"
            ref={emergencyRef}
            type="button"
            onClick={() => setIsEmergencyOpen(true)}
          >
            <Phone size={18} />
            <span>Emergency</span>
          </button>
          <button
            className="emergency-btn mobile"
            type="button"
            onClick={() => setIsEmergencyOpen(true)}
            aria-label="Open emergency contacts"
          >
            <Phone size={18} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="beacon-hero">
        <div className="beacon-hero-bg" style={{ backgroundImage: `url(${bg})` }} />
        <div className="beacon-hero-overlay" />

        <div className="beacon-hero-content">
          {/* Headline */}
          <div className="beacon-headline-wrapper">
            <h1 className="beacon-headline" ref={headlineRef}>
              {HEADLINE_WORDS.map((w, i) => (
                <span className={`word ${i === HEADLINE_WORDS.length - 1 ? "word-accent" : ""}`} key={w}>
                  <span>{w}</span>
                </span>
              ))}
            </h1>
            <p className="beacon-subhead">
              Find support. Talk to someone. You're not alone.
            </p>
          </div>

          {/* AI-Powered Search */}
          <div className="search-container" ref={searchRef}>
            <form onSubmit={handleSearch} className="search-bar">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search for services or counselors near you..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                <Sparkles size={16} />
                AI Search
              </button>
            </form>
          </div>

          {/* Feature Cards */}
          <div className="feature-grid">
            {FEATURES.map((feature, index) => (
              <div 
                className="feature-card" 
                key={feature.title}
                ref={(el) => (cardsRef.current[index] = el)}
                onClick={() => handleFeatureClick(feature.link)}
                style={{ cursor: 'pointer' }}
              >
                <div className="feature-icon">
                  <feature.Icon size={22} strokeWidth={1.6} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Donation Cards */}
          <div className="donation-section">
            <h2 className="section-title">Make a Difference Today</h2>
            <p className="section-subtitle">Your support changes lives</p>
            <div className="donation-grid">
              {DONATION_CARDS.map((donation, index) => (
                <div 
                  className="donation-card"
                  key={donation.title}
                  ref={(el) => (donationRef.current[index] = el)}
                  style={{ 
                    borderBottom: `4px solid ${donation.color}`,
                    background: donation.bgColor
                  }}
                >
                  <div className="donation-icon" style={{ color: donation.color, background: donation.bgColor }}>
                    <donation.Icon size={28} />
                  </div>
                  <h3>{donation.title}</h3>
                  <p>{donation.desc}</p>
                  <div className="donation-target">
                    <Shield size={16} />
                    <span>Target: {donation.target}</span>
                  </div>
                  <button className="donate-btn" style={{ background: donation.color }}>
                    Donate Now
                    <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Cue */}
        <div className="scroll-cue" aria-hidden="true">
          <span>scroll</span>
          <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
            <path d="M7 1v16M1 11l6 6 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* SOFI Assistant */}
      <SOFIAssistant />

      <Modal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        title="Emergency contacts"
      >
        <p className="emergency-popup-intro">
          Choose the service you need. Tapping a button will start a phone call.
        </p>

        <div className="emergency-call-list">
          <a className="emergency-call-option" href="tel:10111">
            <Phone size={20} />
            <span>
              <strong>Namibian Police</strong>
              <small>10111</small>
            </span>
          </a>

          <a className="emergency-call-option" href="tel:+26461232221">
            <Phone size={20} />
            <span>
              <strong>Suicide &amp; Crisis Hotline</strong>
              <small>+264 61 232 221</small>
            </span>
          </a>

          <a className="emergency-call-option" href="tel:112">
            <Phone size={20} />
            <span>
              <strong>Ambulance / Urgent Medical Help</strong>
              <small>112 — ask for the nearest available care</small>
            </span>
          </a>
        </div>

        <button
          className="emergency-popup-cancel"
          type="button"
          onClick={() => setIsEmergencyOpen(false)}
        >
          Cancel
        </button>
      </Modal>
    </div>
  );
}
