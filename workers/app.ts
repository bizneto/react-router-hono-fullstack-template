import { Hono } from "hono";
import { cors } from "hono/cors";
import { createRequestHandler } from "react-router";

// Types
type Env = {
  DB?: D1Database; // Optional - może nie istnieć
  ADMIN_API_KEY?: string;
  VALUE_FROM_CLOUDFLARE: string;
};

// Fallback data - używane gdy baza nie istnieje
const FALLBACK_PRODUCTS = [
  {
    id: "1",
    name: "AquaTrans 3000",
    capacity: 3000,
    price: 125000,
    description: "Kompaktowy beczkowóz idealny do małych i średnich gospodarstw. Solidna konstrukcja, łatwy w obsłudze.",
    specs: {
      material: "Stal nierdzewna",
      pumpType: "Pompa wirowa 300 l/min",
      chassis: "Mercedes Sprinter",
      weight: 2500,
    },
    category: "light" as const,
    image: "/images/tanker-light.jpg",
    inStock: true,
  },
  {
    id: "2",
    name: "AquaTrans 5000 Pro",
    capacity: 5000,
    price: 185000,
    description: "Średni beczkowóz z profesjonalnym wyposażeniem. Idealny do zaopatrzenia budów i większych gospodarstw.",
    specs: {
      material: "Stal nierdzewna",
      pumpType: "Pompa wirowa 450 l/min",
      chassis: "MAN TGL",
      weight: 4200,
    },
    category: "medium" as const,
    image: "/images/tanker-medium.jpg",
    inStock: true,
  },
  {
    id: "3",
    name: "AquaTrans 8000 Heavy",
    capacity: 8000,
    price: 285000,
    description: "Ciężki beczkowóz przemysłowy. Największa wydajność dla wymagających projektów.",
    specs: {
      material: "Stal nierdzewna wzmocniona",
      pumpType: "Pompa wirowa 600 l/min",
      chassis: "Scania P280",
      weight: 6800,
    },
    category: "heavy" as const,
    image: "/images/tanker-heavy.jpg",
    inStock: true,
  },
  {
    id: "4",
    name: "AquaTrans 6000 EcoLine",
    capacity: 6000,
    price: 215000,
    description: "Ekonomiczny model z doskonałym stosunkiem ceny do jakości. Niezawodny i oszczędny.",
    specs: {
      material: "Stal nierdzewna",
      pumpType: "Pompa wirowa 400 l/min",
      chassis: "Iveco Eurocargo",
      weight: 5000,
    },
    category: "medium" as const,
    image: "/images/tanker-medium.jpg",
    inStock: true,
  },
  {
    id: "5",
    name: "AquaTrans 10000 Industrial",
    capacity: 10000,
    price: 385000,
    description: "Największy model w ofercie. Dla profesjonalistów i dużych przedsiębiorstw. Maksymalna pojemność i wydajność.",
    specs: {
      material: "Stal nierdzewna premium",
      pumpType: "Pompa wirowa 800 l/min",
      chassis: "Volvo FH16",
      weight: 8500,
    },
    category: "heavy" as const,
    image: "/images/tanker-heavy.jpg",
    inStock: true,
  },
  {
    id: "6",
    name: "AquaTrans 4000 Compact",
    capacity: 4000,
    price: 155000,
    description: "Kompaktowy wymiary przy dużej pojemności. Świetny do pracy w trudno dostępnych miejscach.",
    specs: {
      material: "Stal nierdzewna",
      pumpType: "Pompa wirowa 350 l/min",
      chassis: "Fiat Ducato",
      weight: 3200,
    },
    category: "light" as const,
    image: "/images/tanker-light.jpg",
    inStock: false,
  },
];

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for API routes
app.use("/api/*", cors());

// Middleware to check admin authentication
const adminAuth = async (c: any, next: any) => {
  const apiKey = c.req.header("X-API-Key");

  if (!apiKey || !c.env.ADMIN_API_KEY || apiKey !== c.env.ADMIN_API_KEY) {
    return c.json({ error: "Unauthorized - Admin API requires database setup" }, 401);
  }

  await next();
};

// Helper to check if DB is available
const hasDatabase = (c: any): boolean => {
  return !!c.env.DB;
};

// ============================================
// PUBLIC API ENDPOINTS
// ============================================

// Get all products (with optional filters)
app.get("/api/products", async (c) => {
  const category = c.req.query("category");
  const inStock = c.req.query("inStock");

  // Use database if available, otherwise fallback to static data
  if (!hasDatabase(c)) {
    // FALLBACK: Use static data
    let filteredProducts = [...FALLBACK_PRODUCTS];

    if (category && category !== "all") {
      filteredProducts = filteredProducts.filter((p) => p.category === category);
    }

    if (inStock === "true") {
      filteredProducts = filteredProducts.filter((p) => p.inStock);
    }

    return c.json({ products: filteredProducts });
  }

  // DATABASE: Use D1
  try {
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
  } catch (error) {
    console.error("Database error, falling back to static data:", error);
    return c.json({ products: FALLBACK_PRODUCTS });
  }
});

// Get single product
app.get("/api/products/:id", async (c) => {
  const id = c.req.param("id");

  // FALLBACK: Use static data
  if (!hasDatabase(c)) {
    const product = FALLBACK_PRODUCTS.find((p) => p.id === id);

    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    return c.json({ product });
  }

  // DATABASE: Use D1
  try {
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
  } catch (error) {
    console.error("Database error, falling back to static data:", error);
    const product = FALLBACK_PRODUCTS.find((p) => p.id === id);

    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    return c.json({ product });
  }
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

  // FALLBACK: Without database, just log and return success
  if (!hasDatabase(c)) {
    console.log("New inquiry (no database):", body);
    return c.json({
      success: true,
      message: "Dziękujemy za zapytanie! Skontaktujemy się w ciągu 24h.",
    });
  }

  // DATABASE: Save to D1
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT name FROM products WHERE id = ?"
    ).bind(body.productId).all();

    if (results.length === 0) {
      return c.json({ error: "Product not found" }, 404);
    }

    const productName = (results[0] as any).name;
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
  } catch (error) {
    console.error("Database error saving inquiry:", error);
    return c.json({
      success: true,
      message: "Dziękujemy za zapytanie! Skontaktujemy się w ciągu 24h. (Inquiry logged)",
    });
  }
});

// ============================================
// ADMIN API ENDPOINTS (Protected)
// ============================================

// Get all inquiries (admin only)
app.get("/api/admin/inquiries", adminAuth, async (c) => {
  if (!hasDatabase(c)) {
    return c.json({ error: "Database not configured" }, 503);
  }

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
  if (!hasDatabase(c)) {
    return c.json({ error: "Database not configured" }, 503);
  }

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
  if (!hasDatabase(c)) {
    return c.json({ error: "Database not configured" }, 503);
  }

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
  if (!hasDatabase(c)) {
    return c.json({ error: "Database not configured" }, 503);
  }

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
  if (!hasDatabase(c)) {
    return c.json({ error: "Database not configured" }, 503);
  }

  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Get dashboard stats (admin only)
app.get("/api/admin/stats", adminAuth, async (c) => {
  if (!hasDatabase(c)) {
    return c.json({ error: "Database not configured" }, 503);
  }

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
