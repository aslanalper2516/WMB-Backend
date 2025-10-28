
import { Hono } from "hono";
import { UserService } from './userService';
import { loginSchema, registerSchema } from "./authValidator";
import { authMiddleware } from "./authMiddleware";
import { permissionMiddleware } from "../RolePermissionService/rolePermissionMiddlewares";
const authRoutes = new Hono();

// GET /users → tüm kullanıcıları getir
// Bu route sistemdeki tüm kullanıcıları listeler
// authMiddleware ile kimlik doğrulama gerektirir
// permissionMiddleware ile "kullanıcı listeleme" izni kontrol edilir
// UserService.getUsers() ile veritabanından tüm kullanıcılar çekilir
// Kullanıcı bilgileri (id, name, email, role, branch, company, createdAt) döndürülür
authRoutes.get("/users", authMiddleware, permissionMiddleware("kullanıcı listeleme"), async (c) => {
  const users = await UserService.getUsers();
  return c.json({
    message: "Users retrieved successfully",
    users: users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      company: user.company,
      createdAt: user.createdAt
    }))
  });
});

// POST /register → yeni kullanıcı oluştur
// Bu route yeni kullanıcı kaydı oluşturur
// authMiddleware ile kimlik doğrulama gerektirir
// permissionMiddleware ile "yeni kullanıcı oluşturma" izni kontrol edilir
// Gelen veriler registerSchema ile Zod validation'dan geçer
// UserService.createUser() ile veritabanında yeni kullanıcı oluşturulur
// Başarılı kayıtta kullanıcı bilgileri (id, name, email, role, branch, company) döndürülür
// Hata durumunda 400 status kodu ile hata mesajı döndürülür
authRoutes.post("/register", authMiddleware, permissionMiddleware("yeni kullanıcı oluşturma"), async (c) => {
  try {
    const body = await c.req.json();

    // Zod validate
    const validatedData = registerSchema.parse(body) as {
      name: string;
      email: string;
      password: string;
      role: string;
      branch?: string;
      company?: string;
    };

    const user = await UserService.createUser(validatedData);

    return c.json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        company: user.company,
      },
    });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Registration failed" },
      400
    );
  }
});

// POST /login → kullanıcı girişi
// Bu route kullanıcı giriş işlemini gerçekleştirir
// Kimlik doğrulama gerektirmez, herkes giriş yapabilir
// Gelen email ve password loginSchema ile validate edilir
// User agent ve IP adresi güvenlik için kaydedilir
// UserService.login() ile kullanıcı doğrulanır ve session oluşturulur
// Başarılı girişte HttpOnly cookie ile session_token set edilir (7 gün geçerli)
// Cookie güvenlik ayarları: HttpOnly, SameSite=Strict, production'da Secure
// Başarılı girişte kullanıcı bilgileri döndürülür, hata durumunda 401 status kodu
authRoutes.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    
    // Validation
    const validatedData = loginSchema.parse(body);
    
    // User agent ve IP adresini al
    const userAgent = c.req.header('user-agent');
    const ipAddress = c.req.header('x-forwarded-for') || 
                     c.req.header('x-real-ip') || 
                     'unknown';

    const result = await UserService.login(
      validatedData.email, 
      validatedData.password,
      userAgent,
      ipAddress
    );

    // Cookie'yi set et
    c.header(
      'Set-Cookie',
      `session_token=${result.sessionToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict;${process.env.NODE_ENV === 'production' ? ' Secure;' : ''}`
    );

    return c.json({
      message: "Login successful",
      user: result.user,
      sessionToken: result.sessionToken,
    });
  } catch (error) {
    return c.json({ 
      error: error instanceof Error ? error.message : 'Login failed' 
    }, 401);
  }
});

// POST /logout → kullanıcı çıkışı
// Bu route kullanıcı çıkış işlemini gerçekleştirir
// authMiddleware ile kimlik doğrulama gerektirir
// Cookie'den session_token çıkarılır ve UserService.logout() ile session silinir
// Cookie temizlenir (Max-Age=0 ile expire edilir)
// Başarılı çıkışta "Logout successful" mesajı döndürülür
authRoutes.post("/logout", authMiddleware, async (c) => {
  const cookieHeader = c.req.header('Cookie');
  const sessionToken = cookieHeader?.split(';')
    .find(cookie => cookie.trim().startsWith('session_token='))
    ?.split('=')[1];
  
  if (sessionToken) {
    await UserService.logout(sessionToken);
  }

  // Cookie'yi sil
  c.header(
    'Set-Cookie',
    'session_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
  );

  return c.json({ message: "Logout successful" });
});

// GET /me → mevcut kullanıcı bilgileri
// Bu route giriş yapmış kullanıcının kendi bilgilerini getirir
// authMiddleware ile kimlik doğrulama gerektirir
// Cookie'den session_token çıkarılır ve UserService.validateSession() ile doğrulanır
// Geçerli session yoksa 401 "Not authenticated" hatası döndürülür
// Geçersiz session durumunda 401 "Invalid session" hatası döndürülür
// Başarılı durumda kullanıcı bilgileri (id, name, email, role) döndürülür
authRoutes.get("/me", authMiddleware,async (c) => {
  const cookieHeader = c.req.header('Cookie');
  const sessionToken = cookieHeader?.split(';')
    .find(cookie => cookie.trim().startsWith('session_token='))
    ?.split('=')[1];
  
  if (!sessionToken) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const user = await UserService.validateSession(sessionToken);
  
  if (!user) {
    return c.json({ error: "Invalid session" }, 401);
  }

  return c.json({
    user: {
      id: user._id,
      name: (user as any).name,
      email: (user as any).email,
      role: (user as any).role,
      branch: (user as any).branch,
      company: (user as any).company
    }
  });
});

// PUT /users/:id → kullanıcı güncelle
// Bu route mevcut kullanıcı bilgilerini günceller
// authMiddleware ile kimlik doğrulama gerektirir
// permissionMiddleware ile "kullanıcı güncelleme" izni kontrol edilir
// URL'den userId alınır ve UserService.updateUser() ile güncelleme yapılır
// Başarılı güncellemede kullanıcı bilgileri döndürülür
// Hata durumunda 400 status kodu ile hata mesajı döndürülür
authRoutes.put("/users/:id", authMiddleware, permissionMiddleware("kullanıcı güncelleme"), async (c) => {
  try {
    const userId = c.req.param("id");
    const body = await c.req.json();

    const user = await UserService.updateUser(userId, body);

    return c.json({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        company: user.company,
      },
    });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "User update failed" },
      400
    );
  }
});

// DELETE /users/:id → kullanıcı sil
// Bu route kullanıcıyı sistemden siler
// authMiddleware ile kimlik doğrulama gerektirir
// permissionMiddleware ile "kullanıcı silme" izni kontrol edilir
// URL'den userId alınır ve UserService.deleteUser() ile silme işlemi yapılır
// Kullanıcının aktif session'ları da silinir
// Başarılı silmede onay mesajı döndürülür
// Hata durumunda 400 status kodu ile hata mesajı döndürülür
authRoutes.delete("/users/:id", authMiddleware, permissionMiddleware("kullanıcı silme"), async (c) => {
  try {
    const userId = c.req.param("id");

    await UserService.deleteUser(userId);

    return c.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "User deletion failed" },
      400
    );
  }
});

// GET /users/:id → tek kullanıcı getir
// Bu route belirli bir kullanıcının bilgilerini getirir
// authMiddleware ile kimlik doğrulama gerektirir
// permissionMiddleware ile "kullanıcı görüntüleme" izni kontrol edilir
// URL'den userId alınır ve UserService.getUserById() ile kullanıcı bilgileri çekilir
// Başarılı durumda kullanıcı bilgileri döndürülür
// Hata durumunda 400 status kodu ile hata mesajı döndürülür
authRoutes.get("/users/:id", authMiddleware, permissionMiddleware("kullanıcı görüntüleme"), async (c) => {
  try {
    const userId = c.req.param("id");

    const user = await UserService.getUserById(userId);

    return c.json({
      message: "User retrieved successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        company: user.company,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "User retrieval failed" },
      400
    );
  }
});

// PUT /profile → kendi profilini güncelle
// Bu route kullanıcının kendi profilini günceller (izin kontrolü olmadan)
// authMiddleware ile kimlik doğrulama gerektirir
// Cookie'den session_token alınır ve mevcut kullanıcı bilgisi alınır
// Sadece name ve email güncellenebilir
// Başarılı güncellemede kullanıcı bilgileri döndürülür
authRoutes.put("/profile", authMiddleware, async (c) => {
  try {
    const cookieHeader = c.req.header('Cookie');
    const sessionToken = cookieHeader?.split(';')
      .find(cookie => cookie.trim().startsWith('session_token='))
      ?.split('=')[1];
    
    if (!sessionToken) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const currentUser = await UserService.validateSession(sessionToken);
    
    if (!currentUser) {
      return c.json({ error: "Invalid session" }, 401);
    }

    const body = await c.req.json();
    const updateData: any = {};
    
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;

    const user = await UserService.updateUser((currentUser as any)._id.toString(), updateData);

    return c.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        company: user.company,
      },
    });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Profile update failed" },
      400
    );
  }
});

// PUT /change-password → şifre değiştir
// Bu route kullanıcının şifresini değiştirir
// authMiddleware ile kimlik doğrulama gerektirir
// Cookie'den session_token alınır ve mevcut kullanıcı bilgisi alınır
// Eski şifre doğrulanır, sonra yeni şifre hash'lenerek güncellenir
// Başarılı değişiklikte onay mesajı döndürülür
authRoutes.put("/change-password", authMiddleware, async (c) => {
  try {
    const cookieHeader = c.req.header('Cookie');
    const sessionToken = cookieHeader?.split(';')
      .find(cookie => cookie.trim().startsWith('session_token='))
      ?.split('=')[1];
    
    if (!sessionToken) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const currentUser = await UserService.validateSession(sessionToken);
    
    if (!currentUser) {
      return c.json({ error: "Invalid session" }, 401);
    }

    const body = await c.req.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return c.json({ error: "Old password and new password are required" }, 400);
    }

    if (newPassword.length < 6) {
      return c.json({ error: "New password must be at least 6 characters" }, 400);
    }

    // Eski şifreyi doğrula
    const isValid = await UserService.verifyPassword(oldPassword, (currentUser as any).password);
    
    if (!isValid) {
      return c.json({ error: "Invalid old password" }, 400);
    }

    // Yeni şifreyi güncelle
    await UserService.updateUser((currentUser as any)._id.toString(), { password: newPassword });

    return c.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Password change failed" },
      400
    );
  }
});

export default authRoutes;
