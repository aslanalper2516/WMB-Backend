import mongoose from "mongoose";

const rolePermissionSchema = new mongoose.Schema(
  {
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    permission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permission",
      required: true,
    },
    // GLOBAL roller branchsiz olabilir, BRANCH rollerin branch'i olur
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: false,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    // 🧩 Soft delete alanları
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Aynı role, aynı branch, aynı permission bir kez atanabilir
rolePermissionSchema.index({ role: 1, permission: 1, branch: 1 }, { unique: true });

rolePermissionSchema.pre(/^find/, function (next) {
  (this as any).where({ isDeleted: { $ne: true } });
  next();
});

export const RolePermission = mongoose.model("RolePermission", rolePermissionSchema);
