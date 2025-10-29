import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
};

type TodoAppProps = {
  initialTodos: Todo[];
};

export function TodoApp({ initialTodos }: TodoAppProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTodoTitle }),
      });

      if (response.ok) {
        const data = await response.json();
        setTodos([...todos, data.todo]);
        setNewTodoTitle("");
      }
    } catch (error) {
      console.error("Failed to add todo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });

      if (response.ok) {
        const data = await response.json();
        setTodos(todos.map((todo) => (todo.id === id ? data.todo : todo)));
      }
    } catch (error) {
      console.error("Failed to toggle todo:", error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTodos(todos.filter((todo) => todo.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = todos.length - completedCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50">
            Task Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Built with React Router + Hono + Cloudflare Workers
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Tasks</CardDescription>
              <CardTitle className="text-3xl">{activeCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl">{completedCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Add Todo Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Task</CardTitle>
            <CardDescription>Create a new task to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addTodo} className="flex gap-2">
              <Input
                type="text"
                placeholder="What needs to be done?"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !newTodoTitle.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Todo List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Tasks</CardTitle>
            <CardDescription>
              {todos.length === 0
                ? "No tasks yet. Add one above!"
                : `${todos.length} ${todos.length === 1 ? "task" : "tasks"} total`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todos.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Circle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Your task list is empty</p>
                </div>
              ) : (
                todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
                  >
                    <Checkbox
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id, todo.completed)}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          todo.completed
                            ? "line-through text-gray-500 dark:text-gray-400"
                            : "text-gray-900 dark:text-gray-50"
                        }`}
                      >
                        {todo.title}
                      </p>
                    </div>
                    {todo.completed && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Done
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
