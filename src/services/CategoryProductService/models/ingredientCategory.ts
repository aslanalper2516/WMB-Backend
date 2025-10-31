import mongoose from "mongoose";

const ingredientCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const IngredientCategory = mongoose.model("IngredientCategory", ingredientCategorySchema);

