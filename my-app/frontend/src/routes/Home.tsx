import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { api } from "@/lib/api";
import type { Entry, Goal, Tag, Todo } from "@/lib/types";
import { HomeGoalCard } from "@/components/home-goal-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TodoItem } from "@/components/todo-item";
import { Plus } from "lucide-react";

export function HomeRoute() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [goalsData, entriesData, todosData, tagsData] = await Promise.all([
        api.listGoals(),
        api.listEntries(),
        api.listTodos(),
        api.listTags(),
      ]);
      setGoals(goalsData);
      setEntries(entriesData);
      setTodos(todosData);
      setTags(tagsData);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async (entry: Entry) => {
    const existingEntry = entries.find((e) => e.id === entry.id);
    if (existingEntry) {
      await api.updateEntry(entry);
    } else {
      await api.createEntry(entry);
    }
    await loadData();
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

    await api.createTodo(todo);
    setNewTodoText("");
    await loadData();
  };

  const handleToggleTodo = async (todo: Todo) => {
    await api.updateTodo({ ...todo, completed: !todo.completed });
    await loadData();
  };

  const handleUpdateTodo = async (todo: Todo) => {
    await api.updateTodo(todo);
    await loadData();
  };

  const handleCreateTag = async (tag: Tag): Promise<Tag | null> => {
    try {
      const created = await api.createTag(tag);
      setTags((prev) => [...prev, created]);
      return created;
    } catch (error) {
      console.error("Error creating tag", error);
      return null;
    }
  };

  const todaysTodos = useMemo(
    () =>
      todos
        .filter((t) => t.date === today)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [todos, today]
  );

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

    const reordered = [...todaysTodos];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const newTodos = todos.map((t) => {
      if (t.date !== today) return t;
      const idx = reordered.findIndex((rt) => rt.id === t.id);
      return { ...t, order: idx };
    });
    setTodos(newTodos);

    try {
      await api.reorderTodos(reordered.map((t) => t.id));
    } catch (error) {
      console.error("Error reordering todos", error);
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
                <p className="text-muted-foreground text-sm">No todos for today</p>
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
              <Button variant="ghost" size="sm" onClick={() => navigate("/goals")}>View all</Button>
            </div>
            {goals.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-muted-foreground text-sm text-center">No goals yet</p>
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
