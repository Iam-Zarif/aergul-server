const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number },
    discount: { type: Number, default: 0 },
    thumb: { type: String }, 
    thumbnails: [{ type: String }], 
    keyFeatures: [{ type: String }], // Array for quick overview
    sizes: [{ type: String }], // Available sizes (e.g., ["S", "M", "L"])
    description: { type: String }, // Long product description
    productDetails: [
      {
        section: { type: String, required: true },
        content: { type: [String], required: true },
      },
    ],
    qa: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ], // QA Section
    reviews: [
      {
        user: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
        date: { type: Date, default: Date.now },
      },
    ], // Reviews Section
    similarProducts: [
      {
        name: { type: String },
        price: { type: Number },
        discount: { type: Number },
        thumb: { type: String },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "NewArrival" }, // Reference to other products
      },
    ], // Similar Products Section
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "newArrival" }
);

module.exports = mongoose.model("NewArrival", productSchema);
// models -> productSchema.js