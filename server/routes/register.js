const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/register", (req, res) => {
  const { firstName, lastName, dob, address, email, phone, waiverAccepted, waiverTimestamp } = req.body;

if (!waiverAccepted || !waiverTimestamp) {
     return res.status(400).json({ 
        success: false, 
        message: "You must accept the waiver before registering." 
    }); 
}
  const checkSql = "SELECT * FROM users WHERE email = ?";

  db.query(checkSql, [email], (err, results) => {
    if (err) return res.status(500).send(err);


    if (results.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already registered"
      });
    }


    const insertSql = `
      INSERT INTO users (first_name, last_name, dob, address, email, phone, waiver_accepted, waiver_timestamp, registration_timestamp)
      VALUES (?, ?, ?, ?, ?, ?,?,?,?)
    `;

    db.query(
      insertSql,
      [firstName, lastName, dob, address, email, phone, waiverAccepted, waiverTimestamp, registrationTimeStamp],
      (err) => {
        if (err) return res.status(500).send(err);

        return res.json({
          success: true,
          message: "User registered successfully"
        });
      }
    );
  });
});

module.exports = router;

