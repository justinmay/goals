'use client';

import { useEffect, useState } from 'react';
import { Goal, Entry } from '@/lib/types';
import { GoalCard } from '@/components/goal-card';
import { AddGoalDialog } from '@/components/add-goal-dialog';
import { AddEntryDialog } from '@/components/add-entry-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [addEntryOpen, setAddEntryOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [goalsRes, entriesRes] = await Promise.all([
        fetch('/api/goals'),
        fetch('/api/entries'),
      ]);
      
      const goalsData = await goalsRes.json();
      const entriesData = await entriesRes.json();
      
      setGoals(goalsData);
      setEntries(entriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async (goal: Goal) => {
    try {
      await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      });
      await loadData();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const handleSaveEntry = async (entry: Entry) => {
    try {
      await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      await loadData();
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const handleAddEntry = (goalId: string) => {
    setSelectedGoalId(goalId);
    setAddEntryOpen(true);
  };

  const handleGoalClick = (goalId: string) => {
    router.push(`/goals/${goalId}`);
  };

  const selectedGoal = selectedGoalId ? goals.find(g => g.id === selectedGoalId) : null;

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Goal Tracker</h1>
            <p className="text-muted-foreground mt-2">Track your progress, achieve your goals</p>
          </div>
          <Button onClick={() => setAddGoalOpen(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            New Goal
          </Button>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              No goals yet. Create your first goal to get started!
            </p>
            <Button onClick={() => setAddGoalOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Create Goal
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                entries={entries}
                onAddEntry={handleAddEntry}
                onClick={handleGoalClick}
              />
            ))}
          </div>
        )}

        <AddGoalDialog
          open={addGoalOpen}
          onOpenChange={setAddGoalOpen}
          onSave={handleSaveGoal}
        />

        <AddEntryDialog
          open={addEntryOpen}
          onOpenChange={setAddEntryOpen}
          goal={selectedGoal || null}
          onSave={handleSaveEntry}
        />
      </div>
    </div>
  );
}
