import { Hono } from "hono";
import { z } from "zod";
import { CompanyBranchService } from "./companyBranchService";
import { AddressService } from "./addressService";
import { authMiddleware } from "../AuthService/authMiddleware";
import { permissionMiddleware } from "../RolePermissionService/rolePermissionMiddlewares";

export const companyBranchRoutes = new Hono();

/* ============================================================
 *  COMPANY ROUTES
 * ============================================================*/

/**
 * 📍 GET /companies
 * Tüm şirketleri listeler.
 * Sadece "şirket listeleme" iznine sahip kullanıcılar erişebilir.
 */
companyBranchRoutes.get(
  "/companies",
  authMiddleware,
  permissionMiddleware("şirket listeleme"),
  async (c) => {
    const companies = await CompanyBranchService.getCompanies();
    return c.json({ message: "Companies retrieved successfully", companies });
  }
);

/**
 * 📍 POST /companies
 * Yeni bir şirket oluşturur.
 * Sadece "şirket oluşturma" iznine sahip kullanıcılar erişebilir.
 */
companyBranchRoutes.post(
  "/companies",
  authMiddleware,
  permissionMiddleware("şirket oluşturma"),
  async (c) => {
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      province: z.string().optional(),
      district: z.string().optional(),
      neighborhood: z.string().optional(),
      street: z.string().optional(),
      address: z.string().optional(),
      manager: z.string().optional(),
      managerEmail: z.string().email().optional(),
      managerPhone: z.string().optional(),
    });
    const input = schema.parse(body);

    const company = await CompanyBranchService.createCompany(input);
    return c.json({ message: "Company created successfully", company });
  }
);

/**
 * 📍 GET /companies/:id
 * Belirli bir şirketin detaylarını getirir.
 * Sadece "şirket görüntüleme" iznine sahip kullanıcılar erişebilir.
 */
companyBranchRoutes.get(
  "/companies/:id",
  authMiddleware,
  permissionMiddleware("şirket görüntüleme"),
  async (c) => {
    const { id } = c.req.param();
    const company = await CompanyBranchService.getCompanyById(id);
    return c.json({ message: "Company retrieved successfully", company });
  }
);

/**
 * 📍 PUT /companies/:id
 * Şirket bilgilerini günceller.
 * Sadece "şirket güncelleme" iznine sahip kullanıcılar erişebilir.
 */
companyBranchRoutes.put(
  "/companies/:id",
  authMiddleware,
  permissionMiddleware("şirket güncelleme"),
  async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      province: z.string().optional(),
      district: z.string().optional(),
      neighborhood: z.string().optional(),
      street: z.string().optional(),
      address: z.string().optional(),
      manager: z.string().optional(),
      managerEmail: z.string().email().optional(),
      managerPhone: z.string().optional(),
    });
    const input = schema.parse(body);

    const company = await CompanyBranchService.updateCompany(id, input);
    return c.json({ message: "Company updated successfully", company });
  }
);

/**
* 📍 DELETE /companies/:id
* Şirketi soft delete ile siler.
* Sadece "şirket silme" iznine sahip kullanıcılar erişebilir.
*/
companyBranchRoutes.delete(
  "/companies/:id",
  authMiddleware,
  permissionMiddleware("şirket silme"),
  async (c) => {
    const { id } = c.req.param();
    const company = await CompanyBranchService.deleteCompany(id);
    return c.json({ message: "Company soft deleted successfully", company });
  }
);


/* ============================================================
 *  BRANCH ROUTES
 * ============================================================*/

/**
 * 📍 GET /branches
 * Tüm şubeleri veya belirli bir şirkete ait olanları listeler.
 * Query param: ?company=companyId
 * Sadece "şube listeleme" iznine sahip kullanıcılar erişebilir.
 */
companyBranchRoutes.get(
  "/branches",
  authMiddleware,
  permissionMiddleware("şube listeleme"),
  async (c) => {
    const companyId = c.req.query("company");
    const branches = await CompanyBranchService.getBranches(companyId);
    return c.json({ message: "Branches retrieved successfully", branches });
  }
);

/**
 * 📍 POST /branches
 * Yeni bir şube oluşturur.
 * Sadece "şube oluşturma" iznine sahip kullanıcılar erişebilir.
 */
companyBranchRoutes.post(
  "/branches",
  authMiddleware,
  permissionMiddleware("şube oluşturma"),
  async (c) => {
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      province: z.string().optional(),
      district: z.string().optional(),
      neighborhood: z.string().optional(),
      street: z.string().optional(),
      address: z.string().optional(),
      company: z.string(),
      manager: z.string().optional(),
      managerEmail: z.string().email().optional(),
      managerPhone: z.string().optional(),
      tables: z.number().optional(),
    });
    const input = schema.parse(body);

    const branch = await CompanyBranchService.createBranch(input);
    return c.json({ message: "Branch created successfully", branch });
  }
);

/**
 * 📍 GET /branches/:id
 * Belirli bir şubenin detaylarını getirir.
 * Sadece "şube görüntüleme" iznine sahip kullanıcılar erişebilir.
 */
companyBranchRoutes.get(
  "/branches/:id",
  authMiddleware,
  permissionMiddleware("şube görüntüleme"),
  async (c) => {
    const { id } = c.req.param();
    const branch = await CompanyBranchService.getBranchById(id);
    return c.json({ message: "Branch retrieved successfully", branch });
  }
);

/**
 * 📍 PUT /branches/:id
 * Şube bilgilerini günceller.
 * Sadece "şube güncelleme" iznine sahip kullanıcılar erişebilir.
 */
companyBranchRoutes.put(
  "/branches/:id",
  authMiddleware,
  permissionMiddleware("şube güncelleme"),
  async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      province: z.string().optional(),
      district: z.string().optional(),
      neighborhood: z.string().optional(),
      street: z.string().optional(),
      address: z.string().optional(),
      manager: z.string().optional(),
      managerEmail: z.string().email().optional(),
      managerPhone: z.string().optional(),
      tables: z.number().optional(),
    });
    const input = schema.parse(body);

    const branch = await CompanyBranchService.updateBranch(id, input);
    return c.json({ message: "Branch updated successfully", branch });
  }
);

/**
 * 📍 PATCH /branches/:id/tables
 * Belirli bir şubenin sadece masa sayısını günceller.
 * Sadece "şube masa sayısı güncelleme" iznine sahip kullanıcılar erişebilir.
 */
companyBranchRoutes.patch(
  "/branches/:id/tables",
  authMiddleware,
  permissionMiddleware("şube masa sayısı güncelleme"),
  async (c) => {
    const { id } = c.req.param();
    const { tables } = await c.req.json();

    const branch = await CompanyBranchService.updateBranchTables(id, tables);
    return c.json({ message: "Branch tables updated successfully", branch });
  }
);

/**
 * 📍 DELETE /branches/:id
 * Şubeyi soft delete ile siler.
 * Sadece "şube silme" iznine sahip kullanıcılar erişebilir.
 */
companyBranchRoutes.delete(
  "/branches/:id",
  authMiddleware,
  permissionMiddleware("şube silme"),
  async (c) => {
    const { id } = c.req.param();
    const branch = await CompanyBranchService.deleteBranch(id);
    return c.json({ message: "Branch soft deleted successfully", branch });
  }
);

/**
 * 📍 GET /companies/deleted/all
 * Soft delete edilmiş şirketleri listeler.
 * Sadece "şirket listeleme" iznine sahip kullanıcılar erişebilir.
 */
companyBranchRoutes.get(
  "/companies/deleted/all",
  authMiddleware,
  permissionMiddleware("şirket listeleme"),
  async (c) => {
    const deletedCompanies = await CompanyBranchService.getDeletedCompanies();
    return c.json({ message: "Deleted companies retrieved successfully", deletedCompanies });
  }
);

/**
 * 📍 PATCH /companies/:id/restore
 * Soft delete edilmiş bir şirketi geri aktif hale getirir.
 * Sadece "şirket güncelleme" iznine sahip kullanıcılar erişebilir.
 */
companyBranchRoutes.patch(
  "/companies/:id/restore",
  authMiddleware,
  permissionMiddleware("şirket güncelleme"),
  async (c) => {
    const { id } = c.req.param();
    const restored = await CompanyBranchService.restoreCompany(id);
    return c.json({ message: "Company restored successfully", restored });
  }
);

/**
 * 📍 GET /branches/deleted/all
 * Soft delete edilmiş şubeleri listeler.
 * Sadece "şube listeleme" iznine sahip kullanıcılar erişebilir.
 */
companyBranchRoutes.get(
  "/branches/deleted/all",
  authMiddleware,
  permissionMiddleware("şube listeleme"),
  async (c) => {
    const deletedBranches = await CompanyBranchService.getDeletedBranches();
    return c.json({ message: "Deleted branches retrieved successfully", deletedBranches });
  }
);

/**
 * 📍 PATCH /branches/:id/restore
 * Soft delete edilmiş bir şubeyi geri aktif hale getirir.
 * Sadece "şube güncelleme" iznine sahip kullanıcılar erişebilir.
 */
companyBranchRoutes.patch(
  "/branches/:id/restore",
  authMiddleware,
  permissionMiddleware("şube güncelleme"),
  async (c) => {
    const { id } = c.req.param();
    const restored = await CompanyBranchService.restoreBranch(id);
    return c.json({ message: "Branch restored successfully", restored });
  }
);

/**
 * 📍 GET /branches/:id/kitchens
 * Belirli bir şubeye ait mutfakları listeler.
 * Sadece "mutfak listeleme" iznine sahip kullanıcılar erişebilir.
 */
companyBranchRoutes.get(
  "/branches/:id/kitchens",
  authMiddleware,
  permissionMiddleware("mutfak listeleme"),
  async (c) => {
    const { id } = c.req.param();
    const kitchens = await CompanyBranchService.getKitchens(id);
    return c.json({ message: "Kitchens retrieved successfully", kitchens });
  }
);

/* ============================================================
 *  ADDRESS ROUTES
 * ============================================================*/

/**
 * 📍 GET /addresses/:type
 * Adres verilerini getirir (il, ilçe, mahalle, sokak)
 * Query param: ?parentId=xxx (ilçe, mahalle, sokak için gerekli)
 */
companyBranchRoutes.get(
  "/addresses/:type",
  authMiddleware,
  async (c) => {
    const { type } = c.req.param();
    const parentId = c.req.query("parentId");
    
    if (!['province', 'district', 'neighborhood', 'street'].includes(type)) {
      return c.json({ error: "Invalid address type" }, 400);
    }

    const addresses = await AddressService.getAddresses(
      type as 'province' | 'district' | 'neighborhood' | 'street',
      parentId
    );
    
    return c.json({ 
      message: "Addresses retrieved successfully", 
      addresses: addresses.map(a => ({ id: a._id, name: a.name })) 
    });
  }
);


export default companyBranchRoutes;
