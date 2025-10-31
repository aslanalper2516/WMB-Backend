import { Company } from "./models/company";
import { Branch } from "./models/branch";
import { UserCompanyBranch } from "./models/userCompanyBranch";
import { User } from "../AuthService/models/user";
import { Kitchen } from "../CategoryProductService/models/kitchen";

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
  return await Company.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
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
    isManager?: boolean;
    managerType?: "company" | "branch";
  }) {
    // Kullanıcı kontrolü
    const user = await User.findById(data.user);
    if (!user) {
      throw new Error("Kullanıcı bulunamadı");
    }

    // Şirket kontrolü
    const company = await Company.findById(data.company);
    if (!company) {
      throw new Error("Şirket bulunamadı");
    }
    if (company.isDeleted) {
      throw new Error("Şirket silinmiş durumda");
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

      // managerType kontrolü
      if (data.isManager && data.managerType === "branch" && !data.branch) {
        throw new Error("Şube yöneticisi için şube belirtilmesi gerekiyor");
      }
    } else {
      // Branch belirtilmemişse sadece company yöneticisi olabilir
      if (data.isManager && data.managerType !== "company") {
        throw new Error("Şirket seviyesinde atama için managerType 'company' olmalı");
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
    isManager?: boolean;
    managerType?: "company" | "branch";
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

        // managerType kontrolü
        if (data.isManager && data.managerType === "branch" && !data.branch) {
          throw new Error("Şube yöneticisi için şube belirtilmesi gerekiyor");
        }
      } else {
        // Branch null yapılıyorsa, sadece company seviyesinde olmalı
        if (data.isManager && data.managerType !== "company") {
          throw new Error("Şirket seviyesinde atama için managerType 'company' olmalı");
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
}
