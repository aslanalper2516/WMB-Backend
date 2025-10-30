import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  defaultSalesMethod: { type: mongoose.Schema.Types.ObjectId, ref: "SalesMethod", required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Product = mongoose.model("Product", productSchema);
