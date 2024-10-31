const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth");
const { connectDB } = require("./config/db");
const profileRoutes = require("./routes/profile"); // Profile routes

const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

app.use(limiter);
app.use(helmet());
app.use(
  cors()
);
app.use(express.json());



// Set Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self';"
  );
  next();
});

connectDB();

app.use("/auth", authRoutes);
app.use("/user", profileRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// server.js base file
