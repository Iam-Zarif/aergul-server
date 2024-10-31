const express = require("express");
const jwt = require("jsonwebtoken");
const Profile = require("../models/profileSchema");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

// Middleware to verify token and get user details
const authenticate = (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user data to request object
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};

// Route to get the current user's profile
router.get("/profile", authenticate, async (req, res) => {
  try {
    const user = await Profile.findOne({ email: req.user.email }).select(
      "-password"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
