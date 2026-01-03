import React, { useState, useEffect, useCallback } from 'react';
import { Search, Star, DollarSign, MapPin, ChevronLeft, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CitySearch = ({ theme }) => {
  const [cities, setCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [costFilter, setCostFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/destinations?search=${searchTerm}&costIndex=${costFilter}`);
      const data = await res.json();
      setCities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("API Error:", err);
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, costFilter]);

  useEffect(() => { fetchDestinations(); }, [fetchDestinations]);

  const handleQuickPlan = async (cityName) => {
    await fetch('http://localhost:5000/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trip_name: `${cityName}` })
    });
    navigate('/');
  };

  const s = {
    searchBar: { display: 'flex', gap: '15px', background: 'white', padding: '15px 25px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', marginBottom: '40px' },
    card: { background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid #eee' },
    btn: { width: '100%', padding: '12px', background: theme.cta, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: theme.primary, display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>
        <ChevronLeft size={20} /> Back to Dashboard
      </button>

      <h1 style={{ color: theme.secondary, fontSize: '2.5rem', marginBottom: '10px' }}>Explore the World</h1>
      <p style={{ opacity: 0.7, marginBottom: '30px' }}>Select a destination to start your personalized multi-city itinerary.</p>

      <div style={s.searchBar}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search color={theme.secondary} />
          <input 
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: '1rem' }}
            placeholder="Search cities (Paris, Tokyo...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          style={{ border: 'none', background: '#f5f5f5', padding: '10px', borderRadius: '10px' }}
          value={costFilter}
          onChange={(e) => setCostFilter(e.target.value)}
        >
          <option value="">Any Budget</option>
          <option value="1">Economy ($)</option>
          <option value="3">Mid-Range ($$$)</option>
          <option value="5">Luxury ($$$$$)</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}><Loader className="animate-spin" size={40} /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
          {cities.map(city => (
            <div key={city.id} style={s.card}>
              <div style={{ height: '140px', background: theme.secondary, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <MapPin size={40} color={theme.accent} />
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>{city.city_name}</h3>
                  <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{city.country}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}><Star size={14} fill={theme.accent} stroke={theme.accent} /> {city.popularity}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: theme.cta }}><DollarSign size={14} /> {city.cost_index}/5</span>
                </div>
                <button onClick={() => handleQuickPlan(city.city_name)} style={s.btn}>Plan Trip Here</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitySearch;