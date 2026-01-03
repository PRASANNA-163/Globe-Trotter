import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, DollarSign, Trash2, Compass } from 'lucide-react';

const Dashboard = ({ theme }) => {
  const [trips, setTrips] = useState([]);
  const [newTripName, setNewTripName] = useState('');
  const navigate = useNavigate();

  const fetchTrips = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/trips');
      const data = await res.json();
      setTrips(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Could not fetch trips"); }
  };

  useEffect(() => { fetchTrips(); }, []);

 const handleCreateTrip = async () => {
    if (!newTripName) return;
    
    try {
      const res = await fetch('http://localhost:5000/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip_name: newTripName })
      });
      
      const data = await res.json();

      if (res.ok) {
        setNewTripName('');
        fetchTrips(); // Refresh the hub
      } else {
        // This will now catch "Destination not recognized" and show it in a popup
        alert(data.error); 
      }
    } catch (err) {
      alert("Network error. Is the backend running?");
    }
  };

  // THE FIX: Improved delete handler
const handleDeleteTrip = async (e, tripId) => {
    e.stopPropagation(); 
    if (!window.confirm("Delete this adventure?")) return;

    try {
        const res = await fetch(`http://localhost:5000/api/trips/${tripId}`, {
            method: 'DELETE',
        });
        
        if (res.ok) {
            setTrips(prev => prev.filter(t => t.id !== tripId));
        } else {
            alert("Delete failed on server.");
        }
    } catch (err) {
        console.error("CORS or Connection error:", err);
        alert("Network Error: Try refreshing both Backend and Frontend.");
    }
};

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between',alignItems:'center', marginBottom: '40px' }}>
        <h1 style={{ color: theme.secondary, fontWeight: '800' }}>Adventure Hub</h1>
        <div style={{ display: 'flex', gap: '10px',height:'7vh',alignItems: 'center' }}>
          <input 
            style={{ padding: '12px', borderRadius: '12px', border: '1px solid #ddd', width: '250px' }} 
            placeholder="New Trip Name..." 
            value={newTripName} 
            onChange={e => setNewTripName(e.target.value)} 
          />
          <button onClick={handleCreateTrip} style={{ background: theme.cta, color: 'white', border: 'none', padding: '7px 18px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            <Plus size={18} /> Create
          </button>
        </div>
      </header>

      {trips.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px', }}>
          {trips.map(trip => (
            <div 
              key={trip.id} 
              onClick={() => navigate(`/builder/${trip.id}`)}
              style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', position: 'relative', cursor: 'pointer' }}
            >
              <button 
                onClick={(e) => handleDeleteTrip(e, trip.id)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4d', zIndex: 10 }}
              >
                <Trash2 size={20} />
              </button>
              
              <h3 style={{ color: theme.secondary, margin: '0 0 10px 0', paddingRight: '30px' }}>{trip.trip_name}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '15px 0' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.6 }}><MapPin size={16} /> {trip.stop_count} Cities</span>
                <span style={{ fontWeight: 'bold', color: theme.cta }}><DollarSign size={16} /> {trip.current_total_cost}</span>
              </div>
              <div style={{ width: '80%', padding: '12px', borderRadius: '12px', textAlign: 'center', border: `2px solid ${theme.primary}`, color: theme.primary, fontWeight: 'bold' }}>
                Manage Itinerary
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '100px', border: '2px dashed #ccc', borderRadius: '20px' }}>
          <Compass size={48} color="#ccc" />
          <p style={{ color: '#999' }}>No adventures yet. Start by creating a trip above!</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;