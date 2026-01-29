const express = require("express");
console.log("🔥 register.js LOADED");   
const router = express.Router();
const db = require("../db");


router.post("/register", (req, res) => {
  console.log("📩 Incoming POST /api/register");
  console.log("Body received:", req.body);

  try {
    const { firstName, lastName, dob, address, email, phone, waiverAccepted, waiverTimestamp } = req.body;

    // Generate registration timestamp
    const registrationTimestamp = new Date();

    if (!waiverAccepted || !waiverTimestamp) {
      return res.status(400).json({
        success: false,
        message: "You must accept the waiver before registering."
      });
    }

    const checkSql = "SELECT * FROM users WHERE email = ?";

    db.query(checkSql, [email], (err, results) => {
      if (err) {
        console.error("❌ MySQL SELECT error:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      if (results.length > 0) {
        return res.status(400).json({
          success: false,
          message: "User already registered"
        });
      }

      const insertSql = `
        INSERT INTO users 
        (first_name, last_name, dob, address, email, phone, waiver_accepted, waiver_timestamp, registration_timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          firstName,
          lastName,
          dob,
          address,
          email,
          phone,
          waiverAccepted,
          waiverTimestamp,
          registrationTimestamp
        ],
        (err) => {
          if (err) {
            console.error("❌ MySQL INSERT error:", err);
            return res.status(500).json({ success: false, message: "Database insert error" });
          }

          return res.json({
            success: true,
            message: "User registered successfully"
          });
        }
      );
    });
  } catch (error) {
    console.error("❌ ERROR in /api/register:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;

