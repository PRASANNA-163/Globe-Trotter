import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ItineraryBuilder from './pages/ItineraryBuilder';
import CitySearch from './pages/CitySearch';
import PublicView from './pages/PublicView';

const THEME = {
  primary: '#FF6B35', secondary: '#004E89', accent: '#F7B801',
  bg: '#F7F7F2', text: '#1A1A2E', cta: '#00A896', white: '#FFFFFF'
};

function App() {
  return (
    <Router>
      <div style={{ background: THEME.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <Navbar theme={THEME} />
        <Routes>
          <Route path="/" element={<Dashboard theme={THEME} />} />
          <Route path="/builder/:tripId" element={<ItineraryBuilder theme={THEME} />} />
          <Route path="/discover" element={<CitySearch theme={THEME} />} />
          <Route path="/share/:tripId" element={<PublicView theme={THEME} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;