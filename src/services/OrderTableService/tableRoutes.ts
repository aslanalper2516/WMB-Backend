import { Hono } from "hono";
import { TableService } from "./tableService";
import { authMiddleware, roleMiddleware } from "../AuthService/authMiddleware";

const tableRoutes = new Hono();

// GET /tables?branch=branchId
tableRoutes.get("/", authMiddleware, async (c) => {
  const branchId = c.req.query("branch");
  const tables = await TableService.getTables(branchId);
  return c.json({ message: "Tables retrieved successfully", tables });
});

// POST /tables → manuel masa eklemek için
tableRoutes.post("/", authMiddleware, roleMiddleware("admin"), async (c) => {
  const body = await c.req.json();
  const table = await TableService.createTable(body);
  return c.json({ message: "Table created successfully", table });
});

// GET /tables/:id
tableRoutes.get("/:id", authMiddleware, async (c) => {
  const { id } = c.req.param();
  const table = await TableService.getTableById(id);
  return c.json({ message: "Table retrieved successfully", table });
});

// PUT /tables/:id → masa bilgilerini güncelle (isim vs.)
tableRoutes.put("/:id", authMiddleware, roleMiddleware("admin"), async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const table = await TableService.updateTable(id, body);
  return c.json({ message: "Table updated successfully", table });
});

// DELETE /tables/:id → soft delete
tableRoutes.delete("/:id", authMiddleware, roleMiddleware("admin"), async (c) => {
  const { id } = c.req.param();
  await TableService.deleteTable(id);
  return c.json({ message: "Table soft-deleted successfully" });
});

export default tableRoutes;
