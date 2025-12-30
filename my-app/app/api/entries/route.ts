import { NextRequest, NextResponse } from 'next/server';
import { getEntries, saveEntries } from '@/lib/storage';
import { Entry } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const goalId = searchParams.get('goalId');
    
    let entries = await getEntries();
    
    if (goalId) {
      entries = entries.filter(e => e.goalId === goalId);
    }
    
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error getting entries:', error);
    return NextResponse.json({ error: 'Failed to get entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const entry: Entry = await request.json();
    const entries = await getEntries();
    entries.push(entry);
    await saveEntries(entries);
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}
