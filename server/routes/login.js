const express = require("express");
const router = express.Router();

const CORRECT_PASSWORD = process.env.PROTECTED_PW;

router.post("/login", (req, res) => {
  const { password } = req.body;


 // console.log("PW del .env:", process.env.PROTECTED_PW);
 // console.log("PW recibida del frontend:", password);

  if (password === CORRECT_PASSWORD) {
    return res.json({ ok: true });
  }

  return res.status(401).json({ ok: false });
});

module.exports = router;
