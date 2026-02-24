const express = require("express");
const router = express.Router();
const db = require("../db");   
require("dotenv").config();

router.get("/registrations", (req, res) => {
  const sql = `
    SELECT *
    FROM users
    WHERE registration_timestamp > ?
  `;

  db.query(sql, ["2026-02-21"], (err, results) => {
    if (err) {
      console.error("❌ MySQL SELECT error:", err);
      return res.status(500).send("Server error");
    }

    res.json(results);
  });
});

module.exports = router;
