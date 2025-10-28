import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true }, // hangi siparişe bağlı
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, // hangi ürün
    quantity: { type: Number, required: true, default: 1 },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "delivered", "payed", "cancelled"],
      default: "pending"
    },
    price: { type: Number, required: true },

    // Kullanıcı aksiyonları
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // siparişi kim verdi
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deliveredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // siparişi kim verdi

    // Ödeme bilgisi (ürün özelinde farklı olabilir)
    paymentMethod: { type: mongoose.Schema.Types.ObjectId, ref: "SalesMethod", required: true },
    currencyUnit: { type: mongoose.Schema.Types.ObjectId, ref: "CurrencyUnit", required: true },
  },
  { timestamps: true }
);

export const OrderItem = mongoose.model("OrderItem", orderItemSchema);
