import { Category } from "./models/category";
import { Product } from "./models/product";
import { Kitchen } from "./models/kitchen";
import { Menu } from "./models/menu";
import { MenuBranch } from "./models/menuBranch";
import { MenuCategory } from "./models/menuCategory";
import { MenuProduct } from "./models/menuProduct";
import { ProductKitchen } from "./models/productKitchen";
import { ProductIngredients } from "./models/productIngredients";
import { ProductPrice } from "./models/productPrice";
import { BranchSalesMethod } from "./models/branchSalesMethod";
import { SalesMethod } from "./models/salesMethod";
import { SalesMethodCategory } from "./models/salesMethodCategory";
import { AmountUnit } from "./models/amountUnit";
import { CurrencyUnit } from "./models/currencyUnit";
import { Branch } from "../CompanyBranchService/models/branch";

export const CategoryProductService = {
  /* ---------------------------
   *  CATEGORY OPERATIONS
   * -------------------------*/
  async createCategory(data: { 
    name: string; 
    description?: string;
    company: string;
  }) {
    const cleanData: any = {
      name: data.name,
      company: data.company
    };
    if (data.description && data.description.trim() !== '') {
      cleanData.description = data.description;
    }
    return await Category.create(cleanData);
  },

  async getCategories(companyId?: string) {
    const query: any = {};
    if (companyId) query.company = companyId;
    return await Category.find(query)
      .populate('company')
      .sort({ name: 1 });
  },

  async getCategoryById(id: string) {
    return await Category.findById(id).populate('company');
  },

  async updateCategory(id: string, data: { 
    name?: string; 
    description?: string;
    isActive?: boolean;
    company?: string;
  }) {
    const cleanData: any = {};
    if (data.name !== undefined) cleanData.name = data.name;
    if (data.isActive !== undefined) cleanData.isActive = data.isActive;
    if (data.company !== undefined) cleanData.company = data.company;
    if (data.description !== undefined) {
      if (data.description && data.description.trim() !== '') {
        cleanData.description = data.description;
      } else {
        cleanData.description = undefined;
      }
    }
    return await Category.findByIdAndUpdate(id, cleanData, { new: true }).populate('company');
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
    company: string;
  }) {
    // Boş string'leri kontrol et
    const cleanData: any = {
      name: data.name,
      defaultSalesMethod: data.defaultSalesMethod,
      company: data.company
    };
    
    if (data.description && data.description.trim() !== '') {
      cleanData.description = data.description;
    }
    
    return await Product.create(cleanData);
  },

  async getProducts(companyId?: string) {
    const query: any = {};
    if (companyId) query.company = companyId;
    return await Product.find(query)
      .populate("defaultSalesMethod")
      .populate("company")
      .sort({ name: 1 });
  },

  async getProductById(id: string) {
    return await Product.findById(id)
      .populate("defaultSalesMethod")
      .populate("company");
  },

  async updateProduct(id: string, data: { 
    name?: string; 
    description?: string;
    defaultSalesMethod?: string;
    isActive?: boolean; 
    company?: string;
  }) {
    // Boş string'leri kontrol et
    const cleanData: any = {};
    
    if (data.name !== undefined) cleanData.name = data.name;
    if (data.isActive !== undefined) cleanData.isActive = data.isActive;
    if (data.defaultSalesMethod !== undefined) cleanData.defaultSalesMethod = data.defaultSalesMethod;
    if (data.company !== undefined) cleanData.company = data.company;
    
    if (data.description !== undefined) {
      if (data.description && data.description.trim() !== '') {
        cleanData.description = data.description;
      } else {
        cleanData.description = undefined;
      }
    }
    
    return await Product.findByIdAndUpdate(id, cleanData, { new: true })
      .populate("defaultSalesMethod")
      .populate("company");
  },

  async toggleProductActive(id: string) {
    const product = await Product.findById(id);
    if (!product) throw new Error("Product not found");
    
    return await Product.findByIdAndUpdate(id, { isActive: !product.isActive }, { new: true })
      .populate("defaultSalesMethod")
      .populate("company");
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
    // Şube-şirket uyum kontrolü
    const branch = await Branch.findById(data.branch);
    if (!branch) {
      throw new Error("Şube bulunamadı");
    }
    if (branch.company.toString() !== data.company) {
      throw new Error("Seçilen şube, belirtilen şirkete ait değil");
    }
    
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

  async updateKitchen(id: string, data: { name?: string; isActive?: boolean }) {
    const update: any = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.isActive !== undefined) update.isActive = data.isActive;
    return await Kitchen.findByIdAndUpdate(id, update, { new: true })
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
    currencyUnit: string;
    branch: string;
    company?: string;
  }) {
    // Şube-şirket uyum kontrolü
    const branch = await Branch.findById(data.branch);
    if (!branch) {
      throw new Error("Şube bulunamadı");
    }
    
    // Eğer company belirtilmişse, şube ile uyumlu olmalı
    if (data.company && data.company.trim() !== '') {
      if (branch.company.toString() !== data.company) {
        throw new Error("Seçilen şube, belirtilen şirkete ait değil");
      }
    }
    
    // Satış yönteminin bu şubeye atanmış olup olmadığı kontrolü
    const branchSalesMethod = await BranchSalesMethod.findOne({
      branch: data.branch,
      salesMethod: data.salesMethod,
      isActive: true
    });
    
    if (!branchSalesMethod) {
      throw new Error("Bu satış yöntemi bu şubeye atanmamış");
    }
    
    // Aynı ürün + satış yöntemi + şube kombinasyonu kontrolü
    const existing = await ProductPrice.findOne({
      product: data.product,
      salesMethod: data.salesMethod,
      branch: data.branch
    });
    
    if (existing) {
      throw new Error("Bu ürün için bu satış yöntemi ve şube kombinasyonunda zaten bir fiyat tanımlı");
    }
    
    // Boş string'leri undefined yap
    const cleanData: any = {
      product: data.product,
      salesMethod: data.salesMethod,
      price: data.price,
      currencyUnit: data.currencyUnit,
      branch: data.branch
    };
    
    // Company bilgisini şube'den al (belirtilmemişse)
    if (!data.company || data.company.trim() === '') {
      cleanData.company = branch.company;
    } else {
      cleanData.company = data.company;
    }
    
    return await ProductPrice.create(cleanData);
  },

  async getProductPrices(productId: string, branchId?: string) {
    const query: any = { product: productId };
    
    // Eğer branch belirtilmişse, o şubeye özel fiyatları getir
    if (branchId) {
      query.branch = branchId;
    }
    
    return await ProductPrice.find(query)
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
    price?: number; 
    currencyUnit?: string;
    branch?: string;
  }) {
    // Eğer branch değiştiriliyorsa, şube-company uyum kontrolü
    if (data.branch !== undefined && data.branch.trim() !== '') {
      const branch = await Branch.findById(data.branch);
      if (!branch) {
        throw new Error("Şube bulunamadı");
      }
      
      // Mevcut fiyat kaydını al
      const existingPrice = await ProductPrice.findById(id);
      if (!existingPrice) {
        throw new Error("Fiyat kaydı bulunamadı");
      }
      
      // Eğer company belirtilmişse, şube ile uyumlu olmalı
      if (existingPrice.company) {
        if (branch.company.toString() !== existingPrice.company.toString()) {
          throw new Error("Seçilen şube, fiyatın şirketine ait değil");
        }
      }
    }
    
    const update: any = {};
    if (data.salesMethod) update.salesMethod = data.salesMethod;
    if (typeof data.price === 'number') update.price = data.price;
    if (data.currencyUnit) update.currencyUnit = data.currencyUnit;
    if (data.branch !== undefined && data.branch.trim() !== '') {
      update.branch = data.branch;
    }

    return await ProductPrice.findByIdAndUpdate(id, update, { new: true })
      .populate("product")
      .populate("salesMethod")
      .populate("currencyUnit")
      .populate("branch")
      .populate("company");
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

  /* ---------------------------
   *  SALES METHOD CATEGORY OPERATIONS
   * -------------------------*/
  async getSalesMethodCategories() {
    return await SalesMethodCategory.find().sort({ name: 1 });
  },

  async getSalesMethodCategoryById(id: string) {
    return await SalesMethodCategory.findById(id);
  },

  async createSalesMethodCategory(data: { name: string; description?: string }) {
    return await SalesMethodCategory.create(data);
  },

  async updateSalesMethodCategory(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
    return await SalesMethodCategory.findByIdAndUpdate(id, data, { new: true });
  },

  async deleteSalesMethodCategory(id: string) {
    // Önce bu kategoriye ait satış yöntemlerini kontrol et
    const salesMethods = await SalesMethod.find({ category: id });
    if (salesMethods.length > 0) {
      throw new Error('Bu kategoriye ait satış yöntemleri bulunmaktadır. Önce satış yöntemlerini siliniz.');
    }
    return await SalesMethodCategory.findByIdAndDelete(id);
  },

  async getCategorySalesMethods(categoryId: string) {
    return await SalesMethod.find({ category: categoryId })
      .populate('category', 'name')
      .sort({ name: 1 });
  },

  /* ---------------------------
   *  SALES METHOD OPERATIONS
   * -------------------------*/
  async getSalesMethods(categoryId?: string) {
    const query: any = { isActive: true };
    if (categoryId) query.category = categoryId;
    return await SalesMethod.find(query)
      .populate('category', 'name')
      .sort({ name: 1 });
  },

  async createSalesMethod(data: { name: string; description?: string; category: string }) {
    return await SalesMethod.create(data);
  },

  async updateSalesMethod(id: string, data: { name?: string; description?: string; category?: string; isActive?: boolean }) {
    return await SalesMethod.findByIdAndUpdate(id, data, { new: true })
      .populate('category', 'name');
  },

  async deleteSalesMethod(id: string) {
    // Şubeye atanmış mı kontrol et
    const branchAssignment = await BranchSalesMethod.findOne({ salesMethod: id });
    if (branchAssignment) {
      throw new Error('Bu satış yöntemi bir veya daha fazla şubeye atanmış. Önce şubelerden çıkarınız.');
    }
    return await SalesMethod.findByIdAndDelete(id);
  },

  async getSalesMethodById(id: string) {
    return await SalesMethod.findById(id).populate('category', 'name');
  },

  /* ---------------------------
   *  BRANCH SALES METHOD OPERATIONS (BULK)
   * -------------------------*/
  async assignSalesMethodsToBranch(data: {
    branch: string;
    salesMethods: string[]; // Array of sales method IDs
  }) {
    const results = [];
    const errors = [];

    for (const salesMethodId of data.salesMethods) {
      try {
        const exists = await BranchSalesMethod.findOne({
          branch: data.branch,
          salesMethod: salesMethodId
        });

        if (!exists) {
          const assignment = await BranchSalesMethod.create({
            branch: data.branch,
            salesMethod: salesMethodId
          });
          results.push(assignment);
        }
      } catch (error: any) {
        errors.push({ salesMethodId, error: error.message });
      }
    }

    return { results, errors };
  },

  /* ---------------------------
   *  MENU OPERATIONS
   * -------------------------*/
  async createMenu(data: { 
    name: string; 
    description?: string; 
    company: string; 
  }) {
    const cleanData: any = {
      name: data.name,
      company: data.company
    };
    if (data.description && data.description.trim() !== '') {
      cleanData.description = data.description;
    }
    return await Menu.create(cleanData);
  },

  async getMenus(companyId?: string) {
    const query: any = {};
    if (companyId) query.company = companyId;
    return await Menu.find(query)
      .populate("company")
      .sort({ name: 1 });
  },

  async getMenuById(id: string) {
    return await Menu.findById(id)
      .populate("company");
  },

  async updateMenu(id: string, data: { 
    name?: string; 
    description?: string; 
    isActive?: boolean;
  }) {
    const cleanData: any = {};
    if (data.name !== undefined) cleanData.name = data.name;
    if (data.isActive !== undefined) cleanData.isActive = data.isActive;
    if (data.description !== undefined) {
      if (data.description && data.description.trim() !== '') {
        cleanData.description = data.description;
      } else {
        cleanData.description = undefined;
      }
    }
    return await Menu.findByIdAndUpdate(id, cleanData, { new: true })
      .populate("company");
  },

  async deleteMenu(id: string) {
    await MenuBranch.deleteMany({ menu: id });
    await MenuCategory.deleteMany({ menu: id });
    await MenuProduct.deleteMany({ menu: id });
    return await Menu.findByIdAndDelete(id);
  },

  /* ---------------------------
   *  MENU BRANCH OPERATIONS
   * -------------------------*/
  async assignMenuToBranch(data: { 
    menu: string; 
    branch: string; 
  }) {
    // Menü-şube şirket uyum kontrolü
    const menu = await Menu.findById(data.menu);
    const branch = await Branch.findById(data.branch);
    
    if (!menu) {
      throw new Error("Menü bulunamadı");
    }
    if (!branch) {
      throw new Error("Şube bulunamadı");
    }
    
    if (menu.company.toString() !== branch.company.toString()) {
      throw new Error("Seçilen menü ve şube aynı şirkete ait değil");
    }
    
    const exists = await MenuBranch.findOne({
      menu: data.menu,
      branch: data.branch
    });
    if (exists) {
      throw new Error("Bu menü zaten bu şubeye atanmış");
    }
    return await MenuBranch.create(data);
  },

  async getMenuBranches(menuId: string) {
    return await MenuBranch.find({ menu: menuId, isActive: true })
      .populate("branch")
      .sort({ createdAt: -1 });
  },

  async getBranchMenus(branchId: string) {
    return await MenuBranch.find({ branch: branchId, isActive: true })
      .populate("menu")
      .populate("branch")
      .sort({ createdAt: -1 });
  },

  async removeMenuFromBranch(menuId: string, branchId: string) {
    return await MenuBranch.findOneAndDelete({
      menu: menuId,
      branch: branchId
    });
  },

  /* ---------------------------
   *  MENU CATEGORY OPERATIONS
   * -------------------------*/
  async addCategoryToMenu(data: { 
    menu: string; 
    category: string; 
    parent?: string; 
    order?: number;
  }) {
    const exists = await MenuCategory.findOne({
      menu: data.menu,
      category: data.category
    });
    if (exists) {
      throw new Error("Bu kategori zaten bu menüye eklenmiş");
    }
    return await MenuCategory.create(data);
  },

  async getMenuCategories(menuId: string) {
    return await MenuCategory.find({ menu: menuId, isActive: true })
      .populate("category")
      .populate("parent")
      .sort({ order: 1, createdAt: 1 });
  },

  async getMenuCategoriesHierarchical(menuId: string) {
    const allCategories = await MenuCategory.find({ menu: menuId, isActive: true })
      .populate("category")
      .populate("parent")
      .sort({ order: 1, createdAt: 1 });
    const rootCategories = allCategories.filter(cat => !cat.parent);
    const buildHierarchy = (parentId: string): any[] => {
      return allCategories
        .filter(cat => cat.parent && cat.parent._id.toString() === parentId)
        .map(cat => ({
          ...cat.toObject(),
          children: buildHierarchy(cat._id.toString())
        }));
    };
    return rootCategories.map(cat => ({
      ...cat.toObject(),
      children: buildHierarchy(cat._id.toString())
    }));
  },

  async removeCategoryFromMenu(menuId: string, categoryId: string) {
    const subCategories = await MenuCategory.find({ 
      menu: menuId, 
      parent: categoryId 
    });
    for (const subCategory of subCategories) {
      await this.removeCategoryFromMenu(menuId, subCategory._id.toString());
    }
    await MenuCategory.findOneAndDelete({
      menu: menuId,
      category: categoryId
    });
    await MenuProduct.deleteMany({
      menu: menuId,
      category: categoryId
    });
    return { message: "Category removed from menu successfully" } as any;
  },

  async updateCategoryOrder(menuId: string, categoryId: string, order: number) {
    return await MenuCategory.findOneAndUpdate(
      { menu: menuId, category: categoryId },
      { order },
      { new: true }
    );
  },

  /* ---------------------------
   *  MENU PRODUCT OPERATIONS
   * -------------------------*/
  async addProductToMenu(data: { 
    menu: string; 
    category: string; 
    product: string; 
    order?: number;
  }) {
    const menuCategory = await MenuCategory.findOne({
      menu: data.menu,
      category: data.category
    });
    if (!menuCategory) {
      throw new Error("Bu kategori menüde bulunmuyor");
    }
    const exists = await MenuProduct.findOne({
      menu: data.menu,
      category: data.category,
      product: data.product
    });
    if (exists) {
      throw new Error("Bu ürün zaten bu kategoride eklenmiş");
    }
    return await MenuProduct.create(data);
  },

  async getMenuProducts(menuId: string, categoryId?: string) {
    const query: any = { menu: menuId, isActive: true };
    if (categoryId) query.category = categoryId;
    return await MenuProduct.find(query)
      .populate("product")
      .populate("category")
      .sort({ order: 1, createdAt: 1 });
  },

  async getCategoryProducts(menuId: string, categoryId: string) {
    return await MenuProduct.find({ 
      menu: menuId, 
      category: categoryId, 
      isActive: true 
    })
      .populate("product")
      .sort({ order: 1, createdAt: 1 });
  },

  async removeProductFromMenu(menuId: string, categoryId: string, productId: string) {
    return await MenuProduct.findOneAndDelete({
      menu: menuId,
      category: categoryId,
      product: productId
    });
  },

  async updateProductOrder(menuId: string, categoryId: string, productId: string, order: number) {
    return await MenuProduct.findOneAndUpdate(
      { menu: menuId, category: categoryId, product: productId },
      { order },
      { new: true }
    );
  },

  /* ---------------------------
   *  PRODUCT KITCHEN OPERATIONS
   * -------------------------*/
  async assignProductToKitchen(data: { 
    product: string; 
    kitchen: string; 
    branch: string; 
  }) {
    // Mutfak-şube şirket uyum kontrolü
    const kitchen = await Kitchen.findById(data.kitchen);
    const branch = await Branch.findById(data.branch);
    
    if (!kitchen) {
      throw new Error("Mutfak bulunamadı");
    }
    if (!branch) {
      throw new Error("Şube bulunamadı");
    }
    
    // Mutfak ve şube aynı şirkete ait olmalı
    if (kitchen.company.toString() !== branch.company.toString()) {
      throw new Error("Seçilen mutfak ve şube aynı şirkete ait değil");
    }
    
    // Mutfak ve şube eşleşmeli
    if (kitchen.branch.toString() !== branch._id.toString()) {
      throw new Error("Seçilen mutfak, belirtilen şubeye ait değil");
    }
    
    const exists = await ProductKitchen.findOne({
      product: data.product,
      kitchen: data.kitchen,
      branch: data.branch
    });
    if (exists) {
      throw new Error("Bu ürün zaten bu mutfağa atanmış");
    }
    return await ProductKitchen.create(data);
  },

  async getProductKitchens(productId: string, branchId?: string) {
    const query: any = { product: productId, isActive: true };
    if (branchId) query.branch = branchId;
    return await ProductKitchen.find(query)
      .populate("kitchen")
      .populate("branch")
      .sort({ createdAt: -1 });
  },

  async getKitchenProducts(kitchenId: string) {
    return await ProductKitchen.find({ kitchen: kitchenId, isActive: true })
      .populate("product")
      .populate("kitchen")
      .populate("branch")
      .sort({ createdAt: -1 });
  },

  async removeProductFromKitchen(productId: string, kitchenId: string, branchId: string) {
    return await ProductKitchen.findOneAndDelete({
      product: productId,
      kitchen: kitchenId,
      branch: branchId
    });
  },

  /* ---------------------------
   *  MENU UTILITIES
   * -------------------------*/
  async getAvailableCategories(menuId: string) {
    // Menü şirketi ile aynı şirkette olup menüde kullanılmamış kategorileri döndür
    const menu = await Menu.findById(menuId).select('company');
    const menuCategories = await MenuCategory.find({ menu: menuId }).select("category");
    const usedCategoryIds = menuCategories.map(mc => mc.category);
    const query: any = {
      _id: { $nin: usedCategoryIds },
      isActive: true
    };
    if (menu?.company) {
      query.company = menu.company;
    }
    return await Category.find(query).sort({ name: 1 });
  },

  async getAvailableProducts(menuId: string, categoryId: string) {
    const menuProducts = await MenuProduct.find({ 
      menu: menuId, 
      category: categoryId 
    }).select("product");
    const usedProductIds = menuProducts.map(mp => mp.product);
    return await Product.find({ 
      _id: { $nin: usedProductIds },
      isActive: true 
    }).sort({ name: 1 });
  },

  async getMenuStructure(menuId: string) {
    const menu = await Menu.findById(menuId).populate("company");
    const categories = await this.getMenuCategoriesHierarchical(menuId);
    const categoriesWithProducts = await Promise.all(
      categories.map(async (menuCategory: any) => {
        const products = await this.getCategoryProducts(menuId, menuCategory.category._id.toString());
        const processChildren = async (children: any[]): Promise<any[]> => {
          return await Promise.all(
            children.map(async (child: any) => {
              const childProducts = await this.getCategoryProducts(menuId, child.category._id.toString());
              return {
                ...child,
                products: childProducts,
                children: child.children ? await processChildren(child.children) : []
              };
            })
          );
        };
        return {
          ...menuCategory,
          products,
          children: menuCategory.children ? await processChildren(menuCategory.children) : []
        };
      })
    );
    return {
      menu,
      categories: categoriesWithProducts
    } as any;
  }
};
