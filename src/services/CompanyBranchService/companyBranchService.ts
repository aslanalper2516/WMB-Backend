import { Company } from "./models/company";
import { Branch } from "./models/branch";
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
    manager?: string;
    managerEmail?: string;
    managerPhone?: string;
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
    manager: string;
    managerEmail: string;
    managerPhone: string;
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
    manager?: string;
    managerEmail?: string;
    managerPhone?: string;
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
    return await Branch.find(query).populate("company").populate("manager");
  }

  static async getBranchById(id: string) {
    return await Branch.findById(id).populate("company").populate("manager");
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
    manager: string;
    managerEmail: string;
    managerPhone: string;
    tables: number;
  }>) {
    return await Branch.findByIdAndUpdate(id, data, { new: true })
      .populate("company")
      .populate("manager");
  }

  static async updateBranchTables(id: string, tables: number) {
    return await Branch.findByIdAndUpdate(id, { tables }, { new: true })
      .populate("company")
      .populate("manager");
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
}
