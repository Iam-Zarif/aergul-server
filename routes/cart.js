const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
const Cart = require("../models/cartSchema");
dotenv.config();

const router = express.Router();

// Middleware for authentication
const authenticate = (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    console.log("No token provided.");
    return res.status(401).json({ message: "Authorization denied." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("Token verified:", decoded);
    next();
  } catch (error) {
    console.error("Invalid token:", error.message);
    res.status(401).json({ message: "Invalid token." });
  }
};

router.post("/add-to-cart", authenticate, async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || typeof quantity !== "number") {
    return res
      .status(400)
      .json({ message: "Product ID and a valid quantity are required." });
  }

  try {
    const Product = mongoose.model("Product");
    const Profile = mongoose.model("Profile");

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Find the user's profile
    const profile = await Profile.findOne({ email: req.user.email });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    // Check for duplicate item in the cart
    const existingItem = profile.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      return res
        .status(400)
        .json({ message: "Duplicate item: Product already in the cart." });
    }

    // Add the new product to the cart
    profile.cart.push({
      product: productId,
      quantity,
    });

    // Save the updated profile
    await profile.save();

    res.status(200).json({
      message: "Product added to cart successfully.",
      cart: profile.cart,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



router.get("/profile-cart", authenticate, async (req, res) => {
  try {
    const Profile = mongoose.model("Profile");

    const profile = await Profile.findOne({ email: req.user.email }).populate(
      "cart.product" // Populate product details from `Product` collection
    );

    if (!profile) {
      return res.status(404).json({ message: "User profile not found." });
    }

    res.status(200).json({
      message: "Cart fetched successfully.",
      cart: profile.cart,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


module.exports = router;
