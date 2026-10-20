
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const app = express();

// Trust the Nginx reverse proxy
app.set("trust proxy", 1);

// CORS
app.use(
  cors({
    origin: "https://registerkind.tamarac.gov",
    credentials: true
  })
);

// Parse JSON requests
app.use(express.json());

// MySQL session storage
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Secure authentication sessions
app.use(
  session({
    name: "kind.sid",
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 60 * 1000
    }
  })
);

// Existing application routes
app.use("/", require("./routes"));

// Start server
app.listen(process.env.SERVER_PORT, () => {
  console.log(`KIND server running on port ${process.env.SERVER_PORT}`);
});
