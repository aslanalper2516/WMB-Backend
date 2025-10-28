import mongoose from "mongoose";

const currencyUnitSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true } // TL, Euro, Dolar
}, { timestamps: true });

export const CurrencyUnit = mongoose.model("CurrencyUnit", currencyUnitSchema);
