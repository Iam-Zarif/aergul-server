const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
const Cart = require("../models/cartSchema"); // Assuming you have a Cart model

dotenv.config();

const router = express.Router();

// Middleware for authentication
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

// POST method to add items to the cart
router.post("/", authenticate, async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res
      .status(400)
      .json({ message: "Product ID and quantity are required." });
  }

  try {
    // Fetch product details from the database
    const product = await mongoose
      .model("Product") // Replace "Product" with your product model name
      .findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      // Create a new cart if it doesn't exist
      cart = new Cart({
        userId: req.user.id,
        items: [
          {
            productId: product._id,
            quantity,
            name: product.name,
            price: product.price,
            thumb: product.thumb, // Example field
            thumbnails: product.thumbnails, // Example field
          },
        ],
      });
    } else {
      // Check if the product is already in the cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === product._id.toString()
      );

      if (existingItemIndex !== -1) {
        // Update the quantity if the product is already in the cart
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add the new product to the cart
        cart.items.push({
          productId: product._id,
          quantity,
          name: product.name,
          price: product.price,
          thumb: product.thumb,
          thumbnails: product.thumbnails,
        });
      }
    }

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: "Product added to cart", data: cart });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    // Find the cart for the user
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId" 
    );

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
