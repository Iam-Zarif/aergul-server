const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    photo: { type: String, required: true },
    otp: { type: String }, // For storing OTP
    otpExpiration: { type: Date }, // For storing OTP expiration time
  },
  {
    timestamps: true, // Automatically create createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("User", userSchema); // Naming convention for model
// user.js
