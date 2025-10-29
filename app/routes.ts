import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/products.tsx"),
  route("products/:id", "routes/products.$id.tsx"),
] satisfies RouteConfig;
