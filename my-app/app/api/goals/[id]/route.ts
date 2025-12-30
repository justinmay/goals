import { NextRequest, NextResponse } from 'next/server';
import { getGoals, saveGoals } from '@/lib/storage';
import { Goal } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const goals = await getGoals();
    const goal = goals.find(g => g.id === id);
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }
    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error getting goal:', error);
    return NextResponse.json({ error: 'Failed to get goal' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updatedGoal: Goal = await request.json();
    const goals = await getGoals();
    const index = goals.findIndex(g => g.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }
    goals[index] = updatedGoal;
    await saveGoals(goals);
    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const goals = await getGoals();
    const filtered = goals.filter(g => g.id !== id);
    if (filtered.length === goals.length) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }
    await saveGoals(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
