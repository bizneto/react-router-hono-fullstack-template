import { Hono } from "hono";
import { cors } from "hono/cors";
import { createRequestHandler } from "react-router";

// Types for Todo items
type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

// In-memory storage (in production, use D1, KV, or Durable Objects)
let todos: Todo[] = [
  {
    id: "1",
    title: "Welcome to your Todo App",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Built with React Router + Hono + Cloudflare Workers",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Try adding a new task",
    completed: true,
    createdAt: new Date().toISOString(),
  },
];

const app = new Hono();

// Enable CORS for API routes
app.use("/api/*", cors());

// API Routes
app.get("/api/todos", (c) => {
  return c.json({ todos });
});

app.post("/api/todos", async (c) => {
  const body = await c.req.json<{ title: string }>();

  if (!body.title || body.title.trim() === "") {
    return c.json({ error: "Title is required" }, 400);
  }

  const newTodo: Todo = {
    id: crypto.randomUUID(),
    title: body.title,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.push(newTodo);
  return c.json({ todo: newTodo }, 201);
});

app.patch("/api/todos/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ completed?: boolean; title?: string }>();

  const todoIndex = todos.findIndex((t) => t.id === id);

  if (todoIndex === -1) {
    return c.json({ error: "Todo not found" }, 404);
  }

  if (body.completed !== undefined) {
    todos[todoIndex].completed = body.completed;
  }

  if (body.title !== undefined) {
    todos[todoIndex].title = body.title;
  }

  return c.json({ todo: todos[todoIndex] });
});

app.delete("/api/todos/:id", (c) => {
  const id = c.req.param("id");
  const todoIndex = todos.findIndex((t) => t.id === id);

  if (todoIndex === -1) {
    return c.json({ error: "Todo not found" }, 404);
  }

  todos.splice(todoIndex, 1);
  return c.json({ success: true });
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
