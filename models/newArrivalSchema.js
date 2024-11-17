const mongoose = require("mongoose");

const newArrivalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    thumb: { type: String, required: true },
    discount: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "newArrival" } // Specify the collection name here
);

const NewArrival = mongoose.model("NewArrival", newArrivalSchema);
module.exports = NewArrival;
