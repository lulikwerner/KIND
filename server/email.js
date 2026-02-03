const nodemailer = require("nodemailer"); 
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.PORT,
  secure: false, 
  auth: {
    user: process.env.EMAILUSER,
    pass: process.env.EMAILPW,
  },
});

// 🔥 Agrega esto:
console.log("ENV CHECK:", process.env.EMAILUSER, process.env.HOST, process.env.PORT);

transporter.verify((err, success) => {
  console.log("SMTP TEST:", err || success);
});

module.exports = transporter;
