const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const { connectDB } = require("./config/db");
const profileRoutes = require("./routes/profile");
const productRoutes = require("./routes/newArrival");
const cartRoutes = require("./routes/cart");

const app = express();
app.use(cookieParser());

const corsOptions = {
  origin: ["http://localhost:5173", "https://aergul-mu.vercel.app"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
connectDB();

app.use("/auth", authRoutes);
app.use("/user", profileRoutes);
app.use("/product", productRoutes);
app.use("/cart", cartRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
