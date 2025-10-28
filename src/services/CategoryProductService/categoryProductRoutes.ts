import { Hono } from "hono";
import { z } from "zod";
import { CategoryProductService } from "./categoryProductService";
import { authMiddleware } from "../AuthService/authMiddleware";
import { permissionMiddleware } from "../RolePermissionService/rolePermissionMiddlewares";

export const categoryProductRoutes = new Hono();

/* ============================================================
 *  CATEGORY ROUTES
 * ============================================================*/

/**
 * 📍 GET /categories
 * Kategorileri listeler.
 * Sadece "kategori listeleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.get(
  "/categories",
  authMiddleware,
  permissionMiddleware("kategori listeleme"),
  async (c) => {
    const categories = await CategoryProductService.getCategories();
    return c.json({ message: "Categories retrieved successfully", categories });
  }
);

/**
 * 📍 POST /categories
 * Yeni kategori oluşturur.
 * Sadece "kategori oluşturma" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.post(
  "/categories",
  authMiddleware,
  permissionMiddleware("kategori oluşturma"),
  async (c) => {
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    });
    const input = schema.parse(body);

    const category = await CategoryProductService.createCategory(input);
    return c.json({ message: "Category created successfully", category });
  }
);

/**
 * 📍 GET /categories/:id
 * Belirli bir kategorinin detaylarını getirir.
 * Sadece "kategori görüntüleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.get(
  "/categories/:id",
  authMiddleware,
  permissionMiddleware("kategori görüntüleme"),
  async (c) => {
    const { id } = c.req.param();
    const category = await CategoryProductService.getCategoryById(id);
    return c.json({ message: "Category retrieved successfully", category });
  }
);

/**
 * 📍 PUT /categories/:id
 * Kategori bilgilerini günceller.
 * Sadece "kategori güncelleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.put(
  "/categories/:id",
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

    const category = await CategoryProductService.updateCategory(id, input);
    return c.json({ message: "Category updated successfully", category });
  }
);

/**
 * 📍 DELETE /categories/:id
 * Kategoriyi siler (alt kategorileri de siler).
 * Sadece "kategori silme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.delete(
  "/categories/:id",
  authMiddleware,
  permissionMiddleware("kategori silme"),
  async (c) => {
    const { id } = c.req.param();
    await CategoryProductService.deleteCategory(id);
    return c.json({ message: "Category deleted successfully" });
  }
);

/* ============================================================
 *  PRODUCT ROUTES
 * ============================================================*/

/**
 * 📍 GET /products
 * Ürünleri listeler.
 * Sadece "ürün listeleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.get(
  "/products",
  authMiddleware,
  permissionMiddleware("ürün listeleme"),
  async (c) => {
    const products = await CategoryProductService.getProducts();
    return c.json({ message: "Products retrieved successfully", products });
  }
);

/**
 * 📍 POST /products
 * Yeni ürün oluşturur.
 * Sadece "ürün oluşturma" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.post(
  "/products",
  authMiddleware,
  permissionMiddleware("ürün oluşturma"),
  async (c) => {
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      defaultSalesMethod: z.string(),
    });
    const input = schema.parse(body);

    const product = await CategoryProductService.createProduct(input);
    return c.json({ message: "Product created successfully", product });
  }
);

/**
 * 📍 GET /products/:id
 * Belirli bir ürünün detaylarını getirir.
 * Sadece "ürün görüntüleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.get(
  "/products/:id",
  authMiddleware,
  permissionMiddleware("ürün görüntüleme"),
  async (c) => {
    const { id } = c.req.param();
    const product = await CategoryProductService.getProductById(id);
    return c.json({ message: "Product retrieved successfully", product });
  }
);

/**
 * 📍 PUT /products/:id
 * Ürün bilgilerini günceller.
 * Sadece "ürün güncelleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.put(
  "/products/:id",
  authMiddleware,
  permissionMiddleware("ürün güncelleme"),
  async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      defaultSalesMethod: z.string().optional(),
      isActive: z.boolean().optional(),
    });
    const input = schema.parse(body);

    const product = await CategoryProductService.updateProduct(id, input);
    return c.json({ message: "Product updated successfully", product });
  }
);

/**
 * 📍 PATCH /products/:id/active
 * Ürünün aktif/pasif durumunu değiştirir.
 * Sadece "ürün güncelleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.patch(
  "/products/:id/active",
  authMiddleware,
  permissionMiddleware("ürün güncelleme"),
  async (c) => {
    const { id } = c.req.param();
    const product = await CategoryProductService.toggleProductActive(id);
    return c.json({ message: "Product active status toggled successfully", product });
  }
);

/**
 * 📍 DELETE /products/:id
 * Ürünü siler.
 * Sadece "ürün silme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.delete(
  "/products/:id",
  authMiddleware,
  permissionMiddleware("ürün silme"),
  async (c) => {
    const { id } = c.req.param();
    await CategoryProductService.deleteProduct(id);
    return c.json({ message: "Product deleted successfully" });
  }
);

/* ============================================================
 *  KITCHEN ROUTES
 * ============================================================*/

/**
 * 📍 GET /kitchens
 * Mutfakları listeler.
 * Sadece "mutfak listeleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.get(
  "/kitchens",
  authMiddleware,
  permissionMiddleware("mutfak listeleme"),
  async (c) => {
    const branchId = c.req.query("branch");
    const companyId = c.req.query("company");
    const kitchens = await CategoryProductService.getKitchens(branchId, companyId);
    return c.json({ message: "Kitchens retrieved successfully", kitchens });
  }
);

/**
 * 📍 POST /kitchens
 * Yeni mutfak oluşturur.
 * Sadece "mutfak oluşturma" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.post(
  "/kitchens",
  authMiddleware,
  permissionMiddleware("mutfak oluşturma"),
  async (c) => {
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().min(1),
      company: z.string(),
      branch: z.string(),
    });
    const input = schema.parse(body);

    const kitchen = await CategoryProductService.createKitchen(input);
    return c.json({ message: "Kitchen created successfully", kitchen });
  }
);

/**
 * 📍 GET /kitchens/:id
 * Belirli bir mutfağın detaylarını getirir.
 * Sadece "mutfak listeleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.get(
  "/kitchens/:id",
  authMiddleware,
  permissionMiddleware("mutfak listeleme"),
  async (c) => {
    const { id } = c.req.param();
    const kitchen = await CategoryProductService.getKitchenById(id);
    return c.json({ message: "Kitchen retrieved successfully", kitchen });
  }
);

/**
 * 📍 PUT /kitchens/:id
 * Mutfak bilgilerini günceller.
 * Sadece "mutfak güncelleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.put(
  "/kitchens/:id",
  authMiddleware,
  permissionMiddleware("mutfak güncelleme"),
  async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().optional(),
    });
    const input = schema.parse(body);

    const kitchen = await CategoryProductService.updateKitchen(id, input);
    return c.json({ message: "Kitchen updated successfully", kitchen });
  }
);

/**
 * 📍 DELETE /kitchens/:id
 * Mutfağı siler.
 * Sadece "mutfak silme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.delete(
  "/kitchens/:id",
  authMiddleware,
  permissionMiddleware("mutfak silme"),
  async (c) => {
    const { id } = c.req.param();
    await CategoryProductService.deleteKitchen(id);
    return c.json({ message: "Kitchen deleted successfully" });
  }
);

/* ============================================================
 *  PRODUCT INGREDIENTS ROUTES
 * ============================================================*/

/**
 * 📍 GET /products/:id/ingredients
 * Ürün malzemelerini listeler.
 * Sadece "malzeme listeleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.get(
  "/products/:id/ingredients",
  authMiddleware,
  permissionMiddleware("malzeme listeleme"),
  async (c) => {
    const { id } = c.req.param();
    const ingredients = await CategoryProductService.getProductIngredients(id);
    return c.json({ message: "Product ingredients retrieved successfully", ingredients });
  }
);

/**
 * 📍 POST /products/:id/ingredients
 * Ürün malzemesi ekler.
 * Sadece "malzeme oluşturma" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.post(
  "/products/:id/ingredients",
  authMiddleware,
  permissionMiddleware("malzeme oluşturma"),
  async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().min(1),
      amount: z.number(),
      amountUnit: z.string(),
      price: z.number().default(0),
      priceUnit: z.string(),
      isDefault: z.boolean().default(false),
    });
    const input = schema.parse(body);
    const ingredientData = { ...input, product: id };

    const ingredient = await CategoryProductService.createProductIngredient(ingredientData);
    return c.json({ message: "Product ingredient created successfully", ingredient });
  }
);

/**
 * 📍 GET /ingredients/:id
 * Malzeme detayını getirir.
 * Sadece "malzeme listeleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.get(
  "/ingredients/:id",
  authMiddleware,
  permissionMiddleware("malzeme listeleme"),
  async (c) => {
    const { id } = c.req.param();
    const ingredient = await CategoryProductService.getIngredientById(id);
    return c.json({ message: "Ingredient retrieved successfully", ingredient });
  }
);

/**
 * 📍 PUT /ingredients/:id
 * Malzeme bilgilerini günceller.
 * Sadece "malzeme güncelleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.put(
  "/ingredients/:id",
  authMiddleware,
  permissionMiddleware("malzeme güncelleme"),
  async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().optional(),
      amount: z.number().optional(),
      amountUnit: z.string().optional(),
      price: z.number().optional(),
      priceUnit: z.string().optional(),
      isDefault: z.boolean().optional(),
    });
    const input = schema.parse(body);

    const ingredient = await CategoryProductService.updateIngredient(id, input);
    return c.json({ message: "Ingredient updated successfully", ingredient });
  }
);

/**
 * 📍 DELETE /ingredients/:id
 * Malzemeyi siler.
 * Sadece "malzeme silme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.delete(
  "/ingredients/:id",
  authMiddleware,
  permissionMiddleware("malzeme silme"),
  async (c) => {
    const { id } = c.req.param();
    await CategoryProductService.deleteIngredient(id);
    return c.json({ message: "Ingredient deleted successfully" });
  }
);

/* ============================================================
 *  PRODUCT PRICE ROUTES
 * ============================================================*/

/**
 * 📍 GET /products/:id/prices
 * Ürün fiyatlarını listeler.
 * Sadece "fiyat listeleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.get(
  "/products/:id/prices",
  authMiddleware,
  permissionMiddleware("fiyat listeleme"),
  async (c) => {
    const { id } = c.req.param();
    const prices = await CategoryProductService.getProductPrices(id);
    return c.json({ message: "Product prices retrieved successfully", prices });
  }
);

/**
 * 📍 POST /products/:id/prices
 * Ürün fiyatı ekler.
 * Sadece "fiyat oluşturma" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.post(
  "/products/:id/prices",
  authMiddleware,
  permissionMiddleware("fiyat oluşturma"),
  async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
        const schema = z.object({
          salesMethod: z.string(),
          price: z.number(),
          currencyUnit: z.string().optional(),
          branch: z.string().optional(),
          company: z.string().optional(),
        });
    const input = schema.parse(body);
    const priceData = { ...input, product: id };

    const price = await CategoryProductService.createProductPrice(priceData);
    return c.json({ message: "Product price created successfully", price });
  }
);

/**
 * 📍 GET /prices/:id
 * Fiyat detayını getirir.
 * Sadece "fiyat listeleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.get(
  "/prices/:id",
  authMiddleware,
  permissionMiddleware("fiyat listeleme"),
  async (c) => {
    const { id } = c.req.param();
    const price = await CategoryProductService.getPriceById(id);
    return c.json({ message: "Price retrieved successfully", price });
  }
);

/**
 * 📍 PUT /prices/:id
 * Fiyat bilgilerini günceller.
 * Sadece "fiyat güncelleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.put(
  "/prices/:id",
  authMiddleware,
  permissionMiddleware("fiyat güncelleme"),
  async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const schema = z.object({
      salesMethod: z.string().optional(),
      amount: z.number().optional(),
      unit: z.string().optional(),
    });
    const input = schema.parse(body);

    const price = await CategoryProductService.updatePrice(id, input);
    return c.json({ message: "Price updated successfully", price });
  }
);

/**
 * 📍 DELETE /prices/:id
 * Fiyatı siler.
 * Sadece "fiyat silme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.delete(
  "/prices/:id",
  authMiddleware,
  permissionMiddleware("fiyat silme"),
  async (c) => {
    const { id } = c.req.param();
    await CategoryProductService.deletePrice(id);
    return c.json({ message: "Price deleted successfully" });
  }
);

/* ============================================================
 *  BRANCH SALES METHOD ROUTES
 * ============================================================*/

/**
 * 📍 GET /branches/:id/sales-methods
 * Şube satış yöntemlerini listeler.
 * Sadece "satış yöntemi atama" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.get(
  "/branches/:id/sales-methods",
  authMiddleware,
  permissionMiddleware("satış yöntemi atama"),
  async (c) => {
    const { id } = c.req.param();
    const salesMethods = await CategoryProductService.getBranchSalesMethods(id);
    return c.json({ message: "Branch sales methods retrieved successfully", salesMethods });
  }
);

/**
 * 📍 POST /branches/:id/sales-methods
 * Şubeye satış yöntemi atar.
 * Sadece "satış yöntemi atama" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.post(
  "/branches/:id/sales-methods",
  authMiddleware,
  permissionMiddleware("satış yöntemi atama"),
  async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const schema = z.object({
      salesMethod: z.string(),
    });
    const input = schema.parse(body);
    const assignmentData = { ...input, branch: id };

    const assignment = await CategoryProductService.assignSalesMethodToBranch(assignmentData);
    return c.json({ message: "Sales method assigned to branch successfully", assignment });
  }
);

/**
 * 📍 DELETE /branches/:id/sales-methods/:salesMethodId
 * Şubeden satış yöntemi kaldırır.
 * Sadece "satış yöntemi kaldırma" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.delete(
  "/branches/:id/sales-methods/:salesMethodId",
  authMiddleware,
  permissionMiddleware("satış yöntemi kaldırma"),
  async (c) => {
    const { id, salesMethodId } = c.req.param();
    await CategoryProductService.removeSalesMethodFromBranch(id, salesMethodId);
    return c.json({ message: "Sales method removed from branch successfully" });
  }
);

/* ============================================================
 *  UTILITY ROUTES
 * ============================================================*/

/**
 * 📍 GET /amount-units
 * Miktar birimlerini listeler.
 * Sadece "malzeme listeleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.get(
  "/amount-units",
  authMiddleware,
  permissionMiddleware("malzeme listeleme"),
  async (c) => {
    const units = await CategoryProductService.getAmountUnits();
    return c.json({ message: "Amount units retrieved successfully", units });
  }
);

/**
 * 📍 POST /amount-units
 * Yeni miktar birimi oluşturur.
 * Sadece "malzeme oluşturma" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.post(
  "/amount-units",
  authMiddleware,
  permissionMiddleware("malzeme oluşturma"),
  async (c) => {
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().min(1),
    });
    const input = schema.parse(body);

    const unit = await CategoryProductService.createAmountUnit(input);
    return c.json({ message: "Amount unit created successfully", unit });
  }
);

/**
 * 📍 PUT /amount-units/:id
 * Miktar birimini günceller.
 * Sadece "malzeme güncelleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.put(
  "/amount-units/:id",
  authMiddleware,
  permissionMiddleware("malzeme güncelleme"),
  async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().optional(),
    });
    const input = schema.parse(body);

    const unit = await CategoryProductService.updateAmountUnit(id, input);
    return c.json({ message: "Amount unit updated successfully", unit });
  }
);

/**
 * 📍 DELETE /amount-units/:id
 * Miktar birimini siler.
 * Sadece "malzeme silme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.delete(
  "/amount-units/:id",
  authMiddleware,
  permissionMiddleware("malzeme silme"),
  async (c) => {
    const { id } = c.req.param();
    await CategoryProductService.deleteAmountUnit(id);
    return c.json({ message: "Amount unit deleted successfully" });
  }
);

/**
 * 📍 GET /currency-units
 * Para birimlerini listeler.
 * Sadece "fiyat listeleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.get(
  "/currency-units",
  authMiddleware,
  permissionMiddleware("fiyat listeleme"),
  async (c) => {
    const units = await CategoryProductService.getCurrencyUnits();
    return c.json({ message: "Currency units retrieved successfully", units });
  }
);

/**
 * 📍 POST /currency-units
 * Yeni para birimi oluşturur.
 * Sadece "fiyat oluşturma" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.post(
  "/currency-units",
  authMiddleware,
  permissionMiddleware("fiyat oluşturma"),
  async (c) => {
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().min(1),
    });
    const input = schema.parse(body);

    const unit = await CategoryProductService.createCurrencyUnit(input);
    return c.json({ message: "Currency unit created successfully", unit });
  }
);

/**
 * 📍 PUT /currency-units/:id
 * Para birimini günceller.
 * Sadece "fiyat güncelleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.put(
  "/currency-units/:id",
  authMiddleware,
  permissionMiddleware("fiyat güncelleme"),
  async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().optional(),
    });
    const input = schema.parse(body);

    const unit = await CategoryProductService.updateCurrencyUnit(id, input);
    return c.json({ message: "Currency unit updated successfully", unit });
  }
);

/**
 * 📍 DELETE /currency-units/:id
 * Para birimini siler.
 * Sadece "fiyat silme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.delete(
  "/currency-units/:id",
  authMiddleware,
  permissionMiddleware("fiyat silme"),
  async (c) => {
    const { id } = c.req.param();
    await CategoryProductService.deleteCurrencyUnit(id);
    return c.json({ message: "Currency unit deleted successfully" });
  }
);

/**
 * 📍 GET /sales-methods
 * Satış yöntemlerini listeler.
 * Sadece "satış yöntemi atama" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.get(
  "/sales-methods",
  authMiddleware,
  permissionMiddleware("satış yöntemi atama"),
  async (c) => {
    const methods = await CategoryProductService.getSalesMethods();
    return c.json({ message: "Sales methods retrieved successfully", methods });
  }
);

/**
 * 📍 POST /sales-methods
 * Yeni satış yöntemi oluşturur.
 * Sadece "satış yöntemi oluşturma" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.post(
  "/sales-methods",
  authMiddleware,
  permissionMiddleware("satış yöntemi oluşturma"),
  async (c) => {
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    });
    const input = schema.parse(body);

    const method = await CategoryProductService.createSalesMethod(input);
    return c.json({ message: "Sales method created successfully", method });
  }
);

/**
 * 📍 PUT /sales-methods/:id
 * Satış yöntemini günceller.
 * Sadece "satış yöntemi güncelleme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.put(
  "/sales-methods/:id",
  authMiddleware,
  permissionMiddleware("satış yöntemi güncelleme"),
  async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
    });
    const input = schema.parse(body);

    const method = await CategoryProductService.updateSalesMethod(id, input);
    return c.json({ message: "Sales method updated successfully", method });
  }
);

/**
 * 📍 DELETE /sales-methods/:id
 * Satış yöntemini siler.
 * Sadece "satış yöntemi silme" iznine sahip kullanıcılar erişebilir.
 */
categoryProductRoutes.delete(
  "/sales-methods/:id",
  authMiddleware,
  permissionMiddleware("satış yöntemi silme"),
  async (c) => {
    const { id } = c.req.param();
    await CategoryProductService.deleteSalesMethod(id);
    return c.json({ message: "Sales method deleted successfully" });
  }
);

export default categoryProductRoutes;
