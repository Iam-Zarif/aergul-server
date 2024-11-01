const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    photo: { type: String, required: true },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    isFacebookUser: {
      type: Boolean,
      default: false,
    },
    otp: { type: String },
    otpExpiration: { type: Date },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema); 
//models - user.js
