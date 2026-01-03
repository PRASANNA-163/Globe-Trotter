const express = require('express');
const cors = require('cors');
const db = require('./db'); // Import the bridge you created
const app = express();

app.use(cors());
app.use(express.json());

// 1. City Search (No external API - using our own DB)
app.get('/api/cities', async (req, res) => {
    try {
        const { name } = req.query;
        // Searches our local 'stops' or a dedicated cities table
        const result = await db.query(
            "SELECT DISTINCT city_name FROM stops WHERE city_name ILIKE $1", 
            [`%${name}%`]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 2. Create Trip (Relational data insertion)
app.post('/api/trips', async (req, res) => {
    const { user_id, trip_name, start_date, end_date, description } = req.body;
    try {
        const newTrip = await db.query(
            "INSERT INTO trips (user_id, trip_name, start_date, end_date, description) VALUES($1, $2, $3, $4, $5) RETURNING *",
            [user_id, trip_name, start_date, end_date, description]
        );
        res.json(newTrip.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));