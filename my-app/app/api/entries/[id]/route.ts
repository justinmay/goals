import { NextRequest, NextResponse } from 'next/server';
import { getEntries, saveEntries } from '@/lib/storage';
import { Entry } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entries = await getEntries();
    const entry = entries.find(e => e.id === id);
    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error getting entry:', error);
    return NextResponse.json({ error: 'Failed to get entry' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updatedEntry: Entry = await request.json();
    const entries = await getEntries();
    const index = entries.findIndex(e => e.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    entries[index] = updatedEntry;
    await saveEntries(entries);
    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entries = await getEntries();
    const filtered = entries.filter(e => e.id !== id);
    if (filtered.length === entries.length) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    await saveEntries(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
