import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    sessionToken: { 
      type: String, 
      required: true, 
      unique: true 
    },
    expiresAt: { 
      type: Date, 
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 gün
    },
    userAgent: { type: String },
    ipAddress: { type: String },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true }
);

// Expired sessions'ları otomatik sil
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model("Session", sessionSchema);
