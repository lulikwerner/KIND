
const express = require("express");
const router = express.Router();
const crypto = require("crypto");

router.post("/login", (req, res) => {
  const password = req.body?.password;
  const correctPassword = process.env.PROTECTED_PW;

  if (
    typeof password !== "string" ||
    !correctPassword
  ) {
    return res.status(401).json({ ok: false });
  }

  const submittedHash = crypto
    .createHash("sha256")
    .update(password)
    .digest();

  const expectedHash = crypto
    .createHash("sha256")
    .update(correctPassword)
    .digest();

  if (!crypto.timingSafeEqual(submittedHash, expectedHash)) {
    return res.status(401).json({ ok: false });
  }

  req.session.regenerate((err) => {
    if (err) {
      console.error("Session creation failed:", err);
      return res.status(500).json({ ok: false });
    }

    req.session.isAdmin = true;

    req.session.save((err) => {
      if (err) {
        console.error("Session save failed:", err);
        return res.status(500).json({ ok: false });
      }

      return res.json({ ok: true });
    });
  });
});

router.post("/logout", (req, res) => {
  if (!req.session) {
    return res.sendStatus(204);
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ ok: false });
    }

    res.clearCookie("kind.sid");
    return res.json({ ok: true });
  });
});

module.exports = router;
