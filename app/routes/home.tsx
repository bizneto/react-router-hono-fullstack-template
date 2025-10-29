import type { Route } from "./+types/home";
import { TodoApp } from "@/components/todo-app";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Task Manager - React Router + Hono" },
    { name: "description", content: "A modern task manager built with React Router, Hono, and Cloudflare Workers" },
  ];
}

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

export async function loader({ request }: Route.LoaderArgs) {
  // Fetch todos from our API
  const url = new URL(request.url);
  const apiUrl = `${url.protocol}//${url.host}/api/todos`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json() as { todos: Todo[] };
    return { todos: data.todos };
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    return { todos: [] };
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <TodoApp initialTodos={loaderData.todos} />;
}
