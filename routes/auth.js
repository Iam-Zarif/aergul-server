const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const passport = require("../config/passport.js");
const User = require("../models/user");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const Profile = require("../models/profileSchema");

dotenv.config();

const router = express.Router();


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Too many registrations from this IP, please try again later.",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Import Profile model


router.post("/register", limiter, async (req, res) => {
  try {
    const { name, email, password, photo } = req.body;

    if (!name || !email ||  !photo) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const uploadResult = await cloudinary.uploader.upload(photo, {
      folder: "user_photos",
    });


    const newProfile = new Profile({
      name,
      email,
      password: hashedPassword, 
      profilePhoto: uploadResult.secure_url,
    });

    await newProfile.save();

    const token = jwt.sign({ email, name }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
      sameSite: "Strict",
    });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});




router.post("/login", limiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email ) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
      sameSite: "Strict",
    });

    // Fetch profile data for response
    const profile = await Profile.findOne({ email }).select("-password");

    res.status(201).json({
      message: "Login successful",
      token,
      user: profile, // Return profile data for frontend use
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
//routes - auth.js