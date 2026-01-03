const { Pool } = require('pg');

// These details MUST match what you set up in pgAdmin
const pool = new Pool({
  user: 'postgres',          // Default Ubuntu user is postgres
  host: 'localhost',
  database: 'globetrotter', 
  password: 'YOUR_PASSWORD_HERE', 
  port: 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};