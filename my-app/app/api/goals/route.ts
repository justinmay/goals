import { NextRequest, NextResponse } from 'next/server';
import { getGoals, saveGoals } from '@/lib/storage';
import { Goal } from '@/lib/types';

export async function GET() {
  try {
    const goals = await getGoals();
    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error getting goals:', error);
    return NextResponse.json({ error: 'Failed to get goals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const goal: Goal = await request.json();
    const goals = await getGoals();
    goals.push(goal);
    await saveGoals(goals);
    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}
