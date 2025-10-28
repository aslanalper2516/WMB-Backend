import mongoose from "mongoose";

const menuCategorySchema = new mongoose.Schema({
  menu: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "MenuCategory", default: null }, // Alt kategori için parent referansı
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const MenuCategory = mongoose.model("MenuCategory", menuCategorySchema);
