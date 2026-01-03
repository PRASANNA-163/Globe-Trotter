import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, PieChart as ChartIcon, MapPin, Wallet, TrendingDown, Tag } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ItineraryBuilder = ({ theme }) => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [cityName, setCityName] = useState('');
  const [activityName, setActivityName] = useState('');
  const [activityCost, setActivityCost] = useState('');
  const [activeStopId, setActiveStopId] = useState(null);

  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const shareUrl = `http://localhost:3000/share/${tripId}`; // In production, this would be your live URL
    const shareText = `Check out my travel plan for ${trip?.trip_name}! 🌍✈️`;

    const generateTextPlan = () => {
    if (!trip || !trip.stops) return "";
    
    let text = `🌍 *Travel Plan: ${trip.trip_name}*\n`;
    text += `Total Budget: $${trip.current_total_cost || 0}\n\n`;

    trip.stops.forEach((stop, index) => {
        text += `📍 *Day ${index + 1}: ${stop.city_name}*\n`;
        stop.activities?.forEach(act => {
            text += `- ${act.activity_name}: $${act.cost}\n`;
        });
        text += `\n`;
    });

    return text;
};

const shareToWhatsApp = () => {
    const planText = generateTextPlan();
    const link = `(View live at: http://localhost:3000/share/${tripId})`;
    // This sends the actual data as text + the link
    const finalMsg = encodeURIComponent(planText + link);
    window.open(`https://wa.me/?text=${finalMsg}`, '_blank');
};

const shareViaGmail = () => {
    const planText = generateTextPlan();
    const link = `View live itinerary: http://localhost:3000/share/${tripId}`;
    const subject = encodeURIComponent(`My Itinerary for ${trip.trip_name}`);
    const body = encodeURIComponent(planText + "\n\n" + link);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${subject}&body=${body}`, '_blank');
};

const copyLink = () => {
    const link = `http://localhost:3000/share/${tripId}`;
    navigator.clipboard.writeText(link);
    alert("Shareable link copied to clipboard!");
};

 const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
        const res = await fetch(`http://localhost:5000/api/trips/${tripId}/generate`);
        const data = await res.json();
        if (data.success) {
            setGeneratedPlan(data.schedule);
        }
    } catch (err) {
        alert("Check backend connection!");
    } finally {
        setIsGenerating(false);
    }
};

  // 1. Fetch Full Trip Data (Stops + Activities + Total Budget)
  const fetchFullTrip = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/trips/${tripId}/full`);
      if (!res.ok) throw new Error("API Route Not Found (404)");
      const data = await res.json();
      setTrip(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => { fetchFullTrip(); }, [fetchFullTrip]);

  // 2. Persistent Save Stop
  const handleAddStop = async () => {
    if (!cityName) return;
    try {
        const res = await fetch('http://localhost:5000/api/stops', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                trip_id: tripId,
                city_name: cityName,
                stop_order: (trip?.stops?.length || 0) + 1
            })
        });
        if (res.ok) {
            setCityName('');
            fetchFullTrip(); 
        }
    } catch (err) {
        console.error("Save Stop failed:", err);
    }
  };

  // 3. Persistent Add Activity
  const handleAddActivity = async (stopId) => {
    if (!activityName || !activityCost) return;
    try {
        const res = await fetch('http://localhost:5000/api/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                stop_id: stopId,
                activity_name: activityName,
                category: 'Sightseeing',
                cost: parseFloat(activityCost)
            })
        });
        if (res.ok) {
            setActivityName(''); setActivityCost(''); setActiveStopId(null);
            fetchFullTrip(); // REQUIREMENT 2 & 3: Refresh UI to show new Budget and Chart
        }
    } catch (err) {
        console.error("Activity Save failed:", err);
    }
  };

  // Logic to process chart data from nested stops/activities
  const getChartData = () => {
    if (!trip || !trip.stops) return [];
    const categoryMap = {};
    trip.stops.forEach(stop => {
      stop.activities?.forEach(act => {
        const cat = act.category || 'Misc';
        categoryMap[cat] = (categoryMap[cat] || 0) + act.cost;
      });
    });
    return Object.keys(categoryMap).map(key => ({ name: key, value: categoryMap[key] }));
  };

  const chartData = getChartData();
  const COLORS = [theme.primary, theme.secondary, theme.cta, theme.accent];

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><h2>Syncing Itinerary...</h2></div>;
  if (!trip) return <div style={{ textAlign: 'center', padding: '100px' }}><h2>Trip Not Found.</h2></div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: theme.primary, display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>
        <ChevronLeft size={20} /> Back to Hub
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: theme.secondary }}>Planning: {trip?.trip_name}</h1>
        {/* REQUIREMENT 3: Dynamic Budget Value from Database */}
        <div style={{ background: theme.accent, padding: '15px 25px', borderRadius: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
           <ChartIcon size={22} /> Budget: ${trip?.current_total_cost || 0}
        </div>
      </div>

      {/* REQUIREMENT 2: Chart Section that updates when activities are added */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: theme.secondary }}><Wallet size={20} /> Spending Distribution</h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={chartData.length > 0 ? chartData : [{name: 'No Data', value: 1}]} 
                  innerRadius={60} 
                  outerRadius={80} 
                  dataKey="value"
                >
                  {chartData.length > 0 
                    ? chartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />) 
                    : <Cell fill="#eee" />
                  }
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ background: theme.secondary, color: 'white', padding: '25px', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
           <TrendingDown size={32} color={theme.accent} style={{marginBottom: '10px'}} />
           <h3>Cost Insight</h3>
           <p>Your current total expenditure for this journey is <strong>${trip?.current_total_cost || 0}</strong>.</p>
        </div>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
        <h3 style={{ color: theme.primary, marginTop: 0 }}>Add Destination</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
           <input 
             style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #ddd' }} 
             placeholder="e.g. Rome" 
             value={cityName} 
             onChange={e => setCityName(e.target.value)} 
           />
           <button onClick={handleAddStop} style={{ background: theme.secondary, color: 'white', border: 'none', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
             Save Stop
           </button>
        </div>
      </div>

      <div style={{ position: 'relative', paddingLeft: '20px' }}>
        <div style={{ position: 'absolute', left: '25px', top: '0', bottom: '0', width: '4px', background: theme.accent, opacity: 0.3 }}></div>
        {trip.stops?.map((stop, i) => (
          <div key={stop.id} style={{ position: 'relative', paddingLeft: '50px', marginBottom: '40px' }}>
            <div style={{ position: 'absolute', left: '15px', top: '10px', width: '24px', height: '24px', background: theme.primary, borderRadius: '50%', border: '4px solid white', zIndex: 2 }}></div>
            <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, color: theme.secondary }}>Day {i + 1}: {stop.city_name}</h3>
                  <Trash2 size={18} color="#ff4d4d" style={{cursor: 'pointer'}} />
               </div>
               <div style={{marginTop: '15px'}}>
                  {stop.activities?.map((act) => (
                    <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f9f9f9', borderRadius: '10px', marginBottom: '8px' }}>
                       <span><Tag size={14} /> {act.activity_name}</span>
                       <span style={{ color: theme.cta, fontWeight: 'bold' }}>${act.cost}</span>
                    </div>
                  ))}
                  {activeStopId === stop.id ? (
                    <div style={{ marginTop: '10px', padding: '10px', background: theme.bg, borderRadius: '10px' }}>
                       <input style={{marginRight: '10px'}} placeholder="Activity" value={activityName} onChange={e => setActivityName(e.target.value)} />
                       <input type="number" style={{marginRight: '10px'}} placeholder="Cost" value={activityCost} onChange={e => setActivityCost(e.target.value)} />
                       <button onClick={() => handleAddActivity(stop.id)} style={{background: theme.cta, color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px'}}>Add</button>
                    </div>
                  ) : (
                    <button onClick={() => setActiveStopId(stop.id)} style={{ background: 'none', border: `1px dashed ${theme.secondary}`, color: theme.secondary, padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}>+ Add Activity Cost</button>
                  )}
               </div>
            </div>
          </div>
        ))}
      </div>
    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <button 
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                style={{ 
                    background: theme.primary, 
                    color: 'white', 
                    padding: '18px 45px', 
                    borderRadius: '50px', 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    border: 'none', 
                    cursor: 'pointer',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    transition: 'transform 0.2s'
                }}
            >
                {isGenerating ? "⚙️ Calculating Best Routes..." : "✨ Generate Smart Schedule"}
            </button>
            <div style={{ 
            display: 'flex', 
            gap: '15px', 
            marginBottom: '30px', 
            padding: '20px', 
            background: 'white', 
            borderRadius: '15px', 
            boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
            alignItems: 'center' ,
            marginTop:'3vh'
        }}>
            <span style={{ fontWeight: 'bold', color: theme.secondary}}>Share your plan:</span>
            
            {/* WhatsApp Button */}
            <button onClick={shareToWhatsApp} style={{ 
                background: '#25D366', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' 
            }}>
                <span>WhatsApp</span>
            </button>

            <button onClick={copyLink} style={{ 
            background: theme.secondary, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' 
        }}>
            🔗 Copy Link
        </button>

    {/* Gmail Button */}
            <button onClick={shareViaGmail} style={{ 
                background: '#DB4437', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' 
            }}>
                <span>Gmail</span>
            </button>
        </div>
     </div>
                {generatedPlan && (
    <div style={{ background: '#fff', padding: '30px', borderRadius: '25px', marginBottom: '40px', border: `3px solid ${theme.accent}`, boxShadow: '0 15px 40px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: theme.secondary, textAlign: 'center', marginBottom: '30px' }}>🗺️ Your Smart Travel Plan</h2>
        {generatedPlan.map((day, idx) => (
            <div key={idx} style={{ marginBottom: '30px', padding: '20px', background: '#f8fbff', borderRadius: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `2px solid ${theme.accent}`, paddingBottom: '10px', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0 }}>Day {idx + 1}: {day.city}</h3>
                    <span style={{ fontWeight: 'bold' }}>Forecast: {day.weather}</span>
                </div>
                {day.slots.map((slot, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                        <span style={{ minWidth: '100px', fontWeight: 'bold', color: theme.primary }}>{slot.time}</span>
                        <span style={{ flex: 1 }}>{slot.task}</span>
                        {slot.cost > 0 && <span style={{ background: theme.accent, padding: '4px 10px', borderRadius: '8px', fontSize: '12px' }}>${slot.cost}</span>}
                    </div>
                ))}
            </div>
        ))}
    </div>
)}

    </div>
  );
};

export default ItineraryBuilder;