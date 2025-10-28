import { Hono } from "hono";
import { OrderItemIngredientService } from "./orderItemIngredientService";
import { authMiddleware } from "../AuthService/authMiddleware";

const orderItemIngredientRoutes = new Hono();

// GET /order-item-ingredients → içerikler
// Bu route sipariş kalemlerindeki içerikleri (ingredient) getirir
// Sadece kimlik doğrulaması gerektirir, tüm giriş yapmış kullanıcılar erişebilir
// authMiddleware ile kimlik doğrulama yapılır
// Query parametresi 'orderItem' ile belirli sipariş kalemine ait içerikler filtrelenebilir
// OrderItemIngredientService.getIngredients() ile veritabanından içerik listesi çekilir
// Başarılı durumda içerik listesi ve başarı mesajı döndürülür
orderItemIngredientRoutes.get("/order-item-ingredients", authMiddleware, async (c) => {
  const filter: any = {};
  if (c.req.query("orderItem")) filter.orderItem = c.req.query("orderItem");
  const ingredients = await OrderItemIngredientService.getIngredients(filter);
  return c.json({ message: "Order item ingredients retrieved successfully", ingredients });
});

// POST /order-item-ingredients → yeni içerik
// Bu route sipariş kalemine yeni bir içerik (ingredient) ekler
// Sadece kimlik doğrulaması gerektirir, tüm giriş yapmış kullanıcılar erişebilir
// authMiddleware ile kimlik doğrulama yapılır
// Request body'den içerik bilgileri alınır (orderItem, ingredient, quantity, unit)
// OrderItemIngredientService.createIngredient() ile veritabanında yeni içerik oluşturulur
// Başarılı durumda oluşturulan içerik bilgileri ve başarı mesajı döndürülür
orderItemIngredientRoutes.post("/order-item-ingredients", authMiddleware, async (c) => {
  const body = await c.req.json();
  const ingredient = await OrderItemIngredientService.createIngredient(body);
  return c.json({ message: "Order item ingredient created successfully", ingredient });
});

// PUT /order-item-ingredients/:id → içerik güncelle
// Bu route mevcut bir sipariş kalemi içeriğinin bilgilerini günceller
// Sadece kimlik doğrulaması gerektirir, tüm giriş yapmış kullanıcılar erişebilir
// authMiddleware ile kimlik doğrulama yapılır
// URL parametresinden içerik ID'si, request body'den güncellenecek bilgiler alınır
// OrderItemIngredientService.updateIngredient() ile veritabanında içerik bilgileri güncellenir
// Başarılı durumda güncellenmiş içerik bilgileri ve başarı mesajı döndürülür
orderItemIngredientRoutes.put("/order-item-ingredients/:id", authMiddleware, async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const ingredient = await OrderItemIngredientService.updateIngredient(id, body);
  return c.json({ message: "Order item ingredient updated successfully", ingredient });
});

// DELETE /order-item-ingredients/:id → içerik sil
// Bu route belirtilen ID'ye sahip sipariş kalemi içeriğini sistemden siler
// Sadece kimlik doğrulaması gerektirir, tüm giriş yapmış kullanıcılar erişebilir
// authMiddleware ile kimlik doğrulama yapılır
// URL parametresinden silinecek içerik ID'si alınır
// OrderItemIngredientService.deleteIngredient() ile veritabanından içerik silinir
// Başarılı durumda sadece başarı mesajı döndürülür
orderItemIngredientRoutes.delete("/order-item-ingredients/:id", authMiddleware, async (c) => {
  const { id } = c.req.param();
  await OrderItemIngredientService.deleteIngredient(id);
  return c.json({ message: "Order item ingredient deleted successfully" });
});

export default orderItemIngredientRoutes;
