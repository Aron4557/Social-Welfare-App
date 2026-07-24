// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import InfoHub from './pages/InfoHub';
import FindHelp from './pages/FindHelp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/info-hub" element={<InfoHub />} />
        <Route path="/find-help" element={<FindHelp />} />
      </Routes>
    </Router>
  );
}

export default App;