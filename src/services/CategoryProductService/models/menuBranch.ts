import mongoose from "mongoose";

const menuBranchSchema = new mongoose.Schema({
  menu: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  isActive: { type: Boolean, default: true },
  
  // 🧩 Soft delete alanları
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

menuBranchSchema.pre(/^find/, function (next) {
  (this as any).where({ isDeleted: { $ne: true } });
  next();
});

export const MenuBranch = mongoose.model("MenuBranch", menuBranchSchema);
