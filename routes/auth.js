const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const passport = require("../config/passport.js");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const Profile = require("../models/profileSchema");
const { generateOTP, sendOTP } = require("../service/otpService");

dotenv.config();
const router = express.Router();

// In-memory store for temporary data
const otpStore = new Map();

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

// Registration Route
// Function to mask email address
function maskEmail(email) {
  const [localPart, domain] = email.split("@");
  const maskedLocalPart = localPart.slice(0, 3) + "****";
  return maskedLocalPart + "@" + domain;
}

router.post("/register", limiter, async (req, res) => {
  try {
    const { name, email, password, photo } = req.body;

    if (!name || !email || !photo) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await Profile.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Generate OTP and store user data temporarily
    const otp = generateOTP();
    otpStore.set(email, {
      otp,
      name,
      email,
      password,
      photo,
      expiresAt: Date.now() + 10 * 60000,
    });

    await sendOTP(email, otp);
    const maskedEmail = maskEmail(email);

    res.status(201).json({
      message: "OTP sent for account creation",
      otp: otp,
      email: maskedEmail,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// OTP Verification Route
router.post("/register-verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const storedData = otpStore.get(email);
  if (!storedData) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  if (storedData.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ message: "OTP has expired" });
  }

  try {
    const hashedPassword = await bcrypt.hash(storedData.password, 10);

    // Upload profile photo to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(storedData.photo, {
      folder: "user_photos",
    });

    // Create the profile after OTP is verified
    const newProfile = new Profile({
      name: storedData.name,
      email: storedData.email,
      password: hashedPassword,
      profilePhoto: uploadResult.secure_url,
      verified:true
    });

    await newProfile.save();

    // Clear temporary data after successful verification
    otpStore.delete(email);

    // Generate a JWT token
    const token = jwt.sign(
      { email: storedData.email, name: storedData.name },
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
    });

    res.status(201).json({
      message: "Account verified and profile created successfully",
      token,
      profile: newProfile,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
router.post("/login", limiter, async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await Profile.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const expiresIn = rememberMe ? "180d" : "1d"; // 6 months or 1 hour
    const token = jwt.sign(
      { email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: rememberMe ? 180 * 24 * 60 * 60 * 1000 : 3600000, // 6 months or 1 hour
      sameSite: "Strict",
    });

    // Return success response
    const profile = await Profile.findOne({ email }).select("-password");

    // Calculate the token expiration time
    const expirationDate = rememberMe
      ? Date.now() + 180 * 24 * 60 * 60 * 1000 // 6 months in milliseconds
      : Date.now() + 3600000; // 1 hour in milliseconds

    // Convert to a human-readable format
    const humanReadableExpiration = new Date(expirationDate).toLocaleString();

    res.status(201).json({
      message: "Login successful",
      token,
      user: profile,
      rememberMe,
      expiresIn: humanReadableExpiration, // Include the human-readable expiration time
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});




router.post("/forgotPass/emailFind", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Profile.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }
    const otp = generateOTP();
    otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60000 }); // OTP expires in 10 minutes

    await sendOTP(email, otp);
    const maskedEmail = maskEmail(email);

    res.status(200).json({
      message: "OTP sent to your email",
      email: maskedEmail,
      otp:otp
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Password Reset Route
router.post("/forgotPass/resetPassword", async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;

    if (!email || !newPassword || !otp) {
      return res
        .status(400)
        .json({ message: "Email, OTP, and new password are required." });
    }

    const storedData = otpStore.get(email);
    if (!storedData) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP has expired." });
    }

    const user = await Profile.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the user already has a password set
    if (user.password) {
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res
          .status(400)
          .json({
            message: "New password cannot be the same as the previous one.",
          });
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    await Profile.updateOne({ email }, { $set: { password: hashedPassword } });

    // Clear the OTP from otpStore after successful password reset
    otpStore.delete(email);

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/google/register", async (req, res) => {
  const { email, name, photo } = req.body; // Changed `picture` to `photo`

  try {
    let user = await Profile.findOne({ email });

    if (!user) {
      user = new Profile({
        name: name || "Anonymous User",
        email,
        profilePhoto: photo, // Use `photo` here as well
        isGoogleUser: true,
        verified: true,
      });
      await user.save();
    }

    const jwtToken = jwt.sign(
      { email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
      sameSite: "Strict",
    });

    res.status(201).json({
      message: "Account created or login successful",
      token: jwtToken,
      user,
    });
  } catch (error) {
    console.error("Google registration error:", error);
    res
      .status(500)
      .json({ message: "Server error during Google registration" });
  }
});

router.post("/google/login", async (req, res) => {
  const { email } = req.body; // Extract the email from the request body

  try {
    // Check if the user exists
    const user = await Profile.findOne({ email });

    // If user does not exist, respond with an error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a JWT token for the user
    const jwtToken = jwt.sign(
      { email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expiration time
    );

    // Set the token in cookies
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000, // 1 hour
      sameSite: "Strict",
    });

    // Respond with success message
    res.status(200).json({
      message: "Login successful",
      token: jwtToken,
      user,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Server error during Google login" });
  }
});

// Logout Route
router.post("/logout", (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
});


module.exports = router;


module.exports = router;
