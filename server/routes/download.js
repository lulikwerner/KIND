const express = require("express");
const router = express.Router();
const mariadb = require("mariadb");

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

router.get("/registrations", async (req, res) => {
  try {
    const conn = await pool.getConnection();

    const rows = await conn.query(
      "SELECT * FROM users WHERE registration_timestamp > ?",
      ["2026-02-21"]
    );

    conn.release();

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
