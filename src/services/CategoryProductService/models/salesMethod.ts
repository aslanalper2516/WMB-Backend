import mongoose from "mongoose";

const salesMethodSchema = new mongoose.Schema({
  name: { type: String, required: true }, // online, restoranda satış, gel-al
  description: { type: String }, // Opsiyonel açıklama
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "SalesMethod", default: null } // Parent sales method ID
}, { timestamps: true });

export const SalesMethod = mongoose.model("SalesMethod", salesMethodSchema);
