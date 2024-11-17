const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const NewArrival = require("../models/newArrivalSchema");
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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getUTCDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getUTCFullYear();

  const daySuffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
      ? "nd"
      : day % 10 === 3 && day !== 13
      ? "rd"
      : "th";

  return `${day}${daySuffix} ${month}, ${year}`;
};

router.get("/newArrival", authenticate, async (req, res) => {
  console.log("new arrival collection name",NewArrival.collection.name); // Check the collection name being used.

  try {
    const newArrival = await NewArrival.find().sort({ createdAt: -1 });

    const formattedArrivals = newArrival.map((item) => ({
      ...item.toObject(),
      createdAt: formatDate(item.createdAt),
    }));

    res.status(200).json({
      message: "New arrivals fetched successfully",
      data: formattedArrivals,
    });
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
