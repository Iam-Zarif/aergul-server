const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    photo: { type: String, required: true },
    otp: { type: String },
    otpExpiration: { type: Date }, 
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("User", userSchema); 
// user.js
