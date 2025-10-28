import { Hono } from "hono";
import { OrderService } from "./orderService";
import { authMiddleware, roleMiddleware } from "../AuthService/authMiddleware";

const orderRoutes = new Hono();

// GET /orders → tüm siparişler (filter: branch, user, table vs.)
// Bu route sistemdeki siparişleri getirir, opsiyonel olarak çeşitli filtrelerle filtreler
// Sadece kimlik doğrulaması gerektirir, tüm giriş yapmış kullanıcılar erişebilir
// authMiddleware ile kimlik doğrulama yapılır
// Query parametreleri 'branch', 'user', 'table' ile filtreleme yapılabilir
// OrderService.getOrders() ile veritabanından sipariş listesi çekilir
// Başarılı durumda sipariş listesi ve başarı mesajı döndürülür
orderRoutes.get("/", authMiddleware, async (c) => {
  const filter: any = {};
  if (c.req.query("branch")) filter.branch = c.req.query("branch");
  if (c.req.query("user")) filter.user = c.req.query("user");
  if (c.req.query("table")) filter.table = c.req.query("table");
  const orders = await OrderService.getOrders(filter);
  return c.json({ message: "Orders retrieved successfully", orders });
});

// POST /orders → yeni sipariş oluştur
// Bu route yeni bir sipariş kaydı oluşturur
// Sadece kimlik doğrulaması gerektirir, tüm giriş yapmış kullanıcılar sipariş verebilir
// authMiddleware ile kimlik doğrulama yapılır
// Request body'den sipariş bilgileri alınır (user, branch, status, paymentMethod, currencyUnit, totalPrice, note, createdBy)
// OrderService.createOrder() ile veritabanında yeni sipariş oluşturulur
// Başarılı durumda oluşturulan sipariş bilgileri ve başarı mesajı döndürülür
orderRoutes.post("/", authMiddleware, async (c) => {
  const body = await c.req.json();
  const order = await OrderService.createOrder(body);
  return c.json({ message: "Order created successfully", order });
});

// GET /orders/:id → belirli siparişi getir
// Bu route ID'si verilen siparişin detaylarını getirir
// Sadece kimlik doğrulaması gerektirir, tüm giriş yapmış kullanıcılar erişebilir
// authMiddleware ile kimlik doğrulama yapılır
// URL parametresinden sipariş ID'si alınır
// OrderService.getOrderById() ile veritabanından sipariş bilgileri çekilir
// Başarılı durumda sipariş detayları ve başarı mesajı döndürülür
orderRoutes.get("/:id", authMiddleware, async (c) => {
  const { id } = c.req.param();
  const order = await OrderService.getOrderById(id);
  return c.json({ message: "Order retrieved successfully", order });
});

// PUT /orders/:id → siparişi güncelle
// Bu route mevcut bir siparişin bilgilerini günceller
// Sadece admin rolündeki kullanıcılar erişebilir
// authMiddleware ile kimlik doğrulama, roleMiddleware ile admin yetkisi kontrol edilir
// URL parametresinden sipariş ID'si, request body'den güncellenecek bilgiler alınır
// OrderService.updateOrder() ile veritabanında sipariş bilgileri güncellenir
// Başarılı durumda güncellenmiş sipariş bilgileri ve başarı mesajı döndürülür
orderRoutes.put("/:id", authMiddleware, roleMiddleware("admin"), async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const order = await OrderService.updateOrder(id, body);
  return c.json({ message: "Order updated successfully", order });
});

// DELETE /orders/:id → siparişi sil
// Bu route belirtilen ID'ye sahip siparişi sistemden siler
// Sadece admin rolündeki kullanıcılar erişebilir
// authMiddleware ile kimlik doğrulama, roleMiddleware ile admin yetkisi kontrol edilir
// URL parametresinden silinecek sipariş ID'si alınır
// OrderService.deleteOrder() ile veritabanından sipariş silinir
// Başarılı durumda sadece başarı mesajı döndürülür
orderRoutes.delete("/:id", authMiddleware, roleMiddleware("admin"), async (c) => {
  const { id } = c.req.param();
  await OrderService.deleteOrder(id);
  return c.json({ message: "Order deleted successfully" });
});

export default orderRoutes;
