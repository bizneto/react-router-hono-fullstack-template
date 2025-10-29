import { Hono } from "hono";
import { cors } from "hono/cors";
import { createRequestHandler } from "react-router";

// Types for Water Tanker Trucks (Beczkowozy)
type Product = {
  id: string;
  name: string;
  capacity: number; // in liters
  price: number; // in PLN
  description: string;
  specs: {
    material: string;
    pumpType: string;
    chassis: string;
    weight: number;
  };
  category: "light" | "medium" | "heavy";
  image: string;
  inStock: boolean;
};

type CartItem = {
  productId: string;
  quantity: number;
};

// Sample products - Water Tanker Trucks
const products: Product[] = [
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
    category: "light",
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
    category: "medium",
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
    category: "heavy",
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
    category: "medium",
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
    category: "heavy",
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
    category: "light",
    inStock: false,
  },
];

const app = new Hono();

// Enable CORS for API routes
app.use("/api/*", cors());

// API Routes - Products
app.get("/api/products", (c) => {
  const category = c.req.query("category");
  const inStock = c.req.query("inStock");

  let filteredProducts = [...products];

  if (category && category !== "all") {
    filteredProducts = filteredProducts.filter((p) => p.category === category);
  }

  if (inStock === "true") {
    filteredProducts = filteredProducts.filter((p) => p.inStock);
  }

  return c.json({ products: filteredProducts });
});

app.get("/api/products/:id", (c) => {
  const id = c.req.param("id");
  const product = products.find((p) => p.id === id);

  if (!product) {
    return c.json({ error: "Product not found" }, 404);
  }

  return c.json({ product });
});

// Contact/Inquiry endpoint
app.post("/api/inquiry", async (c) => {
  const body = await c.req.json<{
    name: string;
    email: string;
    phone: string;
    productId: string;
    message: string;
  }>();

  // Validate required fields
  if (!body.name || !body.email || !body.productId) {
    return c.json({ error: "Name, email, and product are required" }, 400);
  }

  // In production, send email or save to database
  console.log("New inquiry:", body);

  return c.json({
    success: true,
    message: "Dziękujemy za zapytanie! Skontaktujemy się w ciągu 24h.",
  });
});

// React Router handler for all other routes
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
