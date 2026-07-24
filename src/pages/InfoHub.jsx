// src/pages/InfoHub.jsx
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  ArrowLeft, Brain, Pill, Shield, Heart, 
  ChevronRight, BookOpen, Sparkles, 
  Phone, MessageCircle, Users,
  Activity, AlertCircle,
  ExternalLink, Share2, Bookmark,
  Search, AlertTriangle, PhoneCall, Ambulance,
  ShieldAlert, LifeBuoy, Building, MapPin
} from "lucide-react";
import SOFIAssistant from "../components/SOFIAssistant";
import logo from "../assets/logo.png";
import "./InfoHub.css";

gsap.registerPlugin(ScrollTrigger);

// Emergency Contacts Data
const EMERGENCY_CONTACTS = {
  police: {
    title: "Police Emergency",
    number: "10111",
    description: "Toll-free nationwide police emergency",
    icon: ShieldAlert,
    color: "#FF3B30"
  },
  mobile: {
    title: "Mobile Emergency",
    number: "112",
    description: "Works from any mobile phone",
    icon: PhoneCall,
    color: "#FF7A45"
  },
  ambulance: {
    title: "State Ambulance / Fire",
    number: "10177",
    description: "State emergency medical and fire services",
    icon: Ambulance,
    color: "#FF3B30"
  },
  medicalRescue: {
    title: "Medical Rescue",
    number: "924",
    description: "E-Med Rescue 24 (24/7 medical emergency)",
    icon: LifeBuoy,
    color: "#34C759"
  },
  lifeLink: {
    title: "LifeLink Emergency",
    number: "999 / 085 900",
    description: "From landlines or cell phones",
    icon: Heart,
    color: "#34C759"
  },
  windhoekFire: {
    title: "Windhoek Fire Brigade",
    number: "061 211 111",
    description: "City of Windhoek Emergency Services",
    icon: Building,
    color: "#FF7A45"
  },
  windhoekPolice: {
    title: "Windhoek City Police",
    number: "061 302 302",
    description: "24-hour crime prevention",
    icon: Shield,
    color: "#8B5CF6"
  },
  mva: {
    title: "MVA Accident Response",
    number: "061 211 111",
    description: "National accident response",
    icon: AlertTriangle,
    color: "#FF9500"
  }
};

const CATEGORIES = [
  {
    id: 'mental-health',
    title: 'Mental Health',
    icon: Brain,
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.08)',
    description: 'Support for anxiety, depression, grief, and mental wellness',
    topics: [
      { 
        title: 'Anxiety & Stress', 
        icon: Activity,
        description: 'Learn to manage anxiety and stress with practical techniques',
        content: [
          'Anxiety is a natural response to stress, but when it becomes overwhelming, it can affect daily life.',
          'Common symptoms include: rapid heartbeat, racing thoughts, difficulty sleeping, and restlessness.',
          'Coping strategies: deep breathing exercises, mindfulness meditation, regular exercise, and talking to someone you trust.',
          'When to seek help: If anxiety interferes with work, relationships, or daily activities, consider speaking with a professional.'
        ]
      },
      { 
        title: 'Depression', 
        icon: AlertCircle,
        description: 'Understanding depression and finding ways to cope',
        content: [
          'Depression is more than just feeling sad. It is a serious mental health condition that affects how you feel, think, and handle daily activities.',
          'Signs of depression: persistent sadness, loss of interest in activities, changes in appetite or sleep, fatigue, and feelings of worthlessness.',
          'Self-care strategies: maintain a routine, connect with loved ones, engage in activities you enjoy, and practice self-compassion.',
          'Professional help: Therapy and medication can be effective treatments. Do not hesitate to reach out to a mental health professional.'
        ]
      },
      { 
        title: 'Loss & Grief', 
        icon: Heart,
        description: 'Navigating through loss and finding healing',
        content: [
          'Grief is a natural response to loss. It can feel overwhelming, but it is a process that takes time.',
          'Stages of grief: denial, anger, bargaining, depression, and acceptance. Everyone experiences grief differently.',
          'Coping with grief: allow yourself to feel, talk about your loved one, join a support group, and be patient with yourself.',
          'Remember: It is okay to seek professional support if grief becomes too heavy to carry alone.'
        ]
      },
      { 
        title: 'Suicide & Self-Harm', 
        icon: AlertCircle,
        description: 'Immediate help and resources for crisis situations',
        content: [
          'If you are in immediate danger, please call 911 or go to your nearest emergency room.',
          'National Crisis Hotline: 1-800-273-8255 (Available 24/7)',
          'Text HOME to 741741 for crisis support',
          'Remember: You are not alone. Your life matters. Reach out to someone you trust or a professional.',
          'Resources are available to help you through this difficult time.'
        ]
      }
    ]
  },
  {
    id: 'drug-alcohol',
    title: 'Drug & Alcohol Abuse',
    icon: Pill,
    color: '#FF7A45',
    bgColor: 'rgba(255, 122, 69, 0.08)',
    description: 'Support for substance abuse and addiction recovery',
    topics: [
      {
        title: 'Understanding Addiction',
        icon: Pill,
        description: 'Learn about addiction and its effects',
        content: [
          'Addiction is a chronic disease that affects the brain and behavior. It is characterized by compulsive substance use despite harmful consequences.',
          'Common signs: increased tolerance, withdrawal symptoms, loss of control, and neglect of responsibilities.',
          'Recovery is possible: with proper support and treatment, many people successfully overcome addiction.',
          'Treatment options include: counseling, medication-assisted treatment, support groups, and inpatient rehab programs.'
        ]
      },
      {
        title: 'Getting Help',
        icon: Phone,
        description: 'Resources for treatment and support',
        content: [
          'SAMHSA National Helpline: 1-800-662-4357 (Free, confidential, 24/7)',
          'Find local treatment centers using our "Find Help Near Me" feature',
          'Support groups like AA, NA, and SMART Recovery offer community and accountability',
          'Remember: Asking for help is a sign of strength, not weakness.'
        ]
      }
    ]
  },
  {
    id: 'violence',
    title: 'Violence & Abuse',
    icon: Shield,
    color: '#FF3B30',
    bgColor: 'rgba(255, 59, 48, 0.08)',
    description: 'Support for victims of violence and abuse',
    topics: [
      {
        title: 'Domestic Violence',
        icon: Shield,
        description: 'Resources for those experiencing domestic abuse',
        content: [
          'If you are in immediate danger, call 911',
          'National Domestic Violence Hotline: 1-800-799-SAFE (7233)',
          'Emergency shelters and safe houses are available in most communities',
          'Create a safety plan: identify safe spaces, pack essential items, and know your escape routes.',
          'You deserve to feel safe. Support is available, and you are not alone.'
        ]
      },
      {
        title: 'Sexual Assault',
        icon: Shield,
        description: 'Resources and support for survivors',
        content: [
          'National Sexual Assault Hotline: 1-800-656-HOPE (4673)',
          'Medical care is available at emergency rooms. Evidence can be collected even if you are unsure about reporting.',
          'Counseling and support groups are available for survivors.',
          'Remember: What happened is not your fault. You are not alone, and help is available.'
        ]
      }
    ]
  },
  {
    id: 'reproductive-health',
    title: 'Reproductive Health',
    icon: Heart,
    color: '#34C759',
    bgColor: 'rgba(52, 199, 89, 0.08)',
    description: 'Information on reproductive health and wellness',
    topics: [
      {
        title: 'Sexual Health',
        icon: Heart,
        description: 'Resources for sexual health and wellness',
        content: [
          'Regular check-ups and screenings are important for maintaining reproductive health.',
          'STI testing and prevention: Regular testing, safe sex practices, and open communication with partners are key.',
          'Contraception options are available. Consult with a healthcare provider to find what works best for you.',
          'Planned Parenthood and local health clinics offer affordable, confidential services.'
        ]
      },
      {
        title: 'Pregnancy Support',
        icon: Users,
        description: 'Resources for pregnancy and parenting',
        content: [
          'Prenatal care is essential for a healthy pregnancy. Schedule regular check-ups with a healthcare provider.',
          'Support services: WIC, prenatal classes, and parenting groups are available in most communities.',
          'Mental health support: Postpartum depression is common and treatable. Do not hesitate to seek help.',
          'Resources are available for all stages of pregnancy and parenting.'
        ]
      }
    ]
  }
];

export default function InfoHub() {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showEmergency, setShowEmergency] = useState(false);
  
  const initialSearchQuery = new URLSearchParams(location.search).get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  
  const headerRef = useRef(null);
  const heroRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam !== null && searchParam !== searchQuery) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.info-hero-title span',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" }
      );

      gsap.fromTo('.info-hero-subtitle',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power2.out" }
      );

      gsap.fromTo('.info-hero-description',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: "power2.out" }
      );

      gsap.fromTo('.info-search',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.7, ease: "power2.out" }
      );

      gsap.fromTo('.emergency-section',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.9, ease: "power2.out" }
      );

      gsap.fromTo('.category-card',
        { opacity: 0, y: 40, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: '.category-grid',
            start: 'top 80%',
          }
        }
      );

      ScrollTrigger.refresh();
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      gsap.fromTo('.topic-card',
        { opacity: 0, x: -30 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out"
        }
      );
    }
  }, [selectedCategory]);

  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setSelectedTopic(null);
    } else {
      setSelectedCategory(categoryId);
      setSelectedTopic(null);
    }
  };

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
  };

  const goBack = () => {
    if (selectedTopic) {
      setSelectedTopic(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  const filteredCategories = CATEGORIES.filter(cat => 
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="info-hub">
      <header className="info-header" ref={headerRef}>
        <div className="info-header-left">
          <div className="info-logo-wrap">
            <img src={logo} alt="Social Welfare logo" className="info-logo" />
          </div>
        </div>
        <div className="info-header-center">
          <h2 className="info-header-title">
            <BookOpen size={20} />
            Info Hub
          </h2>
        </div>
        <div className="info-header-right">
          <button className="info-header-btn emergency-header-btn" onClick={() => setShowEmergency(!showEmergency)}>
            <AlertTriangle size={18} />
          </button>
        </div>
      </header>

      <section className="info-hero" ref={heroRef}>
        <div className="info-hero-content">
          <h1 className="info-hero-title">
            <span>Knowledge</span>
            <span>is</span>
            <span>Power</span>
          </h1>
          <p className="info-hero-subtitle">Find the information and support you need</p>
          <p className="info-hero-description">
            Explore our comprehensive guides on mental health, substance abuse, 
            violence prevention, and reproductive health.
          </p>
          
          <div className="info-search">
            <input
              type="text"
              placeholder="Search topics, categories, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="info-search-input"
            />
            <button className="info-search-btn">
              <Search size={20} />
              Search
            </button>
          </div>

          {/* Emergency Contacts Section */}
          <div className="emergency-section">
            <div className="emergency-header" onClick={() => setShowEmergency(!showEmergency)}>
              <AlertTriangle size={20} color="#FF3B30" />
              <span>Emergency Contacts - Namibia</span>
              <ChevronRight size={18} className={`emergency-toggle ${showEmergency ? 'open' : ''}`} />
            </div>
            
            {showEmergency && (
              <div className="emergency-grid">
                {Object.entries(EMERGENCY_CONTACTS).map(([key, contact]) => (
                  <div key={key} className="emergency-card" style={{ borderLeftColor: contact.color }}>
                    <div className="emergency-card-icon" style={{ color: contact.color }}>
                      <contact.icon size={20} />
                    </div>
                    <div className="emergency-card-info">
                      <h4>{contact.title}</h4>
                      <p>{contact.description}</p>
                      <span className="emergency-number">{contact.number}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="info-hero-bg"></div>
      </section>

      <section className="info-content">
        {/* Live Counselor Button - Always Visible */}
        <div className="live-counselor-banner">
          <div className="live-counselor-content">
            <div className="live-counselor-icon">
              <MessageCircle size={28} />
            </div>
            <div className="live-counselor-text">
              <h3>Need to talk to someone?</h3>
              <p>Our trained counselors are here to listen and support you 24/7</p>
            </div>
            <button className="live-counselor-btn">
              <Phone size={18} />
              Talk to a Live Counselor
              <span className="live-badge">Available Now</span>
            </button>
          </div>
        </div>

        {!selectedCategory && !selectedTopic && (
          <>
            <div className="info-category-header">
              <h2>Explore Categories</h2>
              <p>Select a category to learn more about available resources and support</p>
            </div>
            <div className="category-grid">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="category-card"
                  onClick={() => handleCategoryClick(category.id)}
                  style={{ 
                    borderBottomColor: category.color,
                    background: category.bgColor
                  }}
                >
                  <div className="category-icon" style={{ background: category.color }}>
                    <category.icon size={28} color="white" />
                  </div>
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                  <div className="category-topics-count">
                    <span>{category.topics.length} topics</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedCategory && !selectedTopic && (
          <div className="category-view">
            <button className="back-btn" onClick={goBack}>
              <ArrowLeft size={20} />
              Back to Categories
            </button>
            
            {CATEGORIES.filter(c => c.id === selectedCategory).map((category) => (
              <div key={category.id} className="category-detail">
                <div className="category-detail-header">
                  <div className="category-detail-icon" style={{ background: category.color }}>
                    <category.icon size={32} color="white" />
                  </div>
                  <div>
                    <h2>{category.title}</h2>
                    <p>{category.description}</p>
                  </div>
                </div>
                
                <div className="topics-grid">
                  {category.topics.map((topic, index) => (
                    <div
                      key={index}
                      className="topic-card"
                      onClick={() => handleTopicClick(topic)}
                    >
                      <div className="topic-card-icon" style={{ color: category.color }}>
                        <topic.icon size={24} />
                      </div>
                      <h3>{topic.title}</h3>
                      <p>{topic.description}</p>
                      <div className="topic-card-action">
                        <span>Learn More</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTopic && (
          <div className="topic-detail">
            <button className="back-btn" onClick={goBack}>
              <ArrowLeft size={20} />
              Back to Topics
            </button>
            
            <div className="topic-detail-content">
              <div className="topic-detail-header">
                <div className="topic-detail-icon">
                  <selectedTopic.icon size={32} />
                </div>
                <h2>{selectedTopic.title}</h2>
                <p>{selectedTopic.description}</p>
              </div>

              <div className="topic-detail-body">
                {selectedTopic.content.map((paragraph, index) => (
                  <div key={index} className="topic-paragraph">
                    <div className="topic-paragraph-icon">
                      <Sparkles size={16} />
                    </div>
                    <p>{paragraph}</p>
                  </div>
                ))}
              </div>

              <div className="topic-actions">
                <button className="topic-action-btn primary">
                  <Phone size={18} />
                  Get Help Now
                </button>
                <button className="topic-action-btn counselor-btn">
                  <MessageCircle size={18} />
                  Talk to a Counselor
                </button>
                <button className="topic-action-btn">
                  <Share2 size={18} />
                  Share
                </button>
                <button className="topic-action-btn">
                  <Bookmark size={18} />
                  Save
                </button>
              </div>

              <div className="topic-resources">
                <h4>Additional Resources</h4>
                <div className="resource-links">
                  <a href="#" className="resource-link">
                    <ExternalLink size={16} />
                    Find a Counselor Near You
                  </a>
                  <a href="#" className="resource-link">
                    <ExternalLink size={16} />
                    Join a Support Group
                  </a>
                  <a href="#" className="resource-link">
                    <ExternalLink size={16} />
                    Download Self-Help Guide
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <footer className="info-footer">
        <div className="info-footer-content">
          <p>2024 Social Welfare Platform. All rights reserved.</p>
          <div className="info-footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Us</a>
          </div>
        </div>
      </footer>

      <SOFIAssistant />
    </div>
  );
}