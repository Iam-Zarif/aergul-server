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
    minlength: 8,
  },
  phone: {
    type: String,
    default: "",
  },
  address: {
    house: String,
    street: String,
    postalCode: String,
    city: String,
  },
  profilePhoto: {
    type: String,
    default: "",
  },
  dateOfBirth: {
    type: Date,
    default: "",
  },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  cart: {
    type: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", 
        },
        quantity: {
          type: Number,
          default: 0,
        },
      },
    ],
    default: [],
  },

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
  notifications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
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
      ref: "Feedback",
      default: [],
    },
  ],
  isGoogleUser: {
    type: Boolean,
    default: false,
  },
  isFacebookUser: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Profile", profileSchema);
// models - profileSchema.js

