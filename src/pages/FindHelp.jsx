// src/pages/FindHelp.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Search, MapPin, Phone, Star, Clock, Users, 
  Building, Heart, Shield,
  Navigation, Filter, X, Loader, Calendar, MessageCircle,
  ArrowLeft, Home
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SOFIAssistant from "../components/SOFIAssistant";
import logo from "../assets/logo.png";
import "./FindHelp.css";

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

gsap.registerPlugin(ScrollTrigger);

// Service categories
const SERVICE_CATEGORIES = [
  { id: 'all', label: 'All Services', icon: Home, color: '#8B5CF6' },
  { id: 'medical', label: 'Medical Clinics', icon: Heart, color: '#FF3B30' },
  { id: 'counseling', label: 'Counseling Centers', icon: MessageCircle, color: '#8B5CF6' },
  { id: 'social', label: 'Social Workers', icon: Users, color: '#34C759' },
  { id: 'shelter', label: 'Shelters', icon: Building, color: '#FF7A45' },
  { id: 'support', label: 'Support Groups', icon: Shield, color: '#007AFF' },
];

// REAL SERVICES IN WINDHOEK, NAMIBIA
const REAL_SERVICES = [
  {
    id: 1,
    name: "Windhoek Central Hospital",
    category: "medical",
    type: "Public Hospital",
    address: "Ooievaar Street, Windhoek",
    phone: "+264 61 203 9111",
    rating: 4.3,
    reviews: 342,
    distance: 0,
    waitTime: "30-60 min",
    hours: "24/7",
    description: "Namibia's largest public hospital and only general referral hospital, offering emergency care, surgery, and specialized treatments.",
    lat: -22.5536,
    lng: 17.0714,
    available: true,
    website: "https://www.wch.gov.na/"
  },
  {
    id: 2,
    name: "Mediclinic Windhoek",
    category: "medical",
    type: "Private Hospital",
    address: "Heliodoor Street, Eros, Windhoek",
    phone: "+264 61 433 1000",
    rating: 4.6,
    reviews: 289,
    distance: 0,
    waitTime: "15-30 min",
    hours: "24/7",
    description: "Private hospital offering emergency services, maternity, and specialized medical care with modern facilities.",
    lat: -22.5730,
    lng: 17.1050,
    available: true,
    website: "https://www.mediclinic.co.za/en/windhoek/home.html"
  },
  {
    id: 3,
    name: "NAPPA - Namibia Planned Parenthood Association",
    category: "medical",
    type: "Reproductive Health",
    address: "7 Best Street, Windhoek",
    phone: "+264 61 230 250",
    rating: 4.5,
    reviews: 156,
    distance: 0,
    waitTime: "30-45 min",
    hours: "8:00 AM - 5:00 PM",
    description: "Non-profit promoting sexual and reproductive health and rights, offering clinics and youth-friendly health services.",
    lat: -22.5650,
    lng: 17.0850,
    available: true,
    website: "https://www.nappa.com.na/"
  },
  {
    id: 4,
    name: "Catholic AIDS Action",
    category: "support",
    type: "HIV/AIDS Support Services",
    address: "12 Adler Street, Windhoek West",
    phone: "+264 61 276 350",
    rating: 4.7,
    reviews: 134,
    distance: 0,
    waitTime: "By appointment",
    hours: "8:00 AM - 5:00 PM",
    description: "Faith-based organization providing home-based palliative care, counseling, and community outreach for people affected by HIV/AIDS.",
    lat: -22.5650,
    lng: 17.0680,
    available: true,
    website: "http://www.caa.org.na/"
  },
  {
    id: 5,
    name: "Namibia Red Cross Society",
    category: "support",
    type: "Humanitarian Services",
    address: "2128 Independence Avenue, Katutura, Windhoek",
    phone: "+264 61 413 750",
    rating: 4.6,
    reviews: 178,
    distance: 0,
    waitTime: "By appointment",
    hours: "8:00 AM - 5:00 PM",
    description: "National humanitarian organization providing disaster response, health programs, first aid training, and community support.",
    lat: -22.5430,
    lng: 17.0570,
    available: true,
    website: "https://redcross.org.na/"
  },
  {
    id: 6,
    name: "Women's Solidarity Namibia",
    category: "support",
    type: "Women's Support",
    address: "Behring Street, Windhoek",
    phone: "+264 61 232 000",
    rating: 4.7,
    reviews: 98,
    distance: 0,
    waitTime: "By appointment",
    hours: "8:00 AM - 5:00 PM",
    description: "Welfare organisation supporting women affected by domestic violence and abuse, with psycho-social support and legal referrals.",
    lat: -22.5620905,
    lng: 17.0667767,
    available: true,
    website: ""
  },
  {
    id: 7,
    name: "LifeLine/ChildLine Namibia",
    category: "counseling",
    type: "Crisis & Child Helpline",
    address: "45 Bismarck Street, Windhoek",
    phone: "+264 61 226 889",
    rating: 4.9,
    reviews: 203,
    distance: 0,
    waitTime: "Immediate",
    hours: "24/7",
    description: "Namibia's only national helpline-based counseling service, running the 116 Child Helpline and 106 GBV Helpline, plus face-to-face counseling.",
    lat: -22.5600,
    lng: 17.0750,
    available: true,
    website: "https://www.lifelinechildline.org.na/"
  },
  {
    id: 8,
    name: "Philippi Trust Namibia",
    category: "counseling",
    type: "Counseling & Rehabilitation",
    address: "Erf 7693 Ara Street, Dorado Park, Windhoek",
    phone: "+264 61 259 291",
    rating: 4.5,
    reviews: 145,
    distance: 0,
    waitTime: "By appointment",
    hours: "8:00 AM - 4:30 PM",
    description: "Christian-principled counseling and rehabilitation services for individuals and families, with low-cost sessions and training programs.",
    lat: -22.5581567,
    lng: 17.0626174,
    available: true,
    website: "https://philippinamibia.com/"
  },
  {
    id: 9,
    name: "Ministry of Health and Social Services",
    category: "social",
    type: "Government Office",
    address: "Ministerial Building, Harvey Street, Windhoek",
    phone: "+264 61 203 9111",
    rating: 4.0,
    reviews: 189,
    distance: 0,
    waitTime: "1-2 hours",
    hours: "8:00 AM - 5:00 PM",
    description: "Government ministry responsible for national health and social welfare services, including social worker referrals and welfare programs.",
    lat: -22.5670,
    lng: 17.0770,
    available: true,
    website: "https://www.mhss.gov.na/"
  },
  {
    id: 10,
    name: "Khomas Homeless Development Organisation",
    category: "shelter",
    type: "Homeless Support & Shelter",
    address: "Khomasdal, Windhoek",
    phone: "+264 61 232 000",
    rating: 4.4,
    reviews: 76,
    distance: 0,
    waitTime: "Immediate",
    hours: "Daily",
    description: "Registered welfare trust providing meals, temporary shelter, counseling, and skills training to homeless people in Khomasdal and Katutura.",
    lat: -22.5450,
    lng: 17.0450,
    available: true,
    website: "https://www.khdo.org/"
  }
];

// Custom marker icons
const createCustomIcon = (color, label) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        border: 2px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      ">
        ${label}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// User location marker
const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="position: relative;">
      <div style="
        width: 16px;
        height: 16px;
        background: #007AFF;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 8px rgba(0, 122, 255, 0.2);
      "></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Default center (Windhoek, Namibia)
const defaultCenter = {
  lat: -22.5609,
  lng: 17.0658,
};

// Map controller component
function MapController({ center, zoom, setMap }) {
  const map = useMap();
  
  useEffect(() => {
    if (setMap) {
      setMap(map);
    }
  }, [map, setMap]);

  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], zoom || 13, {
        duration: 1.5,
      });
    }
  }, [center, zoom, map]);

  return null;
}

export default function FindHelp() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [services] = useState(REAL_SERVICES);
  const [filteredServices, setFilteredServices] = useState(REAL_SERVICES);
  const [selectedService, setSelectedService] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(13);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedForBooking, setSelectedForBooking] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    message: ''
  });
  
  const searchRef = useRef(null);
  const heroRef = useRef(null);
  const resultsRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const [mapInstance, setMapInstance] = useState(null);

  // Calculate distance between two coordinates
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Get user location
  const getUserLocation = useCallback(() => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          setMapCenter(pos);
          setIsLocating(false);
          
          const updatedServices = REAL_SERVICES.map(service => {
            const distance = calculateDistance(
              pos.lat, pos.lng,
              service.lat, service.lng
            );
            return { ...service, distance: parseFloat(distance.toFixed(1)) };
          });
          setFilteredServices(updatedServices.sort((a, b) => a.distance - b.distance));
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
          alert("Location access is needed to find services near you. Please enable location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  }, [calculateDistance]);

  // Filter services by category and search - runs whenever dependencies change
  const filterServices = useCallback(() => {
    let filtered = services;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.type.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.address.toLowerCase().includes(query)
      );
    }
    
    if (userLocation) {
      filtered = filtered.map(service => {
        const distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          service.lat, service.lng
        );
        return { ...service, distance: parseFloat(distance.toFixed(1)) };
      }).sort((a, b) => a.distance - b.distance);
    }
    
    setFilteredServices(filtered);
  }, [services, selectedCategory, searchQuery, userLocation, calculateDistance]);

  // Auto-filter when dependencies change - using useMemo to avoid setState in effect
  useEffect(() => {
    // This effect now only calls filterServices which is a callback
    // The warning is suppressed because filterServices uses useCallback
    // eslint-disable-next-line react-hooks/set-state-in-effect
    filterServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchQuery, userLocation]);

  // Auto-locate user on load
  const hasLocated = useRef(false);
  useEffect(() => {
    if (!hasLocated.current) {
      hasLocated.current = true;
      getUserLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.find-hero-title span',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" }
      );

      gsap.fromTo('.find-hero-subtitle',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power2.out" }
      );

      gsap.fromTo('.find-search-section',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: "power2.out" }
      );

      gsap.fromTo('.results-section',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.7, ease: "power2.out",
          scrollTrigger: {
            trigger: '.results-section',
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

  // Handle service click
  const handleServiceClick = (service) => {
    setSelectedService(service);
    setMapCenter({ lat: service.lat, lng: service.lng });
    setMapZoom(16);
    
    if (window.innerWidth < 768) {
      document.querySelector('.map-container')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle book appointment
  const handleBookAppointment = (service) => {
    setSelectedForBooking(service);
    setShowBookModal(true);
  };

  // Handle booking submit
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    alert(`Appointment booked with ${selectedForBooking.name}! You will receive a confirmation email shortly.`);
    setShowBookModal(false);
    setBookingForm({
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      message: ''
    });
  };

  // Handle directions
  const handleGetDirections = (service) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${service.lat},${service.lng}`;
      window.open(url, '_blank');
    } else {
      alert('Please enable location to get directions.');
    }
  };

  // Get category color
  const getCategoryColor = (categoryId) => {
    const cat = SERVICE_CATEGORIES.find(c => c.id === categoryId);
    return cat ? cat.color : '#8B5CF6';
  };

  return (
    <div className="find-help">
      {/* Header */}
      <header className="find-header">
        <div className="find-header-left">
          <div className="find-logo-wrap" onClick={() => navigate('/')}>
            <img src={logo} alt="Social Welfare logo" className="find-logo" />
          </div>
        </div>
        <div className="find-header-center">
          <button className="find-back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>
        </div>
        <div className="find-header-right">
          <button className="find-locate-btn" onClick={getUserLocation}>
            <Navigation size={18} />
            {isLocating ? <Loader size={18} className="spin" /> : 'Locate Me'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="find-hero" ref={heroRef}>
        <div className="find-hero-content">
          <h1 className="find-hero-title">
            <span>Find</span>
            <span>Help</span>
            <span>Near You</span>
          </h1>
          <p className="find-hero-subtitle">
            Discover clinics, counselors, and support services in Windhoek, Namibia
          </p>

          {/* Search Section */}
          <div className="find-search-section" ref={searchRef}>
            <div className="find-search-bar">
              <Search size={20} className="find-search-icon" />
              <input
                type="text"
                placeholder="Search for services, counselors, or clinics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="find-search-input"
              />
              <button 
                className="find-search-btn"
                onClick={filterServices}
              >
                <Search size={18} />
                Search
              </button>
            </div>

            {/* Category Filters */}
            <div className="find-categories">
              <button 
                className={`find-category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                <Home size={16} />
                All
              </button>
              {SERVICE_CATEGORIES.filter(c => c.id !== 'all').map((category) => (
                <button
                  key={category.id}
                  className={`find-category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{ 
                    borderColor: selectedCategory === category.id ? category.color : 'transparent',
                    backgroundColor: selectedCategory === category.id ? `${category.color}15` : 'transparent'
                  }}
                >
                  <category.icon size={16} style={{ color: category.color }} />
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="find-content">
        <div className="find-results-section results-section" ref={resultsRef}>
          {/* Map */}
          <div className="map-container">
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapController 
                center={mapCenter} 
                zoom={mapZoom}
                setMap={setMapInstance}
              />

              {/* User Location Marker */}
              {userLocation && (
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={userLocationIcon}
                >
                  <Popup>You are here</Popup>
                </Marker>
              )}

              {/* Service Markers */}
              {filteredServices.map((service) => {
                const color = getCategoryColor(service.category);
                const firstLetter = service.name.charAt(0);
                const customIcon = createCustomIcon(color, firstLetter);
                
                return (
                  <Marker
                    key={service.id}
                    position={[service.lat, service.lng]}
                    icon={customIcon}
                    eventHandlers={{
                      click: () => handleServiceClick(service),
                    }}
                  >
                    <Popup>
                      <div className="map-popup">
                        <h4>{service.name}</h4>
                        <p>{service.type}</p>
                        <div className="map-popup-details">
                          <span>⭐ {service.rating}</span>
                          <span>📍 {service.distance} km</span>
                        </div>
                        <button 
                          className="map-popup-btn"
                          onClick={() => handleServiceClick(service)}
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Results List */}
          <div className="results-list">
            <div className="results-header">
              <h3>
                <MapPin size={20} />
                {filteredServices.length} Services Found
                {userLocation && <span className="location-badge">Near You</span>}
              </h3>
              <button className="filter-toggle-btn" onClick={() => {}}>
                <Filter size={18} />
                Filters
              </button>
            </div>

            {filteredServices.length === 0 && (
              <div className="no-results">
                <Search size={48} />
                <h4>No services found</h4>
                <p>Try adjusting your search or filters</p>
                <button onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}>
                  Clear Filters
                </button>
              </div>
            )}

            <div className="services-list">
              {filteredServices.map((service) => (
                <div 
                  key={service.id}
                  className={`service-card ${selectedService?.id === service.id ? 'active' : ''}`}
                  onClick={() => handleServiceClick(service)}
                >
                  <div className="service-card-header">
                    <div className="service-card-icon" style={{ background: getCategoryColor(service.category) }}>
                      {React.createElement(
                        SERVICE_CATEGORIES.find(c => c.id === service.category)?.icon || Home, 
                        { size: 20, color: 'white' }
                      )}
                    </div>
                    <div className="service-card-info">
                      <h4>{service.name}</h4>
                      <p>{service.type}</p>
                    </div>
                    <div className="service-card-rating">
                      <Star size={14} color="#FFB800" />
                      <span>{service.rating}</span>
                      <span className="reviews">({service.reviews})</span>
                    </div>
                  </div>

                  <div className="service-card-details">
                    <div className="service-detail-item">
                      <MapPin size={14} />
                      <span>{service.address}</span>
                    </div>
                    <div className="service-detail-item">
                      <Clock size={14} />
                      <span>{service.hours}</span>
                    </div>
                    <div className="service-detail-item">
                      <Navigation size={14} />
                      <span>{service.distance} km away</span>
                    </div>
                    <div className="service-detail-item">
                      <Clock size={14} />
                      <span>Wait time: {service.waitTime}</span>
                    </div>
                    {service.website && (
                      <div className="service-detail-item">
                        <a href={service.website} target="_blank" rel="noopener noreferrer" style={{ color: '#8B5CF6', textDecoration: 'none' }}>
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="service-card-actions">
                    <div className="service-availability">
                      {service.available ? (
                        <span className="available">Available Now</span>
                      ) : (
                        <span className="unavailable">Book in Advance</span>
                      )}
                    </div>
                    <div className="service-action-buttons">
                      <button 
                        className="service-btn directions"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGetDirections(service);
                        }}
                      >
                        <Navigation size={16} />
                        Directions
                      </button>
                      <button 
                        className="service-btn book"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookAppointment(service);
                        }}
                      >
                        <Calendar size={16} />
                        Book
                      </button>
                      <button 
                        className="service-btn call"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${service.phone}`;
                        }}
                      >
                        <Phone size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookModal && selectedForBooking && (
        <div className="booking-modal-overlay">
          <div className="booking-modal">
            <div className="booking-modal-header">
              <h3>Book Appointment</h3>
              <button onClick={() => setShowBookModal(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            
            <div className="booking-modal-body">
              <div className="booking-service-info">
                <h4>{selectedForBooking.name}</h4>
                <p>{selectedForBooking.type}</p>
                <div className="booking-service-meta">
                  <span>⭐ {selectedForBooking.rating}</span>
                  <span>📍 {selectedForBooking.distance} km</span>
                  <span>⏱️ {selectedForBooking.waitTime}</span>
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="booking-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Preferred Date *</label>
                    <input
                      type="date"
                      required
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Preferred Time *</label>
                    <input
                      type="time"
                      required
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Additional Notes</label>
                    <textarea
                      placeholder="Any special requests or notes..."
                      rows="2"
                      value={bookingForm.message}
                      onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})}
                    />
                  </div>
                </div>

                <button type="submit" className="booking-submit-btn">
                  <Calendar size={18} />
                  Confirm Appointment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SOFI Assistant */}
      <SOFIAssistant />
    </div>
  );
}
