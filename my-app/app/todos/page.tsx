'use client';

import { useEffect, useState } from 'react';
import { Todo, Tag } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TodoItem } from '@/components/todo-item';
import { format, parseISO } from 'date-fns';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [todosRes, tagsRes] = await Promise.all([
        fetch('/api/todos'),
        fetch('/api/tags'),
      ]);
      const todosData = await todosRes.json();
      const tagsData = await tagsRes.json();
      setTodos(todosData);
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    try {
      await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...todo, completed: !todo.completed }),
      });
      await loadData();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleUpdateTodo = async (todo: Todo) => {
    try {
      await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo),
      });
      await loadData();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Get unique dates that have todos, sorted descending (newest first)
  const datesWithTodos = [...new Set(todos.map(t => t.date))].sort((a, b) => b.localeCompare(a));

  const getTodosForDate = (dateStr: string) => {
    return todos
      .filter(t => t.date === dateStr)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  const isToday = (dateStr: string) => dateStr === today;

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
    const oldIndex = dayTodos.findIndex(t => t.id === active.id);
    const newIndex = dayTodos.findIndex(t => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedDayTodos = [...dayTodos];
    const [movedTodo] = reorderedDayTodos.splice(oldIndex, 1);
    reorderedDayTodos.splice(newIndex, 0, movedTodo);

    // Optimistic update
    const newTodos = todos.map(t => {
      if (t.date !== dateStr) return t;
      const idx = reorderedDayTodos.findIndex(rt => rt.id === t.id);
      return { ...t, order: idx };
    });
    setTodos(newTodos);

    // Persist to server
    try {
      await fetch('/api/todos/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: reorderedDayTodos.map(t => t.id) }),
      });
    } catch (error) {
      console.error('Error reordering todos:', error);
      await loadData();
    }
  };

  const handleAddToToday = async (todo: Todo) => {
    try {
      const todayDate = format(new Date(), 'yyyy-MM-dd');
      const newTodo = {
        ...todo,
        id: crypto.randomUUID(),
        date: todayDate,
        completed: false,
        order: getTodosForDate(todayDate).length,
      };
      await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo),
      });
      await loadData();
    } catch (error) {
      console.error('Error adding todo to today:', error);
    }
  };

  const handleCreateTag = async (tag: Tag): Promise<Tag | null> => {
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tag),
      });
      if (res.ok) {
        const created = await res.json();
        setTags(prev => [...prev, created]);
        return created;
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    }
    return null;
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
            datesWithTodos.map(dateStr => {
              const dayTodos = getTodosForDate(dateStr);
              
              return (
                <Card key={dateStr} className={isToday(dateStr) ? 'border-primary' : ''}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      {format(parseISO(dateStr), 'EEEE, MMMM d')}
                      {isToday(dateStr) && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Today</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEnd(event, dateStr)}
                    >
                      <SortableContext
                        items={dayTodos.map(t => t.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {dayTodos.map(todo => (
                            <TodoItem
                              key={todo.id}
                              todo={todo}
                              tags={tags}
                              onToggle={handleToggleTodo}
                              onUpdate={handleUpdateTodo}
                              onDelete={handleDeleteTodo}
                              onCreateTag={handleCreateTag}
                              isDraggable
                              onAddToToday={!isToday(dateStr) ? handleAddToToday : undefined}
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
