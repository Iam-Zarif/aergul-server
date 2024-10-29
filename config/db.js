const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = async () => {
  try { await mongoose.connect(process.env.MONGODB_URI, {
     useNewUrlParser: true,
     useUnifiedTopology: true,
     serverSelectionTimeoutMS: 20000,
     socketTimeoutMS: 45000,
   });
    console.log("MongoDB connected with Mongoose!");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
