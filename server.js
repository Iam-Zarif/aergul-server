const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const { connectDB } = require("./config/db");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());

connectDB();

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
