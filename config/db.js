const { Pool } = require("pg");
require("dotenv").config();

// If DATABASE_URL is provided by Render, always use SSL
const pool = new Pool(
  process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        user: "postgres",
        host: "localhost",
        database: "speech app",
        password: "admin@123",
        port: 5432,
      }
);

// Automatically create the table if it doesn't exist
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        english_text TEXT NOT NULL,
        hindi_text TEXT,
        audio_url TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Database table verified/created successfully.");
  } catch (error) {
    console.error("Error creating database table:", error);
  }
})();

module.exports = pool;
