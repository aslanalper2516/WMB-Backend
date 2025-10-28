import mongoose from "mongoose";

const salesMethodSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // online, restoranda satış, gel-al
  description: { type: String } // Opsiyonel açıklama
}, { timestamps: true });

export const SalesMethod = mongoose.model("SalesMethod", salesMethodSchema);
