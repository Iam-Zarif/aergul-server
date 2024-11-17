// models/feedbackSchema.js
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    profilePhoto: { type: String, default: "" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    texts: { type: String, required: true },
  },
  { timestamps: true } 
);

module.exports = mongoose.model("Feedback", feedbackSchema);
