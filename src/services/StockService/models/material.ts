import mongoose from "mongoose";

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, default: 0 },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: "AmountUnit", required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true }
}, { timestamps: true });

export const Material = mongoose.model("Material", materialSchema);
