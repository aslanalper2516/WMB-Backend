import { Hono } from "hono";
import { z } from "zod";
import { RolePermissionService } from "./rolePermissionService";
import { authMiddleware } from "../AuthService/authMiddleware";
import { permissionMiddleware } from "./rolePermissionMiddlewares";

export const rolePermissionRoutes = new Hono();

/* ---------------------------
 *  PERMISSIONS
 * -------------------------*/

// POST /permissions → yeni permission oluştur
rolePermissionRoutes.post(
  "/permissions",
  authMiddleware,
  permissionMiddleware("izin oluşturma"),
  async (c) => {
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    });
    const input = schema.parse(body);

    const perm = await RolePermissionService.createPermission(input);
    return c.json({ message: "Permission created successfully", perm });
  }
);

// GET /permissions → tüm izinleri getir
rolePermissionRoutes.get(
  "/permissions",
  authMiddleware,
  permissionMiddleware("izin listeleme"),
  async (c) => {
    const permissions = await RolePermissionService.getPermissions();
    return c.json(permissions);
  }
);

// PUT /permissions/:id → izin güncelle
rolePermissionRoutes.put(
  "/permissions/:id",
  authMiddleware,
  permissionMiddleware("izin güncelleme"),
  async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
    });
    const input = schema.parse(body);

    const updated = await RolePermissionService.updatePermission(id, input);
    return c.json({ message: "Permission updated successfully", updated });
  }
);

// DELETE /permissions/:id → izin sil
rolePermissionRoutes.delete(
  "/permissions/:id",
  authMiddleware,
  permissionMiddleware("izin silme"),
  async (c) => {
    const { id } = c.req.param();
    await RolePermissionService.deletePermission(id);
    return c.json({ message: "Permission deleted successfully" });
  }
);

/* ---------------------------
 *  ROLES
 * -------------------------*/

// POST /roles → yeni rol oluştur (GLOBAL veya BRANCH)
rolePermissionRoutes.post(
  "/roles",
  authMiddleware,
  permissionMiddleware("rol oluşturma"),
  async (c) => {
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().min(1),
      scope: z.enum(["GLOBAL", "BRANCH"]).default("BRANCH"),
      branch: z.string().optional(),

    });
    const input = schema.parse(body);

    const role = await RolePermissionService.createRole(input);
    return c.json({ message: "Role created successfully", role });
  }
);

// GET /roles → tüm rolleri getir
rolePermissionRoutes.get(
  "/roles",
  authMiddleware,
  permissionMiddleware("rol listeleme"),
  async (c) => {
    const roles = await RolePermissionService.getRoles();
    return c.json(roles);
  }
);

// PUT /roles/:id → rol güncelle
rolePermissionRoutes.put(
  "/roles/:id",
  authMiddleware,
  permissionMiddleware("rol güncelleme"),
  async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const schema = z.object({
      name: z.string().min(1).optional(),
      scope: z.enum(["GLOBAL", "BRANCH"]).optional(),
      branch: z.string().optional(),
    });
    const input = schema.parse(body);

    const updated = await RolePermissionService.updateRole(id, input);
    return c.json({ message: "Role updated successfully", updated });
  }
);

// DELETE /roles/:id → belirli bir rolü sil
rolePermissionRoutes.delete(
  "/roles/:id",
  authMiddleware,
  permissionMiddleware("rol silme"),
  async (c) => {
    const { id } = c.req.param();
    await RolePermissionService.deleteRole(id);
    return c.json({ message: "Role deleted successfully" });
  }
);

/* ---------------------------
 *  ROLE-PERMISSION
 * -------------------------*/

// POST /roles/:roleId/permissions/:permissionId → role izin ata
rolePermissionRoutes.post(
  "/roles/:roleId/permissions/:permissionId",
  authMiddleware,
  permissionMiddleware("role izin atama"),
  async (c) => {
    const { roleId, permissionId } = c.req.param();
    const { branch, createdBy } = await c.req.json();

    const result = await RolePermissionService.assignPermissionToRole({
      roleId,
      permissionId,
      branch,
    });

    return c.json({ message: "Permission assigned to role", result });
  }
);

// DELETE /roles/:roleId/permissions/:permissionId → role’den izin kaldır
rolePermissionRoutes.delete(
  "/roles/:roleId/permissions/:permissionId",
  authMiddleware,
  permissionMiddleware("role izin kaldırma"),
  async (c) => {
    const { roleId, permissionId } = c.req.param();
    const result = await RolePermissionService.removePermissionFromRole(roleId, permissionId);
    return c.json(result);
  }
);

// GET /roles/:roleId/permissions → role ait tüm izinleri getir
rolePermissionRoutes.get(
  "/roles/:roleId/permissions",
  authMiddleware,
  permissionMiddleware("role izin listeleme"),
  async (c) => {
    const { roleId } = c.req.param();
    const result = await RolePermissionService.getRolePermissions(roleId);
    return c.json(result);
  }
);
