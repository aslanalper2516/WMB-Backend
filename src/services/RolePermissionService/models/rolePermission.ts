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
  },
  { timestamps: true }
);

// Aynı role, aynı branch, aynı permission bir kez atanabilir
rolePermissionSchema.index({ role: 1, permission: 1, branch: 1 }, { unique: true });

export const RolePermission = mongoose.model("RolePermission", rolePermissionSchema);
