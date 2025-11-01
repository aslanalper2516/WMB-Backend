import { Company } from "./models/company";
import { Branch } from "./models/branch";
import { UserCompanyBranch } from "./models/userCompanyBranch";
import { User } from "../AuthService/models/user";
import { Kitchen } from "../CategoryProductService/models/kitchen";
import { Category } from "../CategoryProductService/models/category";
import { Product } from "../CategoryProductService/models/product";
import { Ingredient } from "../CategoryProductService/models/ingredient";
import { IngredientCategory } from "../CategoryProductService/models/ingredientCategory";
import { Menu } from "../CategoryProductService/models/menu";
import { BranchSalesMethod } from "../CategoryProductService/models/branchSalesMethod";
import { ProductKitchen } from "../CategoryProductService/models/productKitchen";
import { MenuBranch } from "../CategoryProductService/models/menuBranch";
import { MenuProduct } from "../CategoryProductService/models/menuProduct";
import { ProductPrice } from "../CategoryProductService/models/productPrice";
import { ProductIngredients } from "../CategoryProductService/models/productIngredients";
import { Table } from "../OrderTableService/models/table";
import { Role } from "../RolePermissionService/models/role";
import { RolePermission } from "../RolePermissionService/models/rolePermission";

export class CompanyBranchService {
  /* ---------------------------
   *  COMPANY OPERATIONS
   * -------------------------*/
  static async createCompany(data: { 
    name: string; 
    email: string; 
    phone?: string; 
    province?: string;
    district?: string;
    neighborhood?: string;
    street?: string;
    address?: string;
  }) {
    // Email benzersizlik kontrolü
    const existingCompanyByEmail = await Company.findOne({ 
      email: data.email,
      isDeleted: { $ne: true }
    });
    
    if (existingCompanyByEmail) {
      throw new Error('Bu e-posta adresi zaten kullanılıyor');
    }

    // Name benzersizlik kontrolü
    const existingCompanyByName = await Company.findOne({ 
      name: data.name,
      isDeleted: { $ne: true }
    });
    
    if (existingCompanyByName) {
      throw new Error('Bu şirket adı zaten kullanılıyor');
    }

    // Phone benzersizlik kontrolü
    if (data.phone) {
      const existingCompanyByPhone = await Company.findOne({ 
        phone: data.phone,
        isDeleted: { $ne: true }
      });
      
      if (existingCompanyByPhone) {
        throw new Error('Bu telefon numarası zaten kullanılıyor');
      }
    }

    // Açık adres kontrolü (sadece açık adresin aynı olup olmadığını kontrol et)
    if (data.address) {
      const addressMatch = await Company.findOne({
        address: data.address,
        isDeleted: { $ne: true }
      });

      if (addressMatch) {
        throw new Error('Bu adrese sahip bir şirket zaten kayıtlı');
      }
    }

    return await Company.create(data);
  }

  static async getCompanies() {
    return await Company.find();
  }

  static async getCompanyById(id: string) {
    return await Company.findById(id);
  }

  static async updateCompany(id: string, data: Partial<{ 
    name: string; 
    email: string; 
    phone: string;
    province: string;
    district: string;
    neighborhood: string;
    street: string;
    address: string;
  }>) {
    return await Company.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteCompany(id: string) {
    const deleteTime = new Date();

    // Şirkete ait şubelerin ID'lerini önce al (silmeden önce)
    const companyBranches = await Branch.find({ company: id, isDeleted: false }).select('_id');
    const branchIds = companyBranches.map(b => b._id.toString());

    // Önce şirketi soft delete yap
    const deletedCompany = await Company.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: deleteTime },
      { new: true }
    );

    // Şirkete ait tüm şubeleri soft delete yap
    await Branch.updateMany(
      { company: id },
      { isDeleted: true, deletedAt: deleteTime }
    );

    // Şirkete bağlı kullanıcıları önce bul (soft delete yapmadan önce)
    const userAssignments = await UserCompanyBranch.find({ company: id, isDeleted: false }).select('user');
    const userIdsSet = new Set(userAssignments.map(a => a.user.toString()));
    const userIds = Array.from(userIdsSet);
    if (userIds.length > 0) {
      await User.updateMany(
        { _id: { $in: userIds } },
        { isDeleted: true, deletedAt: deleteTime }
      );
    }

    // Şirkete ait kullanıcı atamalarını soft delete yap
    await UserCompanyBranch.updateMany(
      { company: id },
      { isDeleted: true, deletedAt: deleteTime }
    );

    // Şirkete ait kategorileri soft delete yap
    await Category.updateMany(
      { company: id },
      { isDeleted: true, deletedAt: deleteTime }
    );

    // Şirkete ait ürünleri soft delete yap
    await Product.updateMany(
      { company: id },
      { isDeleted: true, deletedAt: deleteTime }
    );

    // Şirkete ait malzemeleri soft delete yap
    await Ingredient.updateMany(
      { company: id },
      { isDeleted: true, deletedAt: deleteTime }
    );

    // Şirkete ait malzeme kategorilerini soft delete yap
    await IngredientCategory.updateMany(
      { company: id },
      { isDeleted: true, deletedAt: deleteTime }
    );

    // Şirkete ait menüleri soft delete yap
    await Menu.updateMany(
      { company: id },
      { isDeleted: true, deletedAt: deleteTime }
    );

    // Şirkete ait mutfakları soft delete yap
    await Kitchen.updateMany(
      { company: id },
      { isDeleted: true, deletedAt: deleteTime }
    );

    // Şirketin şubelerine ait masaları soft delete yap
    if (branchIds.length > 0) {
      await Table.updateMany(
        { branch: { $in: branchIds } },
        { isDeleted: true, deletedAt: deleteTime }
      );
    }

    // Şirketin şubelerine ait satış yöntemlerini soft delete yap
    if (branchIds.length > 0) {
      await BranchSalesMethod.updateMany(
        { branch: { $in: branchIds } },
        { isDeleted: true, deletedAt: deleteTime }
      );
    }

    // Şirketin şubelerine ait ürün-mutfak ilişkilerini soft delete yap
    if (branchIds.length > 0) {
      await ProductKitchen.updateMany(
        { branch: { $in: branchIds } },
        { isDeleted: true, deletedAt: deleteTime }
      );
    }

    // Şirketin şubelerine ait menü-şube ilişkilerini soft delete yap
    if (branchIds.length > 0) {
      await MenuBranch.updateMany(
        { branch: { $in: branchIds } },
        { isDeleted: true, deletedAt: deleteTime }
      );
    }

    // Şirkete ait ürün fiyatlarını soft delete yap
    await ProductPrice.updateMany(
      { company: id },
      { isDeleted: true, deletedAt: deleteTime }
    );

    // Şirkete ait ürün malzeme ilişkilerini soft delete yap
    await ProductIngredients.updateMany(
      { company: id },
      { isDeleted: true, deletedAt: deleteTime }
    );

    // Şirketin şubelerine ait rolleri soft delete yap
    if (branchIds.length > 0) {
      await Role.updateMany(
        { branch: { $in: branchIds } },
        { isDeleted: true, deletedAt: deleteTime }
      );
    }

    // Şirketin şubelerine ait rol-izin ilişkilerini soft delete yap
    if (branchIds.length > 0) {
      await RolePermission.updateMany(
        { branch: { $in: branchIds } },
        { isDeleted: true, deletedAt: deleteTime }
      );
    }

    return deletedCompany;
  }

  // ✅ Silinen şirketleri listele
  static async getDeletedCompanies() {
    return await Company.find({ isDeleted: true });
  }

  // ✅ Şirketi geri yükle (restore)
  static async restoreCompany(id: string) {
    return await Company.findByIdAndUpdate(
      id,
      { isDeleted: false, deletedAt: null },
      { new: true }
    );
  }

  /* ---------------------------
   *  BRANCH OPERATIONS
   * -------------------------*/
  static async createBranch(data: { 
    name: string; 
    email: string;
    phone?: string; 
    province?: string;
    district?: string;
    neighborhood?: string;
    street?: string;
    address?: string;
    company: string; 
    tables?: number; 
  }) {
    // Email benzersizlik kontrolü
    const existingBranchByEmail = await Branch.findOne({ 
      email: data.email,
      isDeleted: { $ne: true }
    });
    
    if (existingBranchByEmail) {
      throw new Error('Bu e-posta adresi zaten kullanılıyor');
    }

    return await Branch.create(data);
  }

  static async getBranches(companyId?: string) {
    const query: any = {};
    if (companyId) query.company = companyId;
    return await Branch.find(query).populate("company");
  }

  static async getBranchById(id: string) {
    return await Branch.findById(id).populate("company");
  }

  static async updateBranch(id: string, data: Partial<{ 
    name: string; 
    email: string;
    phone: string; 
    province: string;
    district: string;
    neighborhood: string;
    street: string;
    address: string;
    tables: number;
  }>) {
    return await Branch.findByIdAndUpdate(id, data, { new: true })
      .populate("company");
  }

  static async updateBranchTables(id: string, tables: number) {
    return await Branch.findByIdAndUpdate(id, { tables }, { new: true })
      .populate("company");
  }

  static async deleteBranch(id: string) {
    return await Branch.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
  }

  // ✅ Silinen şubeleri listele
  static async getDeletedBranches() {
    return await Branch.find({ isDeleted: true });
  }

  // ✅ Şubeyi geri yükle (restore)
  static async restoreBranch(id: string) {
    return await Branch.findByIdAndUpdate(
      id,
      { isDeleted: false, deletedAt: null },
      { new: true }
    );
  }

  /* ---------------------------
   *  KITCHEN OPERATIONS
   * -------------------------*/
  static async getKitchens(branchId?: string) {
    const query: any = {};
    if (branchId) query.branch = branchId;
    
    return await Kitchen.find(query)
      .populate("company")
      .populate("branch")
      .sort({ name: 1 });
  }

  /* ---------------------------
   *  USER COMPANY BRANCH OPERATIONS
   * -------------------------*/
  static async assignUserToCompanyBranch(data: {
    user: string;
    company: string;
    branch?: string;
  }) {
    // Kullanıcı kontrolü
    const user = await User.findById(data.user).populate("role");
    if (!user) {
      throw new Error("Kullanıcı bulunamadı");
    }

    // Super-admin rolüne sahip kullanıcılar şirket/şubeye atanamaz
    if (user.role && typeof user.role === 'object') {
      const role = user.role as any;
      if (role && role.name) {
        const roleName = role.name.toLowerCase().trim();
        if (roleName === 'super-admin' || roleName === 'super admin') {
          throw new Error("Super-admin rolüne sahip kullanıcılar şirket veya şubeye atanamaz.");
        }
      }
    }

    // Şirket kontrolü
    const company = await Company.findById(data.company);
    if (!company) {
      throw new Error("Şirket bulunamadı");
    }
    if (company.isDeleted) {
      throw new Error("Şirket silinmiş durumda");
    }

    // Kullanıcının aktif olan başka bir şirkete atanıp atanmadığını kontrol et
    const existingAssignments = await UserCompanyBranch.find({
      user: data.user,
      isActive: true
    }).populate("company");

    // Kullanıcı zaten başka bir şirkete atanmış mı?
    const hasOtherCompany = existingAssignments.some((assignment: any) => {
      const assignmentCompany = assignment.company;
      const companyId = typeof assignmentCompany === 'string' 
        ? assignmentCompany 
        : assignmentCompany._id.toString();
      return companyId !== data.company;
    });

    if (hasOtherCompany) {
      throw new Error("Bu kullanıcı zaten başka bir şirkete atanmış. Bir kullanıcı sadece bir şirkete ait olabilir.");
    }

    // Şirket-yöneticisi rolüne sahip kullanıcılar şubeye atanamaz (sadece şirket seviyesinde atanabilir)
    if (user.role && typeof user.role === 'object') {
      const role = user.role as any;
      if (role && role.name) {
        const roleName = role.name.toLowerCase().trim();
        if ((roleName === 'şirket-yöneticisi' || roleName === 'şirket yöneticisi' || 
             roleName === 'sirket-yoneticisi' || roleName === 'sirket yoneticisi') && 
            data.branch) {
          throw new Error("Şirket yöneticisi rolüne sahip kullanıcılar şubeye atanamaz. Sadece şirket seviyesinde atanabilirler.");
        }
      }
    }

    // Eğer branch belirtilmişse, branch kontrolü
    if (data.branch) {
      const branch = await Branch.findById(data.branch);
      if (!branch) {
        throw new Error("Şube bulunamadı");
      }
      if (branch.isDeleted) {
        throw new Error("Şube silinmiş durumda");
      }
      if (branch.company.toString() !== data.company) {
        throw new Error("Seçilen şube, belirtilen şirkete ait değil");
      }
    }

    // Aynı kombinasyonun var olup olmadığını kontrol et
    const existing = await UserCompanyBranch.findOne({
      user: data.user,
      company: data.company,
      branch: data.branch || null
    });

    if (existing) {
      throw new Error("Bu kullanıcı zaten bu şirket/şubeye atanmış");
    }

    return await UserCompanyBranch.create(data);
  }

  static async getUserCompanyBranches(userId?: string, companyId?: string, branchId?: string) {
    const query: any = { isActive: true };
    if (userId) query.user = userId;
    if (companyId) query.company = companyId;
    if (branchId) query.branch = branchId;
    
    return await UserCompanyBranch.find(query)
      .populate("user")
      .populate("company")
      .populate("branch")
      .sort({ createdAt: -1 });
  }

  static async getUserCompanyBranchById(id: string) {
    return await UserCompanyBranch.findById(id)
      .populate("user")
      .populate("company")
      .populate("branch");
  }

  static async updateUserCompanyBranch(id: string, data: {
    branch?: string;
    isActive?: boolean;
  }) {
    const existing = await UserCompanyBranch.findById(id);
    if (!existing) {
      throw new Error("Kullanıcı-şirket-şube ilişkisi bulunamadı");
    }

    // Eğer branch değiştiriliyorsa, branch kontrolü
    if (data.branch !== undefined) {
      if (data.branch) {
        const branch = await Branch.findById(data.branch);
        if (!branch) {
          throw new Error("Şube bulunamadı");
        }
        if (branch.isDeleted) {
          throw new Error("Şube silinmiş durumda");
        }
        if (branch.company.toString() !== existing.company.toString()) {
          throw new Error("Seçilen şube, kullanıcının şirketine ait değil");
        }
      }

      // Aynı kombinasyonun başka bir kayıtta var olup olmadığını kontrol et
      const duplicateCheck = await UserCompanyBranch.findOne({
        user: existing.user,
        company: existing.company,
        branch: data.branch || null,
        _id: { $ne: id }
      });

      if (duplicateCheck) {
        throw new Error("Bu kullanıcı zaten bu şirket/şubeye atanmış");
      }
    }

    return await UserCompanyBranch.findByIdAndUpdate(id, data, { new: true })
      .populate("user")
      .populate("company")
      .populate("branch");
  }

  static async deleteUserCompanyBranch(id: string) {
    return await UserCompanyBranch.findByIdAndDelete(id);
  }

  static async getUserCompanies(userId: string) {
    return await UserCompanyBranch.find({ user: userId, isActive: true })
      .populate("company")
      .populate("branch")
      .sort({ createdAt: -1 });
  }

  static async getCompanyUsers(companyId: string, branchId?: string) {
    const query: any = { company: companyId, isActive: true };
    if (branchId) query.branch = branchId;
    
    return await UserCompanyBranch.find(query)
      .populate("user")
      .populate("branch")
      .sort({ createdAt: -1 });
  }

  /* ---------------------------
   *  MANAGER OPERATIONS
   * -------------------------*/

  /**
   * Şirket yöneticilerini getirir
   * Rolü "şirket-yöneticisi" olan ve bu şirkete atanmış kullanıcıları döndürür
   */
  static async getCompanyManagers(companyId: string) {
    const assignments = await UserCompanyBranch.find({ 
      company: companyId, 
      branch: null,  // Şirket seviyesinde atama
      isActive: true 
    })
      .populate({
        path: "user",
        populate: {
          path: "role",
          model: "Role"
        }
      })
      .sort({ createdAt: -1 });

    // Rol adı kontrolü - "şirket-yöneticisi" olmalı
    const managers = assignments.filter((assignment: any) => {
      const user = assignment.user;
      if (!user || !user.role) return false;
      
      const role = typeof user.role === 'string' ? null : user.role;
      if (!role || !role.name) return false;
      
      // Rol adı kontrolü (büyük/küçük harf duyarsız, tire veya boşluk olabilir)
      const roleName = role.name.toLowerCase().trim();
      return roleName === 'şirket-yöneticisi' || 
             roleName === 'şirket yöneticisi' ||
             roleName === 'sirket-yoneticisi' ||
             roleName === 'sirket yoneticisi';
    });

    return managers;
  }

  /**
   * Şube yöneticilerini getirir
   * Rolü "şube-yöneticisi" olan ve bu şubeye atanmış kullanıcıları döndürür
   */
  static async getBranchManagers(branchId: string) {
    const assignments = await UserCompanyBranch.find({ 
      branch: branchId,
      isActive: true 
    })
      .populate({
        path: "user",
        populate: {
          path: "role",
          model: "Role"
        }
      })
      .populate("branch")
      .sort({ createdAt: -1 });

    // Rol adı kontrolü - "şube-yöneticisi" olmalı
    const managers = assignments.filter((assignment: any) => {
      const user = assignment.user;
      if (!user || !user.role) return false;
      
      const role = typeof user.role === 'string' ? null : user.role;
      if (!role || !role.name) return false;
      
      // Rol adı kontrolü (büyük/küçük harf duyarsız, tire veya boşluk olabilir)
      const roleName = role.name.toLowerCase().trim();
      return roleName === 'şube-yöneticisi' || 
             roleName === 'şube yöneticisi' ||
             roleName === 'sube-yoneticisi' ||
             roleName === 'sube yoneticisi';
    });

    return managers;
  }
}
