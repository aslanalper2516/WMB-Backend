import { Menu } from "./models/menu";
import { MenuBranch } from "./models/menuBranch";
import { MenuCategory } from "./models/menuCategory";
import { MenuProduct } from "./models/menuProduct";
import { ProductKitchen } from "./models/productKitchen";
import { Category } from "./models/category";
import { Product } from "./models/product";
import { Kitchen } from "./models/kitchen";
import { Branch } from "../../CompanyBranchService/models/branch";

export const MenuService = {
  /* ---------------------------
   *  MENU OPERATIONS
   * -------------------------*/
  async createMenu(data: { 
    name: string; 
    description?: string; 
    company: string; 
  }) {
    // Boş string'leri kontrol et
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
    // Boş string'leri kontrol et
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
    // Menüye ait tüm ilişkileri sil
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
    parent?: string; // Alt kategori için parent MenuCategory ID'si
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
    // Tüm kategorileri getir
    const allCategories = await MenuCategory.find({ menu: menuId, isActive: true })
      .populate("category")
      .populate("parent")
      .sort({ order: 1, createdAt: 1 });

    // Ana kategorileri (parent'ı null olanlar) bul
    const rootCategories = allCategories.filter(cat => !cat.parent);
    
    // Alt kategorileri ana kategorilere ekle
    const buildHierarchy = (parentId: string) => {
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
    // Önce bu kategoriye ait alt kategorileri bul ve sil
    const subCategories = await MenuCategory.find({ 
      menu: menuId, 
      parent: categoryId 
    });
    
    for (const subCategory of subCategories) {
      await this.removeCategoryFromMenu(menuId, subCategory._id.toString());
    }
    
    // Kategoriyi menüden çıkar
    await MenuCategory.findOneAndDelete({
      menu: menuId,
      category: categoryId
    });
    
    // Bu kategoriye ait ürünleri de menüden çıkar
    await MenuProduct.deleteMany({
      menu: menuId,
      category: categoryId
    });
    
    return { message: "Category removed from menu successfully" };
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
    // Önce menüde bu kategori var mı kontrol et
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
   *  UTILITY OPERATIONS
   * -------------------------*/
  async getAvailableCategories(menuId: string) {
    // Menüde olmayan kategorileri getir
    const menuCategories = await MenuCategory.find({ menu: menuId }).select("category");
    const usedCategoryIds = menuCategories.map(mc => mc.category);
    
    return await Category.find({ 
      _id: { $nin: usedCategoryIds },
      isActive: true 
    }).sort({ name: 1 });
  },

  async getAvailableProducts(menuId: string, categoryId: string) {
    // Bu kategoride olmayan ürünleri getir
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
    // Menünün tam yapısını getir (kategoriler ve ürünleriyle birlikte)
    const menu = await Menu.findById(menuId).populate("company");
    const categories = await this.getMenuCategoriesHierarchical(menuId);
    
    const categoriesWithProducts = await Promise.all(
      categories.map(async (menuCategory) => {
        const products = await this.getCategoryProducts(menuId, menuCategory.category._id.toString());
        
        // Alt kategorileri de işle
        const processChildren = async (children: any[]) => {
          return await Promise.all(
            children.map(async (child) => {
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
    };
  }
};
