import mongoose from "mongoose";

const productPriceSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  salesMethod: { type: mongoose.Schema.Types.ObjectId, ref: "SalesMethod", required: true },
  price: { type: Number, required: true }, // fiyat
  currencyUnit: { type: mongoose.Schema.Types.ObjectId, ref: "CurrencyUnit", required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" } // optional
}, { timestamps: true });

export const ProductPrice = mongoose.model("ProductPrice", productPriceSchema);
