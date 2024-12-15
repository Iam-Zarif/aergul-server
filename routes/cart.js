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

router.post("/add-cart", authenticate, async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    console.log("Missing product ID or quantity in the request body.");
    return res
      .status(400)
      .json({ message: "Product ID and quantity are required." });
  }

  try {
    const Product = mongoose.model("Product");
    const Profile = mongoose.model("Profile");

    // Fetch product details
    const product = await Product.findById(productId);
    if (!product) {
      console.log(`Product not found for ID: ${productId}`);
      return res.status(404).json({ message: "Product not found." });
    }
    console.log("Product found:", product);

    // Find the user profile
    const profile = await Profile.findOne({ email: req.user.email }).select(
      "-password"
    );
    if (!profile) {
      console.log(`Profile not found for user ID: ${req.user.id}`);
      return res.status(404).json({ message: "Profile not found." });
    }
    console.log("Profile found:", profile);

    // Check if the product is already in the cart
    const existingItemIndex = profile.cart.findIndex(
      (item) => item.product.toString() === product._id.toString()
    );
    console.log(
      "Cart check:",
      existingItemIndex !== -1
        ? "Product exists in cart."
        : "Product not in cart."
    );

    if (existingItemIndex !== -1) {
      profile.cart[existingItemIndex].quantity += quantity;
      console.log("Updated quantity for existing cart item.");
    } else {
      profile.cart.push({ product: product._id, quantity });
      console.log("New product added to cart.");
    }

    // Save the updated profile
    const updatedProfile = await profile.save();
    console.log("Profile updated successfully:", updatedProfile);

    res
      .status(200)
      .json({ message: "Product added to cart", data: updatedProfile.cart });
  } catch (error) {
    console.error("Error in POST /cart:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


router.get("/profile-cart", authenticate, async (req, res) => {
  try {
  console.log("cart collection name", Cart);
   const cart = await Cart.find().sort({ createdAt: -1 });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    // Return the cart data
    res.status(200).json({ message: "Cart fetched successfully", data: cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
