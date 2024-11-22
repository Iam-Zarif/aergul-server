const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    name: { type: String },
    price: { type: Number },
    offerPrice: { type: Number },
    discount: { type: Number, default: 0 },
    thumb: { type: String },
    thumbnails: [{ type: String }],
    keyFeatures: [{ type: String }], // Array for quick overview
    sizes: [{ type: String }], // Available sizes (e.g., ["S", "M", "L"])
    description: { type: String }, // Long product description
    productDetails: [
      {
        section: { type: String },
        content: { type: [String] },
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
        user: { type: String },
        rating: { type: Number, min: 1, max: 5 },
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
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "cart" }, // Reference to other products
      },
    ], // Similar Products Section
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "cart" }
);

module.exports = mongoose.model("Cart", cartSchema);
// models -> cartSchema.js
