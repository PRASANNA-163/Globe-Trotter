/*
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function initDB() {
    const db = await open({
        filename: './globetrotter.db',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE, password_hash TEXT);
        CREATE TABLE IF NOT EXISTS trips (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, trip_name TEXT, budget REAL DEFAULT 0);
        CREATE TABLE IF NOT EXISTS destinations (id INTEGER PRIMARY KEY AUTOINCREMENT, city_name TEXT NOT NULL, country TEXT NOT NULL, cost_index INTEGER, popularity REAL);
        CREATE TABLE IF NOT EXISTS stops (id INTEGER PRIMARY KEY AUTOINCREMENT, trip_id INTEGER, city_name TEXT, stop_order INTEGER);
        CREATE TABLE IF NOT EXISTS activities (id INTEGER PRIMARY KEY AUTOINCREMENT, stop_id INTEGER, activity_name TEXT, category TEXT, cost REAL DEFAULT 0);
    `);

    // ENTERPRISE SEEDING: Ensure data always exists for the hackathon demo
    const dataCheck = await db.get('SELECT COUNT(*) as count FROM destinations');
    if (dataCheck.count === 0) {
        console.log("🌱 Database is empty. Seeding destinations now...");
        const cities = [
            ['Paris', 'France', 5, 4.9], ['Tokyo', 'Japan', 4, 4.8], 
            ['Bali', 'Indonesia', 1, 4.7], ['Rome', 'Italy', 3, 4.9], 
            ['New York', 'USA', 5, 4.6], ['Bangkok', 'Thailand', 1, 4.5],
            ['London', 'UK', 5, 4.7], ['Barcelona', 'Spain', 3, 4.8]
        ];
        for (const city of cities) {
            await db.run('INSERT INTO destinations (city_name, country, cost_index, popularity) VALUES (?, ?, ?, ?)', city);
        }
    }
    console.log("✅ Relational Database Ready");
    return db;
}
module.exports = initDB;


*/
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function initDB() {
    const db = await open({
        filename: './globetrotter.db',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE);
        CREATE TABLE IF NOT EXISTS trips (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, trip_name TEXT, budget REAL DEFAULT 0);
        CREATE TABLE IF NOT EXISTS stops (id INTEGER PRIMARY KEY AUTOINCREMENT, trip_id INTEGER, city_name TEXT, stop_order INTEGER);
        CREATE TABLE IF NOT EXISTS activities (id INTEGER PRIMARY KEY AUTOINCREMENT, stop_id INTEGER, activity_name TEXT, category TEXT, cost REAL DEFAULT 0);
        CREATE TABLE IF NOT EXISTS destinations (id INTEGER PRIMARY KEY AUTOINCREMENT, city_name TEXT, country TEXT, cost_index INTEGER, popularity REAL);
    `);

    // Ensure we have some destinations to search for
    const check = await db.get('SELECT COUNT(*) as count FROM destinations');
    if (check.count === 0) {
        await db.run(`INSERT INTO destinations (city_name, country, cost_index, popularity) VALUES 
            ('Paris', 'France', 5, 4.9), 
            ('Tokyo', 'Japan', 4, 4.8), 
            ('Bali', 'Indonesia', 1, 4.7)`);
    }
    
    return db;
}
module.exports = initDB;