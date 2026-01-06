"use client";

import { useEffect, useState } from "react";
import { Goal, Entry, Todo, Tag } from "@/lib/types";
import { HomeGoalCard } from "@/components/home-goal-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TodoItem } from "@/components/todo-item";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export default function HomePage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [goalsRes, entriesRes, todosRes, tagsRes] = await Promise.all([
        fetch("/api/goals"),
        fetch("/api/entries"),
        fetch("/api/todos"),
        fetch("/api/tags"),
      ]);

      const goalsData = await goalsRes.json();
      const entriesData = await entriesRes.json();
      const todosData = await todosRes.json();
      const tagsData = await tagsRes.json();

      setGoals(goalsData);
      setEntries(entriesData);
      setTodos(todosData);
      setTags(tagsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async (entry: Entry) => {
    try {
      const existingEntry = entries.find((e) => e.id === entry.id);
      await fetch(existingEntry ? `/api/entries/${entry.id}` : "/api/entries", {
        method: existingEntry ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      await loadData();
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    const todo: Todo = {
      id: crypto.randomUUID(),
      date: today,
      text: newTodoText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo),
      });
      setNewTodoText("");
      await loadData();
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    try {
      await fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...todo, completed: !todo.completed }),
      });
      await loadData();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const handleUpdateTodo = async (todo: Todo) => {
    try {
      await fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo),
      });
      await loadData();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });
      await loadData();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleCreateTag = async (tag: Tag): Promise<Tag | null> => {
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tag),
      });
      if (res.ok) {
        const created = await res.json();
        setTags((prev) => [...prev, created]);
        return created;
      }
    } catch (error) {
      console.error("Error creating tag:", error);
    }
    return null;
  };

  const todaysTodos = todos
    .filter((t) => t.date === today)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todaysTodos.findIndex((t) => t.id === active.id);
    const newIndex = todaysTodos.findIndex((t) => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedTodos = [...todaysTodos];
    const [movedTodo] = reorderedTodos.splice(oldIndex, 1);
    reorderedTodos.splice(newIndex, 0, movedTodo);

    // Optimistic update
    const newTodos = todos.map((t) => {
      if (t.date !== today) return t;
      const idx = reorderedTodos.findIndex((rt) => rt.id === t.id);
      return { ...t, order: idx };
    });
    setTodos(newTodos);

    // Persist to server
    try {
      await fetch("/api/todos/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: reorderedTodos.map((t) => t.id) }),
      });
    } catch (error) {
      console.error("Error reordering todos:", error);
      await loadData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Today</h1>
          <p className="text-muted-foreground mt-2">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Todos</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleAddTodo} className="flex gap-2 mb-4 mx-6">
                <Input
                  placeholder="Add a todo..."
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                />
                <Button type="submit" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
              {todaysTodos.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No todos for today
                </p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={todaysTodos.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 mx-1">
                      {todaysTodos.map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          tags={tags}
                          onToggle={handleToggleTodo}
                          onUpdate={handleUpdateTodo}
                          onDelete={handleDeleteTodo}
                          onCreateTag={handleCreateTag}
                          isDraggable
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Goals</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/goals")}
              >
                View all
              </Button>
            </div>
            {goals.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-muted-foreground text-sm text-center">
                    No goals yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {goals.map((goal) => (
                  <HomeGoalCard
                    key={goal.id}
                    goal={goal}
                    entries={entries}
                    onSaveEntry={handleSaveEntry}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
