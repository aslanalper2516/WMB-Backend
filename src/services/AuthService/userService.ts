// src/services/UserService.ts
import { User } from "./models/user";
import { Role } from "../RolePermissionService/models/role";
import { Session } from "./models/session";
import mongoose from "mongoose";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";

export class UserService {
  static async createUser(data: { name: string; email: string; password: string; role: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    let roleId;

    if (mongoose.Types.ObjectId.isValid(data.role)) {
      // Eğer role zaten ObjectId formatındaysa
      roleId = data.role;
    } else {
      // Eğer role string olarak geldiyse (örn: "admin", "user")
      const roleDoc = await Role.findOne({ name: data.role });
      if (!roleDoc) {
        throw new Error(`Role '${data.role}' not found`);
      }
      roleId = roleDoc._id;
      
    }

    return await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: roleId
    });
  }

  static async getUsers() {
    return await User.find().populate("role");
  }

  static async getUserByEmail(email: string) {
    return await User.findOne({ email }).populate("role");
  }

  static async login(email: string, password: string, userAgent?: string, ipAddress?: string) {
    const user = await User.findOne({ email }).populate("role");
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Session token oluştur
    const sessionToken = crypto.randomBytes(32).toString("hex");

    // Session'ı veritabanına kaydet
    await Session.create({
      userId: user._id,
      sessionToken,
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 saat
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      sessionToken,
    };
  }

  static async logout(sessionToken: string) {
    await Session.findOneAndUpdate(
      { sessionToken, isActive: true },
      { isActive: false }
    );
  }

  static async validateSession(sessionToken: string) {
    const session = await Session.findOne({
      sessionToken,
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).populate({
      path: "userId",
      populate: [{ path: "role" }],
    });

    if (!session || !session.userId) {
      return null;
    }

    return session.userId;
  }

  static async verifyPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async updateUser(userId: string, data: { name?: string; email?: string; password?: string; role?: string }) {
    const updateData: any = {};
    
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 12);
    if (data.role) {
      if (mongoose.Types.ObjectId.isValid(data.role)) {
        updateData.role = data.role;
      } else {
        const roleDoc = await Role.findOne({ name: data.role });
        if (!roleDoc) {
          throw new Error(`Role '${data.role}' not found`);
        }
        updateData.role = roleDoc._id;
      }
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true })
      .populate("role");
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }

  static async deleteUser(userId: string) {
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Kullanıcının aktif session'larını da sil
    await Session.updateMany(
      { userId: user._id, isActive: true },
      { isActive: false }
    );
    
    return user;
  }

  static async getUserById(userId: string) {
    const user = await User.findById(userId)
      .populate("role");
    
    if (!user) {
      throw new Error("User not found");
    }
    
    return user;
  }
}
