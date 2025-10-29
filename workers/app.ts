import { Hono } from "hono";
import { cors } from "hono/cors";
import { createRequestHandler } from "react-router";

// Types
type Env = {
  DB: D1Database;
  ADMIN_API_KEY: string;
  VALUE_FROM_CLOUDFLARE: string;
};

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for API routes
app.use("/api/*", cors());

// Middleware to check admin authentication
const adminAuth = async (c: any, next: any) => {
  const apiKey = c.req.header("X-API-Key");

  if (!apiKey || apiKey !== c.env.ADMIN_API_KEY) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
};

// ============================================
// PUBLIC API ENDPOINTS
// ============================================

// Get all products (with optional filters)
app.get("/api/products", async (c) => {
  const category = c.req.query("category");
  const inStock = c.req.query("inStock");

  let query = "SELECT * FROM products WHERE 1=1";
  const params: any[] = [];

  if (category && category !== "all") {
    query += " AND category = ?";
    params.push(category);
  }

  if (inStock === "true") {
    query += " AND in_stock = 1";
  }

  query += " ORDER BY capacity ASC";

  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  // Transform database format to API format
  const products = results.map((row: any) => ({
    id: row.id,
    name: row.name,
    capacity: row.capacity,
    price: row.price,
    description: row.description,
    specs: {
      material: row.material,
      pumpType: row.pump_type,
      chassis: row.chassis,
      weight: row.weight,
    },
    category: row.category,
    image: row.image,
    inStock: row.in_stock === 1,
  }));

  return c.json({ products });
});

// Get single product
app.get("/api/products/:id", async (c) => {
  const id = c.req.param("id");

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM products WHERE id = ?"
  ).bind(id).all();

  if (results.length === 0) {
    return c.json({ error: "Product not found" }, 404);
  }

  const row = results[0] as any;
  const product = {
    id: row.id,
    name: row.name,
    capacity: row.capacity,
    price: row.price,
    description: row.description,
    specs: {
      material: row.material,
      pumpType: row.pump_type,
      chassis: row.chassis,
      weight: row.weight,
    },
    category: row.category,
    image: row.image,
    inStock: row.in_stock === 1,
  };

  return c.json({ product });
});

// Submit inquiry
app.post("/api/inquiry", async (c) => {
  const body = await c.req.json<{
    name: string;
    email: string;
    phone?: string;
    productId: string;
    message?: string;
  }>();

  // Validate required fields
  if (!body.name || !body.email || !body.productId) {
    return c.json({ error: "Name, email, and product are required" }, 400);
  }

  // Get product name
  const { results } = await c.env.DB.prepare(
    "SELECT name FROM products WHERE id = ?"
  ).bind(body.productId).all();

  if (results.length === 0) {
    return c.json({ error: "Product not found" }, 404);
  }

  const productName = (results[0] as any).name;

  // Save inquiry to database
  const inquiryId = crypto.randomUUID();

  await c.env.DB.prepare(
    `INSERT INTO inquiries (id, product_id, product_name, name, email, phone, message, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'new')`
  ).bind(
    inquiryId,
    body.productId,
    productName,
    body.name,
    body.email,
    body.phone || null,
    body.message || null
  ).run();

  return c.json({
    success: true,
    message: "Dziękujemy za zapytanie! Skontaktujemy się w ciągu 24h.",
  });
});

// ============================================
// ADMIN API ENDPOINTS (Protected)
// ============================================

// Get all inquiries (admin only)
app.get("/api/admin/inquiries", adminAuth, async (c) => {
  const status = c.req.query("status");

  let query = "SELECT * FROM inquiries";
  const params: any[] = [];

  if (status && status !== "all") {
    query += " WHERE status = ?";
    params.push(status);
  }

  query += " ORDER BY created_at DESC";

  const { results } = await c.env.DB.prepare(query).bind(...params).all();

  return c.json({ inquiries: results });
});

// Update inquiry status (admin only)
app.patch("/api/admin/inquiries/:id", adminAuth, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ status: string }>();

  if (!["new", "in_progress", "completed", "archived"].includes(body.status)) {
    return c.json({ error: "Invalid status" }, 400);
  }

  await c.env.DB.prepare(
    "UPDATE inquiries SET status = ? WHERE id = ?"
  ).bind(body.status, id).run();

  return c.json({ success: true });
});

// Create product (admin only)
app.post("/api/admin/products", adminAuth, async (c) => {
  const body = await c.req.json<{
    name: string;
    capacity: number;
    price: number;
    description: string;
    material: string;
    pumpType: string;
    chassis: string;
    weight: number;
    category: string;
    inStock: boolean;
  }>();

  const id = crypto.randomUUID();

  await c.env.DB.prepare(
    `INSERT INTO products (id, name, capacity, price, description, material, pump_type, chassis, weight, category, image, in_stock)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    body.name,
    body.capacity,
    body.price,
    body.description,
    body.material,
    body.pumpType,
    body.chassis,
    body.weight,
    body.category,
    "/images/tanker-placeholder.jpg",
    body.inStock ? 1 : 0
  ).run();

  return c.json({ success: true, id });
});

// Update product (admin only)
app.patch("/api/admin/products/:id", adminAuth, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<Partial<{
    name: string;
    capacity: number;
    price: number;
    description: string;
    material: string;
    pumpType: string;
    chassis: string;
    weight: number;
    category: string;
    inStock: boolean;
  }>>();

  const updates: string[] = [];
  const params: any[] = [];

  if (body.name !== undefined) { updates.push("name = ?"); params.push(body.name); }
  if (body.capacity !== undefined) { updates.push("capacity = ?"); params.push(body.capacity); }
  if (body.price !== undefined) { updates.push("price = ?"); params.push(body.price); }
  if (body.description !== undefined) { updates.push("description = ?"); params.push(body.description); }
  if (body.material !== undefined) { updates.push("material = ?"); params.push(body.material); }
  if (body.pumpType !== undefined) { updates.push("pump_type = ?"); params.push(body.pumpType); }
  if (body.chassis !== undefined) { updates.push("chassis = ?"); params.push(body.chassis); }
  if (body.weight !== undefined) { updates.push("weight = ?"); params.push(body.weight); }
  if (body.category !== undefined) { updates.push("category = ?"); params.push(body.category); }
  if (body.inStock !== undefined) { updates.push("in_stock = ?"); params.push(body.inStock ? 1 : 0); }

  if (updates.length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  updates.push("updated_at = datetime('now')");
  params.push(id);

  await c.env.DB.prepare(
    `UPDATE products SET ${updates.join(", ")} WHERE id = ?`
  ).bind(...params).run();

  return c.json({ success: true });
});

// Delete product (admin only)
app.delete("/api/admin/products/:id", adminAuth, async (c) => {
  const id = c.req.param("id");

  await c.env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();

  return c.json({ success: true });
});

// Get dashboard stats (admin only)
app.get("/api/admin/stats", adminAuth, async (c) => {
  const [productsCount, inquiriesCount, newInquiries] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) as count FROM products").first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM inquiries").first(),
    c.env.DB.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'").first(),
  ]);

  return c.json({
    stats: {
      products: (productsCount as any)?.count || 0,
      inquiries: (inquiriesCount as any)?.count || 0,
      newInquiries: (newInquiries as any)?.count || 0,
    },
  });
});

// ============================================
// React Router handler for all other routes
// ============================================
app.get("*", (c) => {
  const requestHandler = createRequestHandler(
    () => import("virtual:react-router/server-build"),
    import.meta.env.MODE,
  );

  return requestHandler(c.req.raw, {
    cloudflare: { env: c.env, ctx: c.executionCtx },
  });
});

export default app;
