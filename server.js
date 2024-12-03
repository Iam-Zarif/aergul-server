const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/auth");
const { connectDB } = require("./config/db");
const profileRoutes = require("./routes/profile"); 
const productRoutes = require("./routes/newArrival");
const cartRoutes = require("./routes/cart");
const cookieParser = require("cookie-parser");
const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "https://aergul-mu.vercel.app"],
  credentials: true,
};

app.use(cors(corsOptions)); // Apply CORS first
app.use(express.json()); // Parse incoming JSON requests
app.use(cookieParser()); // Parse cookies
app.use(helmet()); // Security middleware

app.options("*", cors(corsOptions)); 

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});


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
// server.js base file
