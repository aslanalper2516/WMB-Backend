import { Hono } from "hono";
import { z } from "zod";
import { MenuService } from "./menuService";
import { authMiddleware } from "../AuthService/authMiddleware";
import { permissionMiddleware } from "../RolePermissionService/rolePermissionMiddlewares";

export const menuRoutes = new Hono();

/* ============================================================
 *  MENU ROUTES
 * ============================================================*/

/**
 * 📍 GET /menus
 * Menüleri listeler.
 * Sadece "menü listeleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.get(
  "/menus",
  authMiddleware,
  permissionMiddleware("kategori listeleme"),
  async (c) => {
    const companyId = c.req.query("company");
    const menus = await MenuService.getMenus(companyId);
    return c.json({ message: "Menus retrieved successfully", menus });
  }
);

/**
 * 📍 POST /menus
 * Yeni menü oluşturur.
 * Sadece "menü oluşturma" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.post(
  "/menus",
  authMiddleware,
  permissionMiddleware("kategori oluşturma"),
  async (c) => {
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      company: z.string(),
    });
    const input = schema.parse(body);

    const menu = await MenuService.createMenu(input);
    return c.json({ message: "Menu created successfully", menu });
  }
);

/**
 * 📍 GET /menus/:id
 * Belirli bir menünün detaylarını getirir.
 * Sadece "menü görüntüleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.get(
  "/menus/:id",
  authMiddleware,
  permissionMiddleware("kategori görüntüleme"),
  async (c) => {
    const { id } = c.req.param();
    const menu = await MenuService.getMenuById(id);
    return c.json({ message: "Menu retrieved successfully", menu });
  }
);

/**
 * 📍 PUT /menus/:id
 * Menü bilgilerini günceller.
 * Sadece "menü güncelleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.put(
  "/menus/:id",
  authMiddleware,
  permissionMiddleware("kategori güncelleme"),
  async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    });
    const input = schema.parse(body);

    const menu = await MenuService.updateMenu(id, input);
    return c.json({ message: "Menu updated successfully", menu });
  }
);

/**
 * 📍 DELETE /menus/:id
 * Menüyü siler.
 * Sadece "menü silme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.delete(
  "/menus/:id",
  authMiddleware,
  permissionMiddleware("kategori silme"),
  async (c) => {
    const { id } = c.req.param();
    await MenuService.deleteMenu(id);
    return c.json({ message: "Menu deleted successfully" });
  }
);

/**
 * 📍 GET /menus/:id/structure
 * Menünün tam yapısını getirir (kategoriler ve ürünleriyle birlikte).
 * Sadece "menü görüntüleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.get(
  "/menus/:id/structure",
  authMiddleware,
  permissionMiddleware("menü görüntüleme"),
  async (c) => {
    const { id } = c.req.param();
    const structure = await MenuService.getMenuStructure(id);
    return c.json({ message: "Menu structure retrieved successfully", structure });
  }
);

/* ============================================================
 *  MENU BRANCH ROUTES
 * ============================================================*/

/**
 * 📍 POST /menus/:id/branches
 * Menüyü şubeye atar.
 * Sadece "menü şube atama" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.post(
  "/menus/:id/branches",
  authMiddleware,
  permissionMiddleware("menü şube atama"),
  async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const schema = z.object({
      branch: z.string(),
    });
    const input = schema.parse(body);
    const assignmentData = { ...input, menu: id };

    const assignment = await MenuService.assignMenuToBranch(assignmentData);
    return c.json({ message: "Menu assigned to branch successfully", assignment });
  }
);

/**
 * 📍 GET /menus/:id/branches
 * Menünün atandığı şubeleri listeler.
 * Sadece "menü listeleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.get(
  "/menus/:id/branches",
  authMiddleware,
  permissionMiddleware("menü listeleme"),
  async (c) => {
    const { id } = c.req.param();
    const branches = await MenuService.getMenuBranches(id);
    return c.json({ message: "Menu branches retrieved successfully", menuBranches: branches });
  }
);

/**
 * 📍 DELETE /menus/:id/branches/:branchId
 * Menüyü şubeden çıkarır.
 * Sadece "menü şube atama" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.delete(
  "/menus/:id/branches/:branchId",
  authMiddleware,
  permissionMiddleware("menü şube atama"),
  async (c) => {
    const { id, branchId } = c.req.param();
    await MenuService.removeMenuFromBranch(id, branchId);
    return c.json({ message: "Menu removed from branch successfully" });
  }
);

/**
 * 📍 GET /branches/:id/menus
 * Şubenin menülerini listeler.
 * Sadece "menü listeleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.get(
  "/branches/:id/menus",
  authMiddleware,
  permissionMiddleware("menü listeleme"),
  async (c) => {
    const { id } = c.req.param();
    const menus = await MenuService.getBranchMenus(id);
    return c.json({ message: "Branch menus retrieved successfully", menus });
  }
);

/* ============================================================
 *  MENU CATEGORY ROUTES
 * ============================================================*/

/**
 * 📍 POST /menus/:id/categories
 * Menüye kategori ekler.
 * Sadece "menü kategori ekleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.post(
  "/menus/:id/categories",
  authMiddleware,
  permissionMiddleware("menü kategori ekleme"),
  async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const schema = z.object({
      category: z.string(),
      parent: z.string().optional(), // Alt kategori için parent MenuCategory ID'si
      order: z.number().optional(),
    });
    const input = schema.parse(body);
    const categoryData = { ...input, menu: id };

    const menuCategory = await MenuService.addCategoryToMenu(categoryData);
    return c.json({ message: "Category added to menu successfully", menuCategory });
  }
);

/**
 * 📍 GET /menus/:id/categories
 * Menünün kategorilerini listeler.
 * Sadece "menü listeleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.get(
  "/menus/:id/categories",
  authMiddleware,
  permissionMiddleware("menü listeleme"),
  async (c) => {
    const { id } = c.req.param();
    const categories = await MenuService.getMenuCategories(id);
    return c.json({ message: "Menu categories retrieved successfully", menuCategories: categories });
  }
);

/**
 * 📍 DELETE /menus/:id/categories/:categoryId
 * Menüden kategori çıkarır.
 * Sadece "menü kategori ekleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.delete(
  "/menus/:id/categories/:categoryId",
  authMiddleware,
  permissionMiddleware("menü kategori ekleme"),
  async (c) => {
    const { id, categoryId } = c.req.param();
    await MenuService.removeCategoryFromMenu(id, categoryId);
    return c.json({ message: "Category removed from menu successfully" });
  }
);

/**
 * 📍 PUT /menus/:id/categories/:categoryId/order
 * Kategorinin sırasını günceller.
 * Sadece "menü kategori ekleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.put(
  "/menus/:id/categories/:categoryId/order",
  authMiddleware,
  permissionMiddleware("menü kategori ekleme"),
  async (c) => {
    const { id, categoryId } = c.req.param();
    const body = await c.req.json();
    const schema = z.object({
      order: z.number(),
    });
    const input = schema.parse(body);

    const menuCategory = await MenuService.updateCategoryOrder(id, categoryId, input.order);
    return c.json({ message: "Category order updated successfully", menuCategory });
  }
);

/**
 * 📍 GET /menus/:id/categories/hierarchical
 * Menünün kategorilerini hiyerarşik yapıda listeler.
 * Sadece "menü listeleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.get(
  "/menus/:id/categories/hierarchical",
  authMiddleware,
  permissionMiddleware("menü listeleme"),
  async (c) => {
    const { id } = c.req.param();
    const categories = await MenuService.getMenuCategoriesHierarchical(id);
    return c.json({ message: "Menu categories retrieved successfully (hierarchical)", categories });
  }
);

/**
 * 📍 GET /menus/:id/available-categories
 * Menüye eklenebilecek kategorileri listeler.
 * Sadece "menü kategori ekleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.get(
  "/menus/:id/available-categories",
  authMiddleware,
  permissionMiddleware("menü kategori ekleme"),
  async (c) => {
    const { id } = c.req.param();
    const categories = await MenuService.getAvailableCategories(id);
    return c.json({ message: "Available categories retrieved successfully", categories });
  }
);

/* ============================================================
 *  MENU PRODUCT ROUTES
 * ============================================================*/

/**
 * 📍 POST /menus/:id/products
 * Menüye ürün ekler.
 * Sadece "menü ürün ekleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.post(
  "/menus/:id/products",
  authMiddleware,
  permissionMiddleware("menü ürün ekleme"),
  async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const schema = z.object({
      category: z.string(),
      product: z.string(),
      order: z.number().optional(),
    });
    const input = schema.parse(body);
    const productData = { ...input, menu: id };

    const menuProduct = await MenuService.addProductToMenu(productData);
    return c.json({ message: "Product added to menu successfully", menuProduct });
  }
);

/**
 * 📍 GET /menus/:id/products
 * Menünün ürünlerini listeler.
 * Sadece "menü listeleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.get(
  "/menus/:id/products",
  authMiddleware,
  permissionMiddleware("menü listeleme"),
  async (c) => {
    const { id } = c.req.param();
    const categoryId = c.req.query("category");
    const products = await MenuService.getMenuProducts(id, categoryId);
    return c.json({ message: "Menu products retrieved successfully", menuProducts: products });
  }
);

/**
 * 📍 GET /menus/:id/categories/:categoryId/products
 * Menüdeki belirli kategorinin ürünlerini listeler.
 * Sadece "menü listeleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.get(
  "/menus/:id/categories/:categoryId/products",
  authMiddleware,
  permissionMiddleware("menü listeleme"),
  async (c) => {
    const { id, categoryId } = c.req.param();
    const products = await MenuService.getCategoryProducts(id, categoryId);
    return c.json({ message: "Category products retrieved successfully", products });
  }
);

/**
 * 📍 DELETE /menus/:id/products/:productId
 * Menüden ürün çıkarır.
 * Sadece "menü ürün ekleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.delete(
  "/menus/:id/products/:productId",
  authMiddleware,
  permissionMiddleware("menü ürün ekleme"),
  async (c) => {
    const { id, productId } = c.req.param();
    const categoryId = c.req.query("category");
    if (!categoryId) {
      return c.json({ error: "Category parameter is required" }, 400);
    }
    
    await MenuService.removeProductFromMenu(id, categoryId, productId);
    return c.json({ message: "Product removed from menu successfully" });
  }
);

/**
 * 📍 PUT /menus/:id/products/:productId/order
 * Ürünün sırasını günceller.
 * Sadece "menü ürün ekleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.put(
  "/menus/:id/products/:productId/order",
  authMiddleware,
  permissionMiddleware("menü ürün ekleme"),
  async (c) => {
    const { id, productId } = c.req.param();
    const categoryId = c.req.query("category");
    if (!categoryId) {
      return c.json({ error: "Category parameter is required" }, 400);
    }
    
    const body = await c.req.json();
    const schema = z.object({
      order: z.number(),
    });
    const input = schema.parse(body);

    const menuProduct = await MenuService.updateProductOrder(id, categoryId, productId, input.order);
    return c.json({ message: "Product order updated successfully", menuProduct });
  }
);

/**
 * 📍 GET /menus/:id/available-products
 * Menüye eklenebilecek ürünleri listeler.
 * Sadece "menü ürün ekleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.get(
  "/menus/:id/available-products",
  authMiddleware,
  permissionMiddleware("menü ürün ekleme"),
  async (c) => {
    const { id } = c.req.param();
    const categoryId = c.req.query("category");
    if (!categoryId) {
      return c.json({ error: "Category parameter is required" }, 400);
    }
    
    const products = await MenuService.getAvailableProducts(id, categoryId);
    return c.json({ message: "Available products retrieved successfully", products });
  }
);

/* ============================================================
 *  PRODUCT KITCHEN ROUTES
 * ============================================================*/

/**
 * 📍 POST /products/:id/kitchens
 * Ürünü mutfağa atar.
 * Sadece "ürün mutfak atama" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.post(
  "/products/:id/kitchens",
  authMiddleware,
  permissionMiddleware("ürün mutfak atama"),
  async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const schema = z.object({
      kitchen: z.string(),
      branch: z.string(),
    });
    const input = schema.parse(body);
    const assignmentData = { ...input, product: id };

    const assignment = await MenuService.assignProductToKitchen(assignmentData);
    return c.json({ message: "Product assigned to kitchen successfully", assignment });
  }
);

/**
 * 📍 GET /products/:id/kitchens
 * Ürünün atandığı mutfakları listeler.
 * Sadece "ürün listeleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.get(
  "/products/:id/kitchens",
  authMiddleware,
  permissionMiddleware("ürün listeleme"),
  async (c) => {
    const { id } = c.req.param();
    const branchId = c.req.query("branch");
    const kitchens = await MenuService.getProductKitchens(id, branchId);
    return c.json({ message: "Product kitchens retrieved successfully", kitchens });
  }
);

/**
 * 📍 DELETE /products/:id/kitchens/:kitchenId
 * Ürünü mutfaktan çıkarır.
 * Sadece "ürün mutfak atama" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.delete(
  "/products/:id/kitchens/:kitchenId",
  authMiddleware,
  permissionMiddleware("ürün mutfak atama"),
  async (c) => {
    const { id, kitchenId } = c.req.param();
    const branchId = c.req.query("branch");
    if (!branchId) {
      return c.json({ error: "Branch parameter is required" }, 400);
    }
    
    await MenuService.removeProductFromKitchen(id, kitchenId, branchId);
    return c.json({ message: "Product removed from kitchen successfully" });
  }
);

/**
 * 📍 GET /kitchens/:id/products
 * Mutfağın ürünlerini listeler.
 * Sadece "mutfak listeleme" iznine sahip kullanıcılar erişebilir.
 */
menuRoutes.get(
  "/kitchens/:id/products",
  authMiddleware,
  permissionMiddleware("mutfak listeleme"),
  async (c) => {
    const { id } = c.req.param();
    const products = await MenuService.getKitchenProducts(id);
    return c.json({ message: "Kitchen products retrieved successfully", products });
  }
);

export default menuRoutes;
