import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    
    // Adres alanları (Company ile aynı format)
    province: { type: String }, // İl
    district: { type: String }, // İlçe
    neighborhood: { type: String }, // Mahalle
    street: { type: String }, // Sokak
    address: { type: String }, // Tam adres (birleştirilmiş)
    
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true }, // Hangi şirkete ait
    tables: { type: Number, default: 0 }, // Şubedeki masa sayısı
    
    // 🧩 Soft delete alanları
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

branchSchema.pre(/^find/, function (next) {
  (this as any).where({ isDeleted: { $ne: true } });
  next();
});

export const Branch = mongoose.model("Branch", branchSchema);
