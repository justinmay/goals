import { NextResponse } from 'next/server';
import { getTodos, saveTodos } from '@/lib/storage';
import { Todo } from '@/lib/types';

export async function GET() {
  const todos = await getTodos();
  return NextResponse.json(todos);
}

export async function POST(request: Request) {
  const todo: Todo = await request.json();
  const todos = await getTodos();
  todos.push(todo);
  await saveTodos(todos);
  return NextResponse.json(todo);
}
