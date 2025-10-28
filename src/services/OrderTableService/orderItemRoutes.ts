import { Hono } from "hono";
import { OrderItemService } from "./orderItemService";
import { authMiddleware, roleMiddleware } from "../AuthService/authMiddleware";

const orderItemRoutes = new Hono();

// GET /order-items → sipariş kalemlerini getir
// Bu route sistemdeki sipariş kalemlerini getirir, opsiyonel olarak siparişe göre filtreler
// Sadece kimlik doğrulaması gerektirir, tüm giriş yapmış kullanıcılar erişebilir
// authMiddleware ile kimlik doğrulama yapılır
// Query parametresi 'order' ile belirli siparişe ait kalemler filtrelenebilir
// OrderItemService.getOrderItems() ile veritabanından sipariş kalemleri listesi çekilir
// Başarılı durumda sipariş kalemleri listesi ve başarı mesajı döndürülür
orderItemRoutes.get("/order-items", authMiddleware, async (c) => {
  const filter: any = {};
  if (c.req.query("order")) filter.order = c.req.query("order");
  const items = await OrderItemService.getOrderItems(filter);
  return c.json({ message: "Order items retrieved successfully", items });
});

// POST /order-items → yeni sipariş kalemi ekle
// Bu route yeni bir sipariş kalemi oluşturur
// Sadece kimlik doğrulaması gerektirir, tüm giriş yapmış kullanıcılar erişebilir
// authMiddleware ile kimlik doğrulama yapılır
// Request body'den sipariş kalemi bilgileri alınır (order, product, quantity, price, note)
// OrderItemService.createOrderItem() ile veritabanında yeni sipariş kalemi oluşturulur
// Başarılı durumda oluşturulan sipariş kalemi bilgileri ve başarı mesajı döndürülür
orderItemRoutes.post("/order-items", authMiddleware, async (c) => {
  const body = await c.req.json();
  const item = await OrderItemService.createOrderItem(body);
  return c.json({ message: "Order item created successfully", item });
});

// GET /order-items/:id → tek sipariş kalemi getir
// Bu route ID'si verilen sipariş kaleminin detaylarını getirir
// Sadece kimlik doğrulaması gerektirir, tüm giriş yapmış kullanıcılar erişebilir
// authMiddleware ile kimlik doğrulama yapılır
// URL parametresinden sipariş kalemi ID'si alınır
// OrderItemService.getOrderItemById() ile veritabanından sipariş kalemi bilgileri çekilir
// Başarılı durumda sipariş kalemi detayları ve başarı mesajı döndürülür
orderItemRoutes.get("/order-items/:id", authMiddleware, async (c) => {
  const { id } = c.req.param();
  const item = await OrderItemService.getOrderItemById(id);
  return c.json({ message: "Order item retrieved successfully", item });
});

// PUT /order-items/:id → sipariş kalemi güncelle
// Bu route mevcut bir sipariş kaleminin bilgilerini günceller
// Sadece admin rolündeki kullanıcılar erişebilir
// authMiddleware ile kimlik doğrulama, roleMiddleware ile admin yetkisi kontrol edilir
// URL parametresinden sipariş kalemi ID'si, request body'den güncellenecek bilgiler alınır
// OrderItemService.updateOrderItem() ile veritabanında sipariş kalemi bilgileri güncellenir
// Başarılı durumda güncellenmiş sipariş kalemi bilgileri ve başarı mesajı döndürülür
orderItemRoutes.put("/order-items/:id", authMiddleware, roleMiddleware("admin"), async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const item = await OrderItemService.updateOrderItem(id, body);
  return c.json({ message: "Order item updated successfully", item });
});

// DELETE /order-items/:id → sipariş kalemi sil
// Bu route belirtilen ID'ye sahip sipariş kalemini sistemden siler
// Sadece admin rolündeki kullanıcılar erişebilir
// authMiddleware ile kimlik doğrulama, roleMiddleware ile admin yetkisi kontrol edilir
// URL parametresinden silinecek sipariş kalemi ID'si alınır
// OrderItemService.deleteOrderItem() ile veritabanından sipariş kalemi silinir
// Başarılı durumda sadece başarı mesajı döndürülür
orderItemRoutes.delete("/order-items/:id", authMiddleware, roleMiddleware("admin"), async (c) => {
  const { id } = c.req.param();
  await OrderItemService.deleteOrderItem(id);
  return c.json({ message: "Order item deleted successfully" });
});

export default orderItemRoutes;
