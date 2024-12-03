const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const { connectDB } = require("./config/db");
const profileRoutes = require("./routes/profile");
const productRoutes = require("./routes/newArrival");
const cartRoutes = require("./routes/cart");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());
app.use(cors({ origin: "*", credentials: false }));
app.use(express.json());
connectDB();

// Define API routes
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
