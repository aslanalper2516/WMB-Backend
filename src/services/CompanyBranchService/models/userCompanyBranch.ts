import mongoose from "mongoose";

const userCompanyBranchSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" }, // Opsiyonel - company seviyesinde atama için
    isManager: { type: Boolean, default: false }, // Yönetici mi?
    managerType: { 
      type: String, 
      enum: ["company", "branch"], 
      default: null 
    }, // "company" veya "branch" yöneticisi
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Kullanıcı + şirket + şube kombinasyonu benzersiz olmalı (branch null olabilir)
userCompanyBranchSchema.index({ user: 1, company: 1, branch: 1 }, { unique: true, sparse: true });

export const UserCompanyBranch = mongoose.model("UserCompanyBranch", userCompanyBranchSchema);

