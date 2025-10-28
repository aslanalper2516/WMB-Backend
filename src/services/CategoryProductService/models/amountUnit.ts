import mongoose from "mongoose";

const amountUnitSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true } // gram, kg, litre, adet
}, { timestamps: true });

export const AmountUnit = mongoose.model("AmountUnit", amountUnitSchema);
