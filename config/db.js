const { Pool } = require("pg");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

// For local testing, fallback to the local object config.
// Render will supply the continuous process.env.DATABASE_URL
const pool = new Pool(
  process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: isProduction ? { rejectUnauthorized: false } : false
      }
    : {
        user: "postgres",
        host: "localhost",
        database: "speech app",
        password: "admin@123",
        port: 5432,
      }
);

module.exports = pool;
