const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/auth");
const { connectDB } = require("./config/db");
const profileRoutes = require("./routes/profile"); // Profile routes

const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());


app.use(helmet());
const corsOptions = {
  origin: "http://localhost:5173", 
  credentials: true, 
};
https: app.use(cors(corsOptions));
app.use(express.json());

console.log("Email:", process.env.EMAIL_USER);
console.log("Password:", process.env.EMAIL_PASS);


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
