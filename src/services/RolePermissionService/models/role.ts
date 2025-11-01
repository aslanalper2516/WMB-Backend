import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // GLOBAL → tüm sistemde geçerli
    // BRANCH → sadece bir şubeye bağlı
    scope: {
      type: String,
      enum: ["GLOBAL", "BRANCH"],
      default: "BRANCH",
    },

    // Eğer BRANCH rolüyse branch zorunlu olur
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: false },

    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    // 🧩 Soft delete alanları
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Aynı isim + aynı scope + aynı branch kombinasyonu tekrarlanamaz
roleSchema.index({ name: 1, scope: 1, branch: 1 }, { unique: true });

roleSchema.pre(/^find/, function (next) {
  (this as any).where({ isDeleted: { $ne: true } });
  next();
});

export const Role = mongoose.model("Role", roleSchema);
