import mongoose from "mongoose";

const orderItemIngredientSchema = new mongoose.Schema(
  {
    orderItem: { type: mongoose.Schema.Types.ObjectId, ref: "OrderItem", required: true },
    ingredient: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient", required: true },
    included: { type: Boolean, default: true } // true=üründe var, false=çıkarıldı
  },
  { timestamps: true }
);

export const OrderItemIngredient = mongoose.model("OrderItemIngredient", orderItemIngredientSchema);
