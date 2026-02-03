import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { api } from "@/lib/api";
import type { Tag, Todo } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TodoItem } from "@/components/todo-item";

export function TodosRoute() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [todosData, tagsData] = await Promise.all([api.listTodos(), api.listTags()]);
      setTodos(todosData);
      setTags(tagsData);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    await api.updateTodo({ ...todo, completed: !todo.completed });
    await loadData();
  };

  const handleUpdateTodo = async (todo: Todo) => {
    await api.updateTodo(todo);
    await loadData();
  };

  const handleDeleteTodo = async (id: string) => {
    await api.deleteTodo(id);
    await loadData();
  };

  const today = format(new Date(), "yyyy-MM-dd");

  const datesWithTodos = useMemo(() => [...new Set(todos.map((t) => t.date))].sort((a, b) => b.localeCompare(a)), [todos]);

  const getTodosForDate = (dateStr: string) =>
    todos.filter((t) => t.date === dateStr).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent, dateStr: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const dayTodos = getTodosForDate(dateStr);
    const oldIndex = dayTodos.findIndex((t) => t.id === active.id);
    const newIndex = dayTodos.findIndex((t) => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...dayTodos];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const newTodos = todos.map((t) => {
      if (t.date !== dateStr) return t;
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

  const handleAddToToday = async (todo: Todo) => {
    const todayDate = format(new Date(), "yyyy-MM-dd");
    const newTodo: Todo = {
      ...todo,
      id: crypto.randomUUID(),
      date: todayDate,
      completed: false,
      order: getTodosForDate(todayDate).length,
      createdAt: new Date().toISOString(),
    };
    await api.createTodo(newTodo);
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
          <h1 className="text-4xl font-bold tracking-tight">Todos</h1>
          <p className="text-muted-foreground mt-2">Manage your daily tasks</p>
        </div>

        <div className="space-y-6">
          {datesWithTodos.length === 0 ? (
            <p className="text-muted-foreground">No todos yet. Add some from the Home page!</p>
          ) : (
            datesWithTodos.map((dateStr) => {
              const dayTodos = getTodosForDate(dateStr);
              const isToday = dateStr === today;

              return (
                <Card key={dateStr} className={isToday ? "border-primary" : ""}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      {format(parseISO(dateStr), "EEEE, MMMM d")}
                      {isToday && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          Today
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEnd(event, dateStr)}
                    >
                      <SortableContext items={dayTodos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {dayTodos.map((todo) => (
                            <TodoItem
                              key={todo.id}
                              todo={todo}
                              tags={tags}
                              onToggle={handleToggleTodo}
                              onUpdate={handleUpdateTodo}
                              onDelete={handleDeleteTodo}
                              onCreateTag={handleCreateTag}
                              isDraggable
                              onAddToToday={!isToday ? handleAddToToday : undefined}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
