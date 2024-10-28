const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Base route to check server status
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the API!" });
});

// Auth routes
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
