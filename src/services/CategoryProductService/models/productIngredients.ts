import mongoose from "mongoose";

const productIngredientsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  amount: { type: Number, required: true },
  amountUnit: { type: mongoose.Schema.Types.ObjectId, ref: "AmountUnit", required: true },
  price: { type: Number, default: 0 }, // 0 = ücretsiz
  priceUnit: { type: mongoose.Schema.Types.ObjectId, ref: "CurrencyUnit", required: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

export const ProductIngredients = mongoose.model("ProductIngredients", productIngredientsSchema);
