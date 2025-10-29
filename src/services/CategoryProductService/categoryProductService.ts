import { Category } from "./models/category";
import { Product } from "./models/product";
import { Kitchen } from "./models/kitchen";
import { ProductIngredients } from "./models/productIngredients";
import { ProductPrice } from "./models/productPrice";
import { BranchSalesMethod } from "./models/branchSalesMethod";
import { SalesMethod } from "./models/salesMethod";
import { AmountUnit } from "./models/amountUnit";
import { CurrencyUnit } from "./models/currencyUnit";

export const CategoryProductService = {
  /* ---------------------------
   *  CATEGORY OPERATIONS
   * -------------------------*/
  async createCategory(data: { 
    name: string; 
    description?: string;
  }) {
    // Boş string'leri undefined yap
    const cleanData: any = {
      name: data.name,
      description: data.description
    };
    
    return await Category.create(cleanData);
  },

  async getCategories() {
    return await Category.find()
      .sort({ name: 1 });
  },

  async getCategoryById(id: string) {
    return await Category.findById(id);
  },

  async updateCategory(id: string, data: { 
    name?: string; 
    description?: string;
    isActive?: boolean;
  }) {
    // Boş string'leri undefined yap
    const cleanData: any = {};
    
    if (data.name !== undefined) cleanData.name = data.name;
    if (data.description !== undefined) cleanData.description = data.description;
    if (data.isActive !== undefined) cleanData.isActive = data.isActive;
    
    return await Category.findByIdAndUpdate(id, cleanData, { new: true });
  },

  async deleteCategory(id: string) {
    return await Category.findByIdAndDelete(id);
  },

  /* ---------------------------
   *  PRODUCT OPERATIONS
   * -------------------------*/
  async createProduct(data: { 
    name: string; 
    description?: string;
    defaultSalesMethod: string;
  }) {
    // Boş string'leri kontrol et
    const cleanData: any = {
      name: data.name,
      defaultSalesMethod: data.defaultSalesMethod
    };
    
    if (data.description && data.description.trim() !== '') {
      cleanData.description = data.description;
    }
    
    return await Product.create(cleanData);
  },

  async getProducts() {
    return await Product.find()
      .populate("defaultSalesMethod")
      .sort({ name: 1 });
  },

  async getProductById(id: string) {
    return await Product.findById(id)
      .populate("defaultSalesMethod");
  },

  async updateProduct(id: string, data: { 
    name?: string; 
    description?: string;
    defaultSalesMethod?: string;
    isActive?: boolean; 
  }) {
    // Boş string'leri kontrol et
    const cleanData: any = {};
    
    if (data.name !== undefined) cleanData.name = data.name;
    if (data.isActive !== undefined) cleanData.isActive = data.isActive;
    if (data.defaultSalesMethod !== undefined) cleanData.defaultSalesMethod = data.defaultSalesMethod;
    
    if (data.description !== undefined) {
      if (data.description && data.description.trim() !== '') {
        cleanData.description = data.description;
      } else {
        cleanData.description = undefined;
      }
    }
    
    return await Product.findByIdAndUpdate(id, cleanData, { new: true })
      .populate("defaultSalesMethod");
  },

  async toggleProductActive(id: string) {
    const product = await Product.findById(id);
    if (!product) throw new Error("Product not found");
    
    return await Product.findByIdAndUpdate(id, { isActive: !product.isActive }, { new: true })
      .populate("defaultSalesMethod");
  },

  async deleteProduct(id: string) {
    // Ürün malzemelerini sil
    await ProductIngredients.deleteMany({ product: id });
    // Ürün fiyatlarını sil
    await ProductPrice.deleteMany({ product: id });
    
    return await Product.findByIdAndDelete(id);
  },

  /* ---------------------------
   *  KITCHEN OPERATIONS
   * -------------------------*/
  async createKitchen(data: { 
    name: string; 
    company: string; 
    branch: string; 
  }) {
    return await Kitchen.create(data);
  },

  async getKitchens(branchId?: string, companyId?: string) {
    const query: any = {};
    if (branchId) query.branch = branchId;
    if (companyId) query.company = companyId;
    
    return await Kitchen.find(query)
      .populate("company")
      .populate("branch")
      .sort({ name: 1 });
  },

  async getKitchenById(id: string) {
    return await Kitchen.findById(id)
      .populate("company")
      .populate("branch");
  },

  async updateKitchen(id: string, data: { name?: string }) {
    return await Kitchen.findByIdAndUpdate(id, data, { new: true })
      .populate("company")
      .populate("branch");
  },

  async deleteKitchen(id: string) {
    // Mutfağa ait ürünler var mı kontrol et
    const products = await Product.find({ kitchen: id });
    if (products.length > 0) {
      throw new Error("Bu mutfağa ait ürünler bulunmaktadır. Önce ürünleri başka bir mutfağa taşıyın.");
    }
    
    return await Kitchen.findByIdAndDelete(id);
  },

  /* ---------------------------
   *  PRODUCT INGREDIENTS OPERATIONS
   * -------------------------*/
  async createProductIngredient(data: { 
    name: string; 
    product: string; 
    amount: number; 
    amountUnit: string; 
    price: number; 
    priceUnit: string; 
    isDefault: boolean; 
  }) {
    return await ProductIngredients.create(data);
  },

  async getProductIngredients(productId: string) {
    return await ProductIngredients.find({ product: productId })
      .populate("amountUnit")
      .populate("priceUnit")
      .sort({ name: 1 });
  },

  async getIngredientById(id: string) {
    return await ProductIngredients.findById(id)
      .populate("product")
      .populate("amountUnit")
      .populate("priceUnit");
  },

  async updateIngredient(id: string, data: { 
    name?: string; 
    amount?: number; 
    amountUnit?: string; 
    price?: number; 
    priceUnit?: string; 
    isDefault?: boolean; 
  }) {
    return await ProductIngredients.findByIdAndUpdate(id, data, { new: true })
      .populate("product")
      .populate("amountUnit")
      .populate("priceUnit");
  },

  async deleteIngredient(id: string) {
    return await ProductIngredients.findByIdAndDelete(id);
  },

  /* ---------------------------
   *  PRODUCT PRICE OPERATIONS
   * -------------------------*/
  async createProductPrice(data: { 
    product: string; 
    salesMethod: string; 
    price: number; 
    currencyUnit?: string;
    branch?: string;
    company?: string;
  }) {
    // Boş string'leri undefined yap
    const cleanData: any = {
      product: data.product,
      salesMethod: data.salesMethod,
      price: data.price
    };
    
    if (data.currencyUnit && data.currencyUnit.trim() !== '') {
      cleanData.currencyUnit = data.currencyUnit;
    }
    if (data.branch && data.branch.trim() !== '') {
      cleanData.branch = data.branch;
    }
    if (data.company && data.company.trim() !== '') {
      cleanData.company = data.company;
    }
    
    return await ProductPrice.create(cleanData);
  },

  async getProductPrices(productId: string) {
    return await ProductPrice.find({ product: productId })
      .populate("salesMethod")
      .populate("currencyUnit")
      .populate("branch")
      .populate("company")
      .sort({ createdAt: -1 });
  },

  async getPriceById(id: string) {
    return await ProductPrice.findById(id)
      .populate("product")
      .populate("salesMethod")
      .populate("currencyUnit")
      .populate("branch")
      .populate("company");
  },

  async updatePrice(id: string, data: { 
    salesMethod?: string; 
    amount?: number; 
    unit?: string; 
  }) {
    return await ProductPrice.findByIdAndUpdate(id, data, { new: true })
      .populate("product")
      .populate("salesMethod")
      .populate("unit");
  },

  async deletePrice(id: string) {
    return await ProductPrice.findByIdAndDelete(id);
  },

  /* ---------------------------
   *  BRANCH SALES METHOD OPERATIONS
   * -------------------------*/
  async assignSalesMethodToBranch(data: { 
    branch: string; 
    salesMethod: string; 
  }) {
    const exists = await BranchSalesMethod.findOne({
      branch: data.branch,
      salesMethod: data.salesMethod
    });
    
    if (exists) {
      throw new Error("Bu satış yöntemi zaten bu şubeye atanmış");
    }
    
    return await BranchSalesMethod.create(data);
  },

  async getBranchSalesMethods(branchId: string) {
    return await BranchSalesMethod.find({ branch: branchId, isActive: true })
      .populate("salesMethod")
      .sort({ createdAt: -1 });
  },

  async removeSalesMethodFromBranch(branchId: string, salesMethodId: string) {
    return await BranchSalesMethod.findOneAndDelete({
      branch: branchId,
      salesMethod: salesMethodId
    });
  },

  /* ---------------------------
   *  UTILITY OPERATIONS
   * -------------------------*/
  async getAmountUnits() {
    return await AmountUnit.find().sort({ name: 1 });
  },

  async createAmountUnit(data: { name: string }) {
    return await AmountUnit.create(data);
  },

  async updateAmountUnit(id: string, data: { name?: string }) {
    return await AmountUnit.findByIdAndUpdate(id, data, { new: true });
  },

  async deleteAmountUnit(id: string) {
    return await AmountUnit.findByIdAndDelete(id);
  },

  async getCurrencyUnits() {
    return await CurrencyUnit.find().sort({ name: 1 });
  },

  async createCurrencyUnit(data: { name: string }) {
    return await CurrencyUnit.create(data);
  },

  async updateCurrencyUnit(id: string, data: { name?: string }) {
    return await CurrencyUnit.findByIdAndUpdate(id, data, { new: true });
  },

  async deleteCurrencyUnit(id: string) {
    return await CurrencyUnit.findByIdAndDelete(id);
  },

  async getSalesMethods() {
    return await SalesMethod.find().populate('parent', 'name').sort({ name: 1 });
  },

  async getSalesMethodsHierarchy() {
    // Ana kategorileri (parent: null) getir
    const rootMethods = await SalesMethod.find({ parent: null }).populate('parent', 'name').sort({ name: 1 });
    
    // Her ana kategori için alt kategorileri getir
    const hierarchy = await Promise.all(
      rootMethods.map(async (rootMethod) => {
        const children = await SalesMethod.find({ parent: rootMethod._id }).populate('parent', 'name').sort({ name: 1 });
        return {
          ...rootMethod.toObject(),
          children
        };
      })
    );
    
    return hierarchy;
  },

  async createSalesMethod(data: { name: string; description?: string; parent?: string }) {
    return await SalesMethod.create(data);
  },

  async updateSalesMethod(id: string, data: { name?: string; description?: string; parent?: string }) {
    return await SalesMethod.findByIdAndUpdate(id, data, { new: true }).populate('parent', 'name');
  },

  async deleteSalesMethod(id: string) {
    // Önce alt kategorileri kontrol et
    const children = await SalesMethod.find({ parent: id });
    if (children.length > 0) {
      throw new Error('Bu satış yönteminin alt kategorileri bulunmaktadır. Önce alt kategorileri siliniz.');
    }
    return await SalesMethod.findByIdAndDelete(id);
  },

  async getSalesMethodById(id: string) {
    return await SalesMethod.findById(id).populate('parent', 'name');
  }
};
