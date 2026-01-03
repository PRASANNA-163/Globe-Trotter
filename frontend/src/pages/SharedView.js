import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Globe, MapPin, Tag, DollarSign } from 'lucide-react';

const SharedView = ({ theme }) => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPublicTrip = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/trips/${tripId}/full`);
      const data = await res.json();
      setTrip(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchPublicTrip();
  }, [fetchPublicTrip]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><h2>Loading Shared Adventure...</h2></div>;
  if (!trip) return <div style={{ textAlign: 'center', padding: '100px' }}><h2>Itinerary not found.</h2></div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '50px', background: theme.secondary, color: 'white', padding: '60px 20px', borderRadius: '30px' }}>
        <Globe size={48} color={theme.accent} style={{ marginBottom: '20px' }} />
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0' }}>{trip.trip_name}</h1>
        <p style={{ opacity: 0.8, fontSize: '1.2rem' }}>A curated journey by GlobeTrotter Explorer</p>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '30px' }}>
          <span><strong>{trip.stops?.length || 0}</strong> Cities</span>
          <span><strong>${trip.total_budget || 0}</strong> Est. Cost</span>
        </div>
      </header>

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: '20px', top: '0', bottom: '0', width: '4px', background: theme.accent, opacity: 0.3 }}></div>
        
        {trip.stops?.map((stop, i) => (
          <div key={stop.id} style={{ position: 'relative', paddingLeft: '60px', marginBottom: '40px' }}>
            <div style={{ position: 'absolute', left: '10px', top: '5px', width: '24px', height: '24px', background: theme.primary, borderRadius: '50%', border: '4px solid white' }}></div>
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
              <h3 style={{ color: theme.secondary, margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={20} color={theme.primary} /> Day {i + 1}: {stop.city_name}
              </h3>
              
              <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                {stop.activities?.map(act => (
                  <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Tag size={16} /> {act.activity_name}</span>
                    <span style={{ fontWeight: 'bold', color: theme.cta }}><DollarSign size={14} inline />{act.cost}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedView;