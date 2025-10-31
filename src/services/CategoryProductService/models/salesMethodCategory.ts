import mongoose from "mongoose";

const salesMethodCategorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // Online Satış, Restoranda Satış
  description: { type: String }, // Opsiyonel açıklama
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const SalesMethodCategory = mongoose.model("SalesMethodCategory", salesMethodCategorySchema);

