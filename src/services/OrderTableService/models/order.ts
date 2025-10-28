import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // siparişi veren kullanıcı
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true }, // sipariş hangi şubeye ait
    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table" }, // sipariş hangi masadan verildi

    // Genel sipariş durumu
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "delivered", "payed", "cancelled"],
      default: "pending"
    },

    // Ödeme bilgileri (sipariş geneli için)
    paymentMethod: { type: mongoose.Schema.Types.ObjectId, ref: "SalesMethod" },
    currencyUnit: { type: mongoose.Schema.Types.ObjectId, ref: "CurrencyUnit" },
    totalPrice: { type: Number, default: 0 },

    // Siparişe dair notlar
    note: { type: String },

    // Sipariş aksiyonları
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deliveredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
