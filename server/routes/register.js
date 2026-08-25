const express = require("express");
console.log("🔥 register.js LOADED");   
const router = express.Router();
const db = require("../db");
const transporter = require("../email");
require('dotenv').config();




router.post("/register", (req, res) => {
  //console.log("📩 Incoming POST /register");
  //console.log("Body received:", req.body);

  try {
    const { firstName, lastName, dob, address, email, phone, waiverAccepted, waiverTimestamp, /*riding_for*/ } = req.body;

    // Generate registration timestamp
    const registrationTimestamp = new Date();
    const year = new Date().getFullYear();
    //Date that needs to be change for every K.I.N.D event
    const cutoffDate = `${year}-10-18 12:00:00`;


    if (!waiverAccepted || !waiverTimestamp) {
      return res.status(400).json({
        success: false,
        message: "You must accept the waiver before registering."
      });
    }
const checkSql = `
  SELECT *
  FROM users
  WHERE email = ?
    AND waiver_timestamp IS NOT NULL
    AND waiver_timestamp != '0000-00-00 00:00:00'
    AND waiver_timestamp >= ?
`;


db.query(checkSql, [email, cutoffDate], (err, results) => {
  if (err) {
    console.error("❌ MySQL SELECT error:", err);
    return res.status(500).json({ success: false, message: "Database error" });
  }

  // Si results > 0 → bloquear
  if (results.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Thank you for your interest. It looks like you’re already signed up for this event."
    });
  }


const insertSql = `
  INSERT INTO users 
  (
    first_name, 
    last_name, 
    dob, 
    address, 
    email, 
    phone, 
    waiver_accepted, 
    waiver_timestamp, 
    registration_timestamp,
    riding_for
  )
    
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)
`;

//need to ADD under INSERT INTO users     riding_for and ?


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
          registrationTimestamp,
       riding_for
        ],
        (err) => {
          if (err) {
            console.error("❌ MySQL INSERT error:", err);
            return res.status(500).json({ success: false, message: "Database insert error" });
          }
          // 📧 SEND EMAIL TO USER 
          const mailOptions = {
             from: process.env.EMAIL_FROM,
            to: email,
            subject: "Thank you for registering for the K.I.N.D. Ride event!",
            text: `Hello ${firstName},

Thank you for signing up!

Please arrive by 8:00 AM. The ride will begin promptly at 8:30 AM.

Event Date: October 17, 2026
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
    <strong>📅 Event Date:</strong> October 17, 2026<br>

  <strong>📍 Location:</strong> Tamarac Sports Complex<br><br>
  <a href="https://www.google.com/maps?q=9901+NW+77th+St,+Tamarac,+FL+33321" target="_blank">
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
    console.error("❌ ERROR in /register:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;

