import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, User, Compass } from 'lucide-react';

const Navbar = ({ theme }) => (
  <nav style={{ 
    background: theme.secondary, padding: '15px 40px', display: 'flex', 
    justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
  }}>
    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
      <Globe size={28} color={theme.accent} />
      <span style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '1px' }}>GLOBETROTTER</span>
    </Link>
    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
      <Link to="/discover" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
        <Compass size={20} color={theme.accent} /> Discover
      </Link>
      <div style={{ 
        width: '35px', height: '35px', borderRadius: '50%', background: theme.accent, 
        display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' 
      }}>
        <User size={20} color={theme.secondary} />
      </div>
    </div>
  </nav>
);

export default Navbar;