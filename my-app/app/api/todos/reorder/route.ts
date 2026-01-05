import { NextResponse } from 'next/server';
import { getTodos, saveTodos } from '@/lib/storage';

export async function PUT(request: Request) {
  const { orderedIds }: { orderedIds: string[] } = await request.json();
  const todos = await getTodos();
  
  const todoMap = new Map(todos.map(t => [t.id, t]));
  const reorderedTodos = orderedIds
    .map((id, index) => {
      const todo = todoMap.get(id);
      if (todo) {
        todoMap.delete(id);
        return { ...todo, order: index };
      }
      return null;
    })
    .filter(Boolean);

  // Add any remaining todos that weren't in orderedIds
  const remainingTodos = Array.from(todoMap.values()).map((todo, index) => ({
    ...todo,
    order: reorderedTodos.length + index,
  }));

  await saveTodos([...reorderedTodos, ...remainingTodos] as typeof todos);
  return NextResponse.json({ success: true });
}
