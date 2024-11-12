const express = require("express");
const jwt = require("jsonwebtoken");
const Profile = require("../models/profileSchema");
const dotenv = require("dotenv");
dotenv.config();
const router = express.Router();

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
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};

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


router.put("/profileEdit", authenticate, async (req, res) => {
  const { name, email, phone, dateOfBirth, address, profilePhoto } = req.body;

  try {
    const updatedProfile = await Profile.findOneAndUpdate(
      { email: req.user.email },
      {
        $set: {
          ...(name && { name }),
          ...(profilePhoto && { profilePhoto }),
          ...(email && { email }),
          ...(phone && { phone }),
          ...(dateOfBirth && { dateOfBirth }),
          ...(address && {
            "address.house": address.house,
            "address.postalCode": address.postalCode,
            "address.street": address.street,
            "address.city": address.city,
          }),
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedProfile) {
      return res.status(404).json({ message: "User not found." });
    }

    res
      .status(201)
      .json({ message: "Profile updated successfully", user: updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
