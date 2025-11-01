import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "IngredientCategory" },
    isActive: { type: Boolean, default: true },
    
    // 🧩 Soft delete alanları
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ingredientSchema.pre(/^find/, function (next) {
  (this as any).where({ isDeleted: { $ne: true } });
  next();
});

export const Ingredient = mongoose.model("Ingredient", ingredientSchema);

