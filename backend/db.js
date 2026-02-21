const { Pool } = require("pg");
require("dotenv").config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Auto-create employee table if it doesn't exist
(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS employee (
        id SERIAL PRIMARY KEY,
        empname VARCHAR(255) NOT NULL,
        empage INTEGER NOT NULL,
        empdept VARCHAR(255) NOT NULL,
        photo VARCHAR(255)
      )
    `);
    console.log("Database connected and table ready.");
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
})();

module.exports = db;