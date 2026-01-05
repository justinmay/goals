import { NextResponse } from 'next/server';
import { getTags, saveTags } from '@/lib/storage';
import { Tag } from '@/lib/types';

export async function GET() {
  const tags = await getTags();
  return NextResponse.json(tags);
}

export async function POST(request: Request) {
  const tag: Tag = await request.json();
  const tags = await getTags();
  
  // Check for duplicate (case-insensitive)
  const exists = tags.some(t => t.name.toLowerCase() === tag.name.toLowerCase());
  if (exists) {
    return NextResponse.json({ error: 'Tag already exists' }, { status: 400 });
  }
  
  // Store name in lowercase
  tag.name = tag.name.toLowerCase();
  tags.push(tag);
  await saveTags(tags);
  return NextResponse.json(tag);
}
