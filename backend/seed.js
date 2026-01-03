const db = require('./db');

const seedData = async () => {
    try {
        // Adding sample cities to satisfy "City Search" [cite: 58]
        await db.query(`
            INSERT INTO stops (city_name) VALUES 
            ('Paris'), ('Tokyo'), ('New York'), ('London'), ('Dubai')
        `);
        console.log("Data Seeded!");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
seedData();