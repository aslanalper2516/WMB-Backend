import { Context, Next } from 'hono';
import { UserService } from '../AuthService/userService';
import { RolePermission } from "./models/rolePermission";

// --- Role Middleware ---
// Kullanıcının rolünü kontrol eder
export const roleMiddleware = (...allowedRoles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    // Burada user.role ObjectId → Role objesi
    const roleName = typeof user.role === 'object' ? user.role.name : user.role;

    if (!allowedRoles.includes(roleName)) {
      return c.json({ 
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      }, 403);
    }

    await next();
  };
};


// --- Permission Middleware ---
// Kullanıcının izinini kontrol eder
export const permissionMiddleware = (...requiredPermissions: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Authentication required" }, 401);
    }

    const roleId = user.role?._id || user.role;
    if (!roleId) {
      return c.json({ error: "User has no role assigned" }, 403);
    }

    // Kullanıcının rolündeki izinleri çek
    const rolePermissions = await RolePermission.find({ role: roleId })
      .populate("permission")
      .lean();

    const userPermissions = rolePermissions.map(
      (rp: any) => rp.permission?.name
    );

    // Gerekli izinlerden biri bile yoksa reddet
    const hasPermission = requiredPermissions.some((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      return c.json(
        {
          error: `Access denied. Required permissions: ${requiredPermissions.join(
            ", "
          )}`,
        },
        403
      );
    }

    // Yetkili kullanıcı, devam et
    await next();
  };
};