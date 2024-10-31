const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  phone: {
    type: String, // Remove `required: true` to make it optional
    unique: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  profilePhoto: {
    type: String,
    default: "",
  },
  dateOfBirth: {
    type: Date,
  },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  orderHistory: [
    {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
      date: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
        default: "Pending",
      },
    },
  ],
  paymentMethods: [
    {
      cardNumber: String,
      expiryDate: String,
      cardType: {
        type: String,
        enum: ["Visa", "MasterCard", "Amex", "Other"],
      },
    },
  ],
  notifications: {
    type: Boolean,
    default: true,
    Timestamp: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  feedbacks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      default: [],
      Timestamp: true,
    },
  ],
});

module.exports = mongoose.model("Profile", profileSchema);
