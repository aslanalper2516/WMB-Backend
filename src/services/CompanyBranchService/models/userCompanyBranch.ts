import mongoose from "mongoose";

const userCompanyBranchSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" }, // Opsiyonel - company seviyesinde atama için
    isActive: { type: Boolean, default: true },
    
    // 🧩 Soft delete alanları
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Kullanıcı + şirket + şube kombinasyonu benzersiz olmalı (branch null olabilir)
userCompanyBranchSchema.index({ user: 1, company: 1, branch: 1 }, { unique: true, sparse: true });

userCompanyBranchSchema.pre(/^find/, function (next) {
  (this as any).where({ isDeleted: { $ne: true } });
  next();
});

export const UserCompanyBranch = mongoose.model("UserCompanyBranch", userCompanyBranchSchema);

