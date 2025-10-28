import mongoose from "mongoose";

const menuBranchSchema = new mongoose.Schema({
  menu: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const MenuBranch = mongoose.model("MenuBranch", menuBranchSchema);
