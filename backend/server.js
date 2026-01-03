const express = require('express');
const cors = require('cors');
const initDB = require('./db');

const app = express();

// 1. THE ULTIMATE CORS FIX (Manual Headers)
// This solves the "Network Error" by manually allowing DELETE and OPTIONS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    // Crucial: Respond immediately to the browser's "pre-flight" check
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

let db;
initDB().then(database => {
    db = database;
    const PORT = 5000;
    app.listen(PORT, () => console.log(`🚀 GlobeTrotter Engine active on http://localhost:5000`));
}).catch(err => console.error("Database Error:", err));

// --- API ENDPOINTS ---

// 1. DISCOVERY: Search destinations
app.get('/api/destinations', async (req, res) => {
    try {
        const { search, costIndex } = req.query;
        let query = 'SELECT * FROM destinations WHERE 1=1';
        let params = [];
        if (search && search.trim() !== "") {
            query += ' AND (city_name LIKE ? OR country LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (costIndex && costIndex.trim() !== "") {
            query += ' AND cost_index = ?';
            params.push(costIndex);
        }
        const cities = await db.all(query, params);
        res.json(cities || []);
    } catch (err) {
        res.status(500).json({ error: "Discovery failed" });
    }
});

// 2. DASHBOARD: Get all trips with live aggregates
app.get('/api/trips', async (req, res) => {
    try {
        const query = `
            SELECT t.*, 
            (SELECT COUNT(*) FROM stops WHERE trip_id = t.id) as stop_count,
            (SELECT COALESCE(SUM(cost), 0) FROM activities a JOIN stops s ON a.stop_id = s.id WHERE s.trip_id = t.id) as current_total_cost
            FROM trips t
        `;
        const trips = await db.all(query);
        res.json(trips || []);
    } catch (err) { res.status(500).json([]); }
});

// 3. CREATE TRIP: With Requirement 1 (Strict Validation)
app.post('/api/trips', async (req, res) => {
    const { trip_name } = req.body;

    try {
        // 1. VALIDATION: Does this exist in our official directory?
        const validLocation = await db.get(
            `SELECT city_name, country FROM destinations 
             WHERE LOWER(city_name) = LOWER(?) OR LOWER(country) = LOWER(?) 
             LIMIT 1`, 
            [trip_name, trip_name]
        );
        
        if (!validLocation) {
            return res.status(400).json({ 
                error: "Destination not recognized. Please choose a valid city/country." 
            });
        }

        const officialName = validLocation.city_name || validLocation.country;

        // 2. DUPLICATE CHECK: Does this trip already exist in the Hub?
        const existingTrip = await db.get(
            'SELECT id FROM trips WHERE LOWER(trip_name) = LOWER(?)', 
            [officialName]
        );

        if (existingTrip) {
            return res.status(409).json({ 
                error: `An adventure in ${officialName} is already in your Hub!` 
            });
        }

        // 3. SUCCESS: If it's a valid new destination, create it
        const result = await db.run(
            'INSERT INTO trips (user_id, trip_name) VALUES (1, ?)', 
            [officialName]
        );
        
        const newTrip = await db.get('SELECT * FROM trips WHERE id = ?', [result.lastID]);
        res.status(201).json(newTrip);

    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ error: "Server error. Could not process trip." });
    }
});

// 4. ITINERARY BUILDER: Fetch full trip details
app.get('/api/trips/:id/full', async (req, res) => {
    try {
        const tripId = req.params.id;
        const trip = await db.get(`
            SELECT t.*, 
            (SELECT COALESCE(SUM(cost), 0) FROM activities a JOIN stops s ON a.stop_id = s.id WHERE s.trip_id = t.id) as current_total_cost
            FROM trips t WHERE t.id = ?`, [tripId]);
            
        if (!trip) return res.status(404).json({ error: "Trip not found" });
        
        const stops = await db.all('SELECT * FROM stops WHERE trip_id = ? ORDER BY stop_order ASC', [tripId]);
        for (let stop of stops) {
            stop.activities = await db.all('SELECT * FROM activities WHERE stop_id = ?', [stop.id]);
        }
        res.json({ ...trip, stops: stops || [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. ADD STOP
app.post('/api/stops', async (req, res) => {
    const { trip_id, city_name, stop_order } = req.body;
    try {
        const result = await db.run('INSERT INTO stops (trip_id, city_name, stop_order) VALUES (?, ?, ?)', [trip_id, city_name, stop_order]);
        res.status(201).json({ id: result.lastID, success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. ADD ACTIVITY
app.post('/api/activities', async (req, res) => {
    const { stop_id, activity_name, category, cost } = req.body;
    try {
        await db.run('INSERT INTO activities (stop_id, activity_name, category, cost) VALUES (?, ?, ?, ?)', 
            [stop_id, activity_name, category || 'General', cost]);
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. DELETE TRIP: The focus of our fix
app.delete('/api/trips/:id', async (req, res) => {
    const tripId = req.params.id;
    try {
        // Relational deletion to prevent foreign key errors
        await db.run('DELETE FROM activities WHERE stop_id IN (SELECT id FROM stops WHERE trip_id = ?)', [tripId]);
        await db.run('DELETE FROM stops WHERE trip_id = ?', [tripId]);
        const result = await db.run('DELETE FROM trips WHERE id = ?', [tripId]);
        
        res.json({ success: true, changes: result.changes });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/trips/:id/generate', async (req, res) => {
    try {
        const tripId = req.params.id;
        const stops = await db.all('SELECT * FROM stops WHERE trip_id = ? ORDER BY stop_order ASC', [tripId]);
        
        let fullSchedule = [];
        
        for (let stop of stops) {
            // We order by category to group Food/Sightseeing logically
            const activities = await db.all('SELECT * FROM activities WHERE stop_id = ? ORDER BY category DESC', [stop.id]);
            
            const dayPlan = {
                city: stop.city_name,
                weather: "Sunny ☀️", // You can add logic here: stop.city_name.includes('London') ? 'Rainy 🌧️' : 'Sunny ☀️'
                slots: []
            };

            dayPlan.slots.push({ time: "09:00 AM", task: `Morning Coffee & Briefing in ${stop.city_name}` });

            activities.forEach((act, index) => {
                const hour = 11 + (index * 2); 
                const timeLabel = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
                dayPlan.slots.push({
                    time: timeLabel,
                    task: `${act.activity_name} (${act.category})`,
                    cost: act.cost
                });
            });

            fullSchedule.push(dayPlan);
        }

        res.json({ success: true, schedule: fullSchedule });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});