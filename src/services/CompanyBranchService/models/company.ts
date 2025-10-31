import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    
    // Adres alanları
    province: { type: String }, // İl
    district: { type: String }, // İlçe
    neighborhood: { type: String }, // Mahalle
    street: { type: String }, // Sokak
    address: { type: String }, // Tam adres (birleştirilmiş)

    // 🧩 Soft delete alanları
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

companySchema.pre(/^find/, function (next) {
  (this as any).where({ isDeleted: { $ne: true } });
  next();
});

export const Company = mongoose.model("Company", companySchema);
