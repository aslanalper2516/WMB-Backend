import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  material: { type: mongoose.Schema.Types.ObjectId, ref: "Material", required: true },
  amount: { type: Number, required: true },
  amountUnit: { type: mongoose.Schema.Types.ObjectId, ref: "AmountUnit", required: true }
}, { timestamps: true });

export const Recipe = mongoose.model("Recipe", recipeSchema);
