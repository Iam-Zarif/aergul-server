const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many registrations from this IP, please try again later.",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/register", limiter, async (req, res) => {
  try {
    const { name, email, password, photo } = req.body;

    if (!name || !email || !password || !photo) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email is already registered.", status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const uploadResult = await cloudinary.uploader.upload(photo, {
      folder: "user_photos",
    });

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      photo: uploadResult.secure_url,
    });

    await newUser.save();

    const token = jwt.sign({ email, name }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
      sameSite: "Strict",
      path: "/",
    });

    res.status(201).json({ message: "User registered successfully", token ,data:req.body });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});



router.post("/login", limiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { email: user.email, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
      sameSite: "Strict",
      path: "/",
    });

    res
      .status(200)
      .json({
        message: "Login successful",
        token,
        user: { name: user.name, email: user.email, photo: user.photo },
      });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
// auth.js