import mongoose from "mongoose";

const salesMethodSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Yemeksepeti, Nakit, Kredi Kartı
  description: { type: String }, // Opsiyonel açıklama
  category: { type: mongoose.Schema.Types.ObjectId, ref: "SalesMethodCategory", required: true }, // Kategori referansı
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const SalesMethod = mongoose.model("SalesMethod", salesMethodSchema);
