import mongoose from "mongoose";
import dotenv from "dotenv";
import * as bcrypt from "bcryptjs";
import { User } from "../services/AuthService/models/user";
import { Role } from "../services/RolePermissionService/models/role";
import { Permission } from "../services/RolePermissionService/models/permission";
import { RolePermission } from "../services/RolePermissionService/models/rolePermission";
import { Company } from "../services/CompanyBranchService/models/company";
import { Branch } from "../services/CompanyBranchService/models/branch";
import { SalesMethod } from "../services/CategoryProductService/models/salesMethod";

dotenv.config();

// ENV'de tanımlı değilse default olarak local MongoDB kullan
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/wmb-tracker";

async function seedDatabase() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connection established.");

    // 1️⃣ Permissions oluştur
    console.log("📝 Creating permissions...");
    const permissions = [
      // Company Branch Permissions
      "şirket listeleme",
      "şirket oluşturma", 
      "şirket görüntüleme",
      "şirket güncelleme",
      "şirket silme",
      "şube listeleme",
      "şube oluşturma",
      "şube görüntüleme", 
      "şube güncelleme",
      "şube masa sayısı güncelleme",
      "şube silme",
      
      // Role Permission Permissions
      "izin oluşturma",
      "izin listeleme",
      "izin güncelleme",
      "izin silme",
      "rol oluşturma",
      "rol listeleme",
      "rol güncelleme",
      "rol silme",
      "role izin atama",
      "role izin kaldırma",
      "role izin listeleme",
      
      // Category Product Permissions
      "kategori oluşturma",
      "kategori listeleme",
      "kategori görüntüleme",
      "kategori güncelleme",
      "kategori silme",
      "kategori taşıma",
      "ürün oluşturma",
      "ürün listeleme",
      "ürün görüntüleme",
      "ürün güncelleme",
      "ürün silme",
      "ürün kategori değiştirme",
      "mutfak oluşturma",
      "mutfak listeleme",
      "mutfak görüntüleme",
      "mutfak güncelleme",
      "mutfak silme",
      "malzeme oluşturma",
      "malzeme listeleme",
      "malzeme görüntüleme",
      "malzeme güncelleme",
      "malzeme silme",
      "fiyat oluşturma",
      "fiyat listeleme",
      "fiyat görüntüleme",
      "fiyat güncelleme",
      "fiyat silme",
      "satış yöntemi atama",
      "satış yöntemi kaldırma",
      "satış yöntemi oluşturma",
      "satış yöntemi güncelleme",
      "satış yöntemi silme",
      
      // Menu Permissions
      "menü oluşturma",
      "menü listeleme",
      "menü görüntüleme",
      "menü güncelleme",
      "menü silme",
      "menü kategori ekleme",
      "menü kategori kaldırma",
      "menü kategori listeleme",
      "menü kategori güncelleme",
      "menü şubeye atama",
      "menü şubeden kaldırma",
      "menü şube listeleme",
      "menü şube atama",
      "menü ürün ekleme",
      "ürün mutfak atama",
      
      // User Management Permissions
      "kullanıcı listeleme",
      "kullanıcı görüntüleme",
      "yeni kullanıcı oluşturma",
      "kullanıcı güncelleme",
      "kullanıcı silme"
    ];

    const createdPermissions = [];
    for (const permName of permissions) {
      const permission = await Permission.findOneAndUpdate(
        { name: permName },
        { name: permName, description: `${permName} izni` },
        { upsert: true, new: true }
      );
      createdPermissions.push(permission);
    }
    console.log(`✅ ${createdPermissions.length} permissions created.`);

    // 2️⃣ Super Admin rolü oluştur
    console.log("👑 Creating super-admin role...");
    const superAdminRole = await Role.findOneAndUpdate(
      { name: "super-admin" },
      { 
        name: "super-admin",
        scope: "GLOBAL",
        branch: null,
        permissions: createdPermissions.map(p => p._id)
      },
      { upsert: true, new: true }
    );
    console.log("✅ Super-admin role created.");

    // 2.5️⃣ Diğer roller oluştur (şirket yöneticisi, şube yöneticisi, garson)
    console.log("👥 Creating additional roles...");
    const companyManagerRole = await Role.findOneAndUpdate(
      { name: "şirket-yöneticisi" },
      {
        name: "şirket-yöneticisi",
        scope: "GLOBAL",
        branch: null,
        permissions: []
      },
      { upsert: true, new: true }
    );
    console.log("✅ Company manager role created.");

    const branchManagerRole = await Role.findOneAndUpdate(
      { name: "şube-yöneticisi" },
      {
        name: "şube-yöneticisi",
        scope: "GLOBAL",
        branch: null,
        permissions: []
      },
      { upsert: true, new: true }
    );
    console.log("✅ Branch manager role created.");

    const waiterRole = await Role.findOneAndUpdate(
      { name: "garson" },
      {
        name: "garson",
        scope: "GLOBAL",
        branch: null,
        permissions: []
      },
      { upsert: true, new: true }
    );
    console.log("✅ Waiter role created.");

    // 3️⃣ User oluştur
    // Not: User modelinde company ve branch alanları yoktur.
    // Bu ilişkiler UserCompanyBranch tablosunda tanımlanır.
    console.log("👤 Creating user...");
    const hashedPassword = await bcrypt.hash("240911Mf..", 12);
    const user = await User.findOneAndUpdate(
      { email: "aslanalper2516@gmail.com" },
      {
        name: "Alper Aslan",
        email: "aslanalper2516@gmail.com",
        password: hashedPassword,
        role: superAdminRole._id
      },
      { upsert: true, new: true }
    );
    console.log("✅ User created.");

    // 4️⃣ Company oluştur
    // Not: Company modelinde manager, managerEmail, managerPhone alanları yoktur.
    // Not: Yönetici bilgisi User modelindeki role alanında tutulur.
    //      UserCompanyBranch tablosu sadece kullanıcı-şirket-şube ilişkilerini tutar.
    console.log("🏢 Creating company...");
    const company = await Company.findOneAndUpdate(
      { name: "WMB Yazılım" },
      {
        name: "WMB Yazılım",
        email: "wmbyazilim@wmb.net",
        phone: "+90 537 797 9125",
        province: "İstanbul",
        district: "Kağıthane",
        neighborhood: "Merkez Mahallesi",
        street: "Teknoloji Caddesi",
        address: "Kağıthane/İstanbul"
      },
      { upsert: true, new: true }
    );
    console.log("✅ Company created.");

    // 5️⃣ Branch oluştur
    // Not: Branch modelinde manager, managerEmail, managerPhone alanları yoktur.
    // Not: Yönetici bilgisi User modelindeki role alanında tutulur.
    //      UserCompanyBranch tablosu sadece kullanıcı-şirket-şube ilişkilerini tutar.
    console.log("🏪 Creating branch...");
    const branch = await Branch.findOneAndUpdate(
      { name: "Kağıthane Şubesi" },
      {
        name: "Kağıthane Şubesi",
        email: "kagithane@wmb.net",
        phone: "+90 537 797 9125",
        province: "İstanbul",
        district: "Kağıthane",
        neighborhood: "Merkez Mahallesi",
        street: "Teknoloji Caddesi",
        address: "Kağıthane/İstanbul",
        company: company._id,
        tables: 0
      },
      { upsert: true, new: true }
    );
    console.log("✅ Branch created.");

    // 5.5️⃣ UserCompanyBranch ilişkisi oluştur
    // Not: Super-admin rolüne sahip kullanıcılar şirket/şubeye atanamaz.
    //      Bu yüzden seed dosyasında super-admin rolüne sahip kullanıcıya şirket/şube ataması yapılmaz.
    console.log("ℹ️ Skipping user-company-branch relationship for super-admin user.");

    // 6️⃣ RolePermission ilişkilerini oluştur
    console.log("🔗 Creating role-permission relationships...");
    for (const permission of createdPermissions) {
      await RolePermission.findOneAndUpdate(
        {
          role: superAdminRole._id,
          permission: permission._id,
          branch: null // Super admin global olduğu için branch yok
        },
        {
          role: superAdminRole._id,
          permission: permission._id,
          branch: null,
          createdBy: user._id
        },
        { upsert: true, new: true }
      );
    }
    console.log("✅ Role-permission relationships created.");

    // 7️⃣ Sales Methods oluştur
    console.log("🛒 Creating sales methods...");
    
    // Ana kategorileri oluştur
    const internetSales = await SalesMethod.findOneAndUpdate(
      { name: "İnternet Satışları" },
      {
        name: "İnternet Satışları",
        description: "Online platformlar üzerinden yapılan satışlar",
        parent: null
      },
      { upsert: true, new: true }
    );

    const restaurantSales = await SalesMethod.findOneAndUpdate(
      { name: "Restoranda Satış" },
      {
        name: "Restoranda Satış",
        description: "Restoran içinde yapılan satışlar",
        parent: null
      },
      { upsert: true, new: true }
    );

    const takeawaySales = await SalesMethod.findOneAndUpdate(
      { name: "Gel-Al Satışları" },
      {
        name: "Gel-Al Satışları",
        description: "Müşterinin gelip aldığı satışlar",
        parent: null
      },
      { upsert: true, new: true }
    );

    // Alt kategorileri oluştur
    await SalesMethod.findOneAndUpdate(
      { name: "Trendyol" },
      {
        name: "Trendyol",
        description: "Trendyol platformu üzerinden satış",
        parent: internetSales._id
      },
      { upsert: true, new: true }
    );

    await SalesMethod.findOneAndUpdate(
      { name: "Yemeksepeti" },
      {
        name: "Yemeksepeti",
        description: "Yemeksepeti platformu üzerinden satış",
        parent: internetSales._id
      },
      { upsert: true, new: true }
    );

    await SalesMethod.findOneAndUpdate(
      { name: "Getir" },
      {
        name: "Getir",
        description: "Getir platformu üzerinden satış",
        parent: internetSales._id
      },
      { upsert: true, new: true }
    );

    await SalesMethod.findOneAndUpdate(
      { name: "Masada Yeme" },
      {
        name: "Masada Yeme",
        description: "Restoran masasında yeme",
        parent: restaurantSales._id
      },
      { upsert: true, new: true }
    );

    await SalesMethod.findOneAndUpdate(
      { name: "Bar Siparişi" },
      {
        name: "Bar Siparişi",
        description: "Bar bölümünden sipariş",
        parent: restaurantSales._id
      },
      { upsert: true, new: true }
    );

    await SalesMethod.findOneAndUpdate(
      { name: "Paket Servis" },
      {
        name: "Paket Servis",
        description: "Paket halinde servis",
        parent: takeawaySales._id
      },
      { upsert: true, new: true }
    );

    await SalesMethod.findOneAndUpdate(
      { name: "Drive Thru" },
      {
        name: "Drive Thru",
        description: "Arabadan sipariş alma",
        parent: takeawaySales._id
      },
      { upsert: true, new: true }
    );

    console.log("✅ Sales methods created.");

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("📊 Summary:");
    console.log(`   - ${createdPermissions.length} permissions created`);
    console.log(`   - 4 roles created (super-admin, şirket-yöneticisi, şube-yöneticisi, garson)`);
    console.log(`   - 1 company created (WMB Yazılım)`);
    console.log(`   - 1 user created (Alper Aslan) - Super-admin role assigned`);
    console.log(`   - 1 branch created (Kağıthane Şubesi)`);
    console.log(`   - 0 user-company-branch relationships created (super-admin cannot be assigned to companies)`);
    console.log(`   - ${createdPermissions.length} role-permission relationships created`);
    console.log(`   - 3 main sales methods and 6 sub-sales methods created`);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed çalıştırılırken hata:", err);
    process.exit(1);
  }
}

seedDatabase();