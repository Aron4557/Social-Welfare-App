// src/components/DonationCampaign.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Heart, Coffee, Shield, Gift, 
  DollarSign, CheckCircle, Target, 
  Package, Clock, Phone, LogIn, UserRoundPlus, LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SOFIAssistant from "./SOFIAssistant";
import logo from "../assets/logo.png";
import "./DonationCampaign.css";

const iconMap = {
  Users: Users,
  Heart: Heart,
  Coffee: Coffee,
};

export default function DonationCampaign({ 
  title, 
  campaign, 
  description, 
  icon, 
  color, 
  target, 
  goal, 
  raised: initialRaised, 
  donors: initialDonors 
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [donationType, setDonationType] = useState("money");
  const [donationItem, setDonationItem] = useState("");
  const [donationHours, setDonationHours] = useState("");
  const [raised, setRaised] = useState(initialRaised);
  const [donors, setDonors] = useState(initialDonors);
  const [showSuccess, setShowSuccess] = useState(false);
  const [donationHistory, setDonationHistory] = useState([]);
  const logoRef = useRef(null);
  const emergencyRef = useRef(null);

  const IconComponent = iconMap[icon] || Users;
  const progress = (raised / goal) * 100;
  const quickAmounts = [25, 50, 100, 250, 500];

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount(null);
    }
  };

  const handleDonationTypeChange = (type) => {
    setDonationType(type);
    setSelectedAmount(null);
    setCustomAmount("");
    setDonationItem("");
    setDonationHours("");
  };

  const handleSubmitDonation = (e) => {
    e.preventDefault();
    
    let amount = 0;
    let donationDetails = {};

    if (donationType === "money") {
      amount = selectedAmount || parseInt(customAmount) || 0;
      if (amount <= 0) {
        alert("Please select or enter a valid donation amount.");
        return;
      }
      donationDetails = { type: "money", amount };
    } else if (donationType === "items") {
      if (!donationItem.trim()) {
        alert("Please describe the items you want to donate.");
        return;
      }
      donationDetails = { type: "items", item: donationItem };
    } else if (donationType === "time") {
      const hours = parseInt(donationHours);
      if (!hours || hours <= 0) {
        alert("Please enter a valid number of hours.");
        return;
      }
      donationDetails = { type: "time", hours };
    }

    // Update campaign stats
    if (donationType === "money") {
      setRaised(prev => prev + amount);
    }
    setDonors(prev => prev + 1);

    // Add to history
    const newDonation = {
      id: Date.now(),
      campaign: campaign,
      type: donationType,
      ...donationDetails,
      date: new Date().toISOString(),
      donor: user?.name || "Anonymous"
    };
    setDonationHistory(prev => [newDonation, ...prev]);

    // Show success
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedAmount(null);
      setCustomAmount("");
      setDonationItem("");
      setDonationHours("");
    }, 3000);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getDonationTypeIcon = (type) => {
    switch(type) {
      case "money": return <DollarSign size={16} />;
      case "items": return <Package size={16} />;
      case "time": return <Clock size={16} />;
      default: return <Gift size={16} />;
    }
  };

  return (
    <div className="campaign-page">
      {/* EXACT SAME HEADER as Home.jsx */}
      <header className="beacon-header">
        <div className="beacon-logo-wrap">
          <img 
            ref={logoRef}
            src={logo} 
            alt="Social Welfare logo" 
            className="beacon-logo" 
            onClick={() => navigate("/")}
            style={{ cursor: 'pointer' }}
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
          <button className="emergency-btn" ref={emergencyRef} onClick={() => alert("Emergency services contacted!")}>
            <Phone size={18} />
            <span>Emergency</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="campaign-hero" style={{ background: `linear-gradient(135deg, ${color}dd, ${color}88)` }}>
        <div className="campaign-hero-overlay" />
        <div className="campaign-hero-content">
          <div className="campaign-icon-large" style={{ color, background: `${color}22` }}>
            <IconComponent size={48} />
          </div>
          <h1>{title}</h1>
          <p className="campaign-subtitle">{campaign}</p>
          <p className="campaign-description">{description}</p>
          <div className="campaign-stats">
            <div className="campaign-stat">
              <Target size={20} />
              <span>Target: {target}</span>
            </div>
            <div className="campaign-stat">
              <Users size={20} />
              <span>{donors} donors</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="campaign-content">
        <div className="container">
          <div className="campaign-grid">
            {/* Progress Section */}
            <div className="campaign-details">
              <div className="progress-card">
                <div className="progress-header">
                  <span className="raised">${raised.toLocaleString()} raised</span>
                  <span className="goal">Goal: ${goal.toLocaleString()}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min(progress, 100)}%`, background: color }}
                  />
                </div>
                <div className="progress-percentage">{Math.min(progress, 100).toFixed(1)}%</div>
              </div>

              <div className="impact-card">
                <h3>Your Impact</h3>
                <div className="impact-grid">
                  <div className="impact-item">
                    <CheckCircle size={20} color={color} />
                    <span>Direct support to {target}</span>
                  </div>
                  <div className="impact-item">
                    <CheckCircle size={20} color={color} />
                    <span>100% goes to the cause</span>
                  </div>
                  <div className="impact-item">
                    <CheckCircle size={20} color={color} />
                    <span>Tax-deductible donation</span>
                  </div>
                  <div className="impact-item">
                    <CheckCircle size={20} color={color} />
                    <span>Monthly impact reports</span>
                  </div>
                </div>
              </div>

              {/* Donation History */}
              {donationHistory.length > 0 && (
                <div className="history-card">
                  <h3>Recent Donations</h3>
                  <div className="history-list">
                    {donationHistory.slice(0, 5).map((donation) => (
                      <div className="history-item" key={donation.id}>
                        <div className="history-icon" style={{ color }}>
                          {getDonationTypeIcon(donation.type)}
                        </div>
                        <div className="history-info">
                          <span className="history-donor">{donation.donor}</span>
                          <span className="history-detail">
                            {donation.type === "money" && `$${donation.amount}`}
                            {donation.type === "items" && donation.item}
                            {donation.type === "time" && `${donation.hours} hours`}
                          </span>
                        </div>
                        <span className="history-date">
                          {new Date(donation.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Donation Form */}
            <div className="donation-form-container">
              <div className="donation-form-card">
                <h2>Make a Donation</h2>
                <p className="form-subtitle">Support {campaign}</p>

                {/* Donation Type Tabs */}
                <div className="donation-tabs">
                  <button 
                    className={`tab-btn ${donationType === 'money' ? 'active' : ''}`}
                    onClick={() => handleDonationTypeChange('money')}
                  >
                    <DollarSign size={18} />
                    Money
                  </button>
                  <button 
                    className={`tab-btn ${donationType === 'items' ? 'active' : ''}`}
                    onClick={() => handleDonationTypeChange('items')}
                  >
                    <Package size={18} />
                    Items
                  </button>
                  <button 
                    className={`tab-btn ${donationType === 'time' ? 'active' : ''}`}
                    onClick={() => handleDonationTypeChange('time')}
                  >
                    <Clock size={18} />
                    Time
                  </button>
                </div>

                <form onSubmit={handleSubmitDonation}>
                  {donationType === "money" && (
                    <div className="amount-section">
                      <label>Select Amount</label>
                      <div className="quick-amounts">
                        {quickAmounts.map((amount) => (
                          <button
                            type="button"
                            key={amount}
                            className={`amount-btn ${selectedAmount === amount ? 'active' : ''}`}
                            onClick={() => handleAmountSelect(amount)}
                            style={{ borderColor: selectedAmount === amount ? color : '#e0e0e0' }}
                          >
                            ${amount}
                          </button>
                        ))}
                      </div>
                      <div className="custom-amount">
                        <DollarSign size={18} className="dollar-icon" />
                        <input
                          type="text"
                          placeholder="Custom amount"
                          value={customAmount}
                          onChange={handleCustomAmountChange}
                          className="custom-input"
                        />
                      </div>
                    </div>
                  )}

                  {donationType === "items" && (
                    <div className="form-group">
                      <label>What items are you donating?</label>
                      <div className="item-input-group">
                        <Package size={20} className="item-icon" />
                        <input
                          type="text"
                          placeholder="e.g., School supplies, Food, Clothes, Books..."
                          value={donationItem}
                          onChange={(e) => setDonationItem(e.target.value)}
                          className="item-input"
                        />
                      </div>
                      <p className="helper-text">We'll contact you to arrange pickup or drop-off.</p>
                    </div>
                  )}

                  {donationType === "time" && (
                    <div className="form-group">
                      <label>How many hours can you volunteer?</label>
                      <div className="time-input-group">
                        <Clock size={20} className="time-icon" />
                        <input
                          type="number"
                          placeholder="Enter hours..."
                          value={donationHours}
                          onChange={(e) => setDonationHours(e.target.value)}
                          className="time-input"
                        />
                        <span className="time-suffix">hours</span>
                      </div>
                      <p className="helper-text">We'll connect you with volunteer opportunities.</p>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Frequency</label>
                    <div className="frequency-options">
                      <label className="frequency-option">
                        <input type="radio" name="frequency" value="one-time" defaultChecked />
                        One-time
                      </label>
                      <label className="frequency-option">
                        <input type="radio" name="frequency" value="monthly" />
                        Monthly
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="submit-donation"
                    style={{ background: color }}
                  >
                    <Gift size={20} />
                    {donationType === "money" && "Donate Now"}
                    {donationType === "items" && "Donate Items"}
                    {donationType === "time" && "Volunteer Now"}
                  </button>

                  <p className="secure-note">
                    <Shield size={16} />
                    Your donation is secure and tax-deductible
                  </p>
                </form>

                {showSuccess && (
                  <div className="success-message">
                    <CheckCircle size={24} />
                    <span>
                      {donationType === "money" && "Thank you for your monetary donation!"}
                      {donationType === "items" && "Thank you for your item donation! We'll contact you soon."}
                      {donationType === "time" && "Thank you for volunteering your time!"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SOFIAssistant />
    </div>
  );
}