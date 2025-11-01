import mongoose from "mongoose";

const ingredientCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    isActive: { type: Boolean, default: true },
    
    // 🧩 Soft delete alanları
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ingredientCategorySchema.pre(/^find/, function (next) {
  (this as any).where({ isDeleted: { $ne: true } });
  next();
});

export const IngredientCategory = mongoose.model("IngredientCategory", ingredientCategorySchema);

