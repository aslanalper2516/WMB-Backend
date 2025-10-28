// src/middlewares/authMiddleware.ts
import { Context, Next } from 'hono';
import { UserService } from './userService';
import { RolePermission } from "../RolePermissionService/models/rolePermission";


// --- Auth Middleware ---
// Kullanıcı giriş yapmış mı kontrol eder
export const authMiddleware = async (c: Context, next: Next) => {
  // Önce Authorization header'ı kontrol et
  const authHeader = c.req.header('Authorization');
  let sessionToken = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    sessionToken = authHeader.substring(7);
  } else {
    // Authorization header yoksa cookie'den al
    const cookieHeader = c.req.header('Cookie');
    sessionToken = cookieHeader?.split(';')
      .find(cookie => cookie.trim().startsWith('session_token='))
      ?.split('=')[1];
  }
  
  if (!sessionToken) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const user = await UserService.validateSession(sessionToken);

  if (!user) {
    return c.json({ error: 'Invalid or expired session' }, 401);
  }

  c.set('user', user);
  
  await next();
};


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