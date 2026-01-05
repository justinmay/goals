import { NextResponse } from 'next/server';
import { getTodos, saveTodos } from '@/lib/storage';
import { Todo } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updatedTodo: Todo = await request.json();
  const todos = await getTodos();
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }
  todos[index] = updatedTodo;
  await saveTodos(todos);
  return NextResponse.json(updatedTodo);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const todos = await getTodos();
  const filteredTodos = todos.filter((t) => t.id !== id);
  await saveTodos(filteredTodos);
  return NextResponse.json({ success: true });
}
