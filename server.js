const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const productRoutes = require("./routes/newArrival");
const cartRoutes = require("./routes/cart");
const { connectDB } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: ["http://localhost:5173", "https://aergul-mu.vercel.app"],
};

app.use(helmet());
app.use(cors(corsOptions)); // CORS middleware
app.use(express.json());
app.use(cookieParser());

// Database connection
connectDB();

// Routes
app.use("/auth", authRoutes);
app.use("/user", profileRoutes);
app.use("/product", productRoutes);
app.use("/cart", cartRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
