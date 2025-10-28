import mongoose from "mongoose";

const menuProductSchema = new mongoose.Schema({
  menu: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const MenuProduct = mongoose.model("MenuProduct", menuProductSchema);
