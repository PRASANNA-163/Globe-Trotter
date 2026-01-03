import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Tag } from 'lucide-react';

const PublicView = ({ theme }) => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    // We only fetch, we never save or delete here
    fetch(`http://localhost:5000/api/trips/${tripId}/full`)
      .then(res => res.json())
      .then(data => setTrip(data));
  }, [tripId]);

  if (!trip) return <div style={{padding: '50px', textAlign: 'center'}}>Loading Shared Plan...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: theme.secondary }}>🌍 Adventure in {trip.trip_name}</h1>
        <p style={{ opacity: 0.7 }}>A curated travel plan shared with you via GlobeTrotter</p>
      </div>

      {trip.stops?.map((stop, i) => (
        <div key={i} style={{ background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: theme.primary }}><MapPin size={18} /> Day {i+1}: {stop.city_name}</h3>
          {stop.activities?.map((act, j) => (
            <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #eee' }}>
              <span>{act.activity_name}</span>
              <span style={{ fontWeight: 'bold' }}>${act.cost}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PublicView;