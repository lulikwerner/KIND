const express = require("express");
console.log("🔥 register.js LOADED");   
const router = express.Router();
const db = require("../db");
const transporter = require("../email");
require('dotenv').config();




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
          // 📧 SEND EMAIL TO USER 
          const mailOptions = {
             from: process.env.EMAILUSER,
            to: email,
            subject: "Thank you for registering for the K.I.N.D. Ride event!",
            text: `Hello ${firstName},

Thank you for signing up!

Please arrive by 8:00 AM. The ride will begin promptly at 8:30 AM.

Event Date: February 21, 2026
Location: Tamarac Sports Complex
Address: 9901 NW 77th St, Tamarac, FL 33321

We look forward to seeing you there!`,

           html: `
  <p>Hello <strong>${firstName}</strong>,</p>

  <p>Thank you for signing up!</p>

  <p>
    Please arrive by <strong>8:00 AM</strong>.<br>
    The ride will begin promptly at <strong>8:30 AM</strong>.
  </p>

<p>
  <strong>📍 Location:</strong> Tamarac Sports Complex<br><br>
  <a href="https://maps.app.goo.gl/zmoRrLM6T5pxSFuC9" target="_blank">
    9901 NW 77th St, Tamarac, FL 33321
  </a>
</p>


  <p>We look forward to seeing you there!</p>


`,

         };
             transporter.sendMail(mailOptions, (error, info) => {
                if (error) { 
                    console.error("❌ Email send error:", error);
                }
                else {
                    console.log("📧 Email sent:", info.response);
                } 
            });

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

