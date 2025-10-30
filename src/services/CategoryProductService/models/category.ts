import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Category = mongoose.model("Category", categorySchema);
