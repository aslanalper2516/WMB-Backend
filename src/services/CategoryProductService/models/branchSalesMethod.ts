import mongoose from "mongoose";

const branchSalesMethodSchema = new mongoose.Schema({
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  salesMethod: { type: mongoose.Schema.Types.ObjectId, ref: "SalesMethod", required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const BranchSalesMethod = mongoose.model("BranchSalesMethod", branchSalesMethodSchema);
