// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import InfoHub from './pages/InfoHub';
import FindHelp from './pages/FindHelp';

// Analytics wrapper component with error handling
function AnalyticsTracker() {
  const location = useLocation();
  
  useEffect(() => {
    try {
      // Dynamically import analytics to avoid build errors
      import('./services/analyticsService').then(module => {
        const pageName = location.pathname.replace('/', '') || 'home';
        module.trackPageView(pageName);
      }).catch(err => {
        console.log('Analytics not available:', err);
      });
    } catch (error) {
      console.log('Analytics not available:', error);
    }
  }, [location]);
  
  return null;
}

function App() {
  return (
    <Router>
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/info-hub" element={<InfoHub />} />
        <Route path="/find-help" element={<FindHelp />} />
      </Routes>
    </Router>
  );
}

export default App;