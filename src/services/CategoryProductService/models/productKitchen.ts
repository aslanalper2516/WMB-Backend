import mongoose from "mongoose";

const productKitchenSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  kitchen: { type: mongoose.Schema.Types.ObjectId, ref: "Kitchen", required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const ProductKitchen = mongoose.model("ProductKitchen", productKitchenSchema);
