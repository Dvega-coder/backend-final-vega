// src/models/product.model.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  price:    { type: Number, required: true, min: 0 },
  category: { type: String, required: true, index: true, trim: true },
  status:   { type: Boolean, default: true },  // disponible / no disponible
  stock:    { type: Number, default: 0, min: 0 },
}, { timestamps: true });

export const ProductModel = mongoose.model("Product", productSchema);
