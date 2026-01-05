import { NextResponse } from 'next/server';
import { getTags, saveTags } from '@/lib/storage';
import { Tag } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updatedTag: Tag = await request.json();
  const tags = await getTags();
  const index = tags.findIndex((t) => t.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
  }
  updatedTag.name = updatedTag.name.toLowerCase();
  tags[index] = updatedTag;
  await saveTags(tags);
  return NextResponse.json(updatedTag);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tags = await getTags();
  const filteredTags = tags.filter((t) => t.id !== id);
  await saveTags(filteredTags);
  return NextResponse.json({ success: true });
}
