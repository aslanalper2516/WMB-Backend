import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },              // Kullanıcı adı
    email: { type: String, required: true, unique: true }, // Benzersiz e-posta
    password: { type: String, required: true },          // Şifre
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" } // Kullanıcının rolü
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
