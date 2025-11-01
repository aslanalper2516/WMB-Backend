import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true }, // Masa numarası
    name: { type: String }, // Örn: B-14, S-3 gibi özel isim
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    status: {
      type: String,
      enum: ["empty", "occupied", "reserved"],
      default: "empty"
    },
    isActive: { type: Boolean, default: true },
    
    // 🧩 Soft delete alanları
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

tableSchema.pre(/^find/, function (next) {
  (this as any).where({ isDeleted: { $ne: true } });
  next();
});

export const Table = mongoose.model("Table", tableSchema);
