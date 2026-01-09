const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/register", (req, res) => {
  const { firstName, lastName, dob, address, email, phone } = req.body;


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
      INSERT INTO users (first_name, last_name, dob, address, email, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [firstName, lastName, dob, address, email, phone],
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

