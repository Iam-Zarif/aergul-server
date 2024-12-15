const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    const DB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/mydatabase";
    await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected with Mongoose!");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }

  mongoose.set("debug", process.env.NODE_ENV === "development");

  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  });
};

module.exports = { connectDB };
