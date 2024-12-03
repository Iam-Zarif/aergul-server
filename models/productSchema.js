const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number },
    quantity: { type: Number, default: 0 },
    type: { type: String, default: "unknown" },
    material: { type: String, default: "unknown" },
    brand: { type: String, required: true },
    discount: { type: Number, default: 0 },
    thumb: { type: String },
    thumbnails: [{ type: String }],
    keyFeatures: [{ type: String }], 
    sizes: [{ type: String }], 
    description: { type: String }, 
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
    ], 
    reviews: [
      {
        user: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String },
        date: { type: Date, default: Date.now },
      },
    ], 
    similarProducts: [
      {
        name: { type: String },
        price: { type: Number },
        discount: { type: Number },
        thumb: { type: String },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, 
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "product" }
);

module.exports = mongoose.model("Product", productSchema);
// models -> productSchema.js
