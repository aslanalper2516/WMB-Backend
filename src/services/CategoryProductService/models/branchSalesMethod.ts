import mongoose from "mongoose";

const branchSalesMethodSchema = new mongoose.Schema({
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  salesMethod: { type: mongoose.Schema.Types.ObjectId, ref: "SalesMethod", required: true },
  isActive: { type: Boolean, default: true },
  
  // 🧩 Soft delete alanları
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

branchSalesMethodSchema.pre(/^find/, function (next) {
  (this as any).where({ isDeleted: { $ne: true } });
  next();
});

export const BranchSalesMethod = mongoose.model("BranchSalesMethod", branchSalesMethodSchema);
