import mongoose from "mongoose";

const addressDataSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['province', 'district', 'neighborhood', 'street'], required: true },
    name: { type: String, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'AddressData', default: null },
    code: { type: String }, // İl plaka kodu veya başka kodlar için
  },
  { timestamps: true }
);

// Index'ler
addressDataSchema.index({ type: 1, name: 1 });
addressDataSchema.index({ parentId: 1 });
addressDataSchema.index({ type: 1, parentId: 1 });

export const AddressData = mongoose.model("AddressData", addressDataSchema);
