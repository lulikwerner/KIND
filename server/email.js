
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

module.exports = transporter;