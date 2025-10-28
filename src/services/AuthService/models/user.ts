import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },              // Kullanıcı adı
    email: { type: String, required: true, unique: true }, // Benzersiz e-posta
    password: { type: String, required: true },          // Şifre
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" }, // Kullanıcının rolü
    branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" }, // Kullanıcının bağlı olduğu şube
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" } // Kullanıcının bağlı olduğu şirket
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
