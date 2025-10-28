import mongoose from "mongoose";

const kitchenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true }
}, { timestamps: true });

export const Kitchen = mongoose.model("Kitchen", kitchenSchema);
