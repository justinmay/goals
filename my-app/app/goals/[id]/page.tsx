'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Goal, Entry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Pencil, Trash2, Target } from 'lucide-react';
import { NumericChart } from '@/components/numeric-chart';
import { AdherenceChart } from '@/components/adherence-chart';
import { FrequencyChart } from '@/components/frequency-chart';
import { DurationChart } from '@/components/duration-chart';
import { AddEntryDialog } from '@/components/add-entry-dialog';
import { MilestoneDialog } from '@/components/milestone-dialog';
import { EditGoalDialog } from '@/components/edit-goal-dialog';
import { format, parseISO } from 'date-fns';

export default function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [addEntryOpen, setAddEntryOpen] = useState(false);
  const [milestoneOpen, setMilestoneOpen] = useState(false);
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [adherenceStats, setAdherenceStats] = useState<{ streak: number; completionRate: number }>({ streak: 0, completionRate: 0 });

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  const loadData = async () => {
    try {
      const [goalRes, entriesRes] = await Promise.all([
        fetch(`/api/goals/${resolvedParams.id}`),
        fetch(`/api/entries?goalId=${resolvedParams.id}`),
      ]);

      if (!goalRes.ok) {
        router.push('/');
        return;
      }

      const goalData = await goalRes.json();
      const entriesData = await entriesRes.json();

      setGoal(goalData);
      setEntries(entriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async (entry: Entry) => {
    try {
      if (editingEntry) {
        await fetch(`/api/entries/${entry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
      } else {
        await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
      }
      await loadData();
      setEditingEntry(undefined);
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await fetch(`/api/entries/${entryId}`, {
        method: 'DELETE',
      });
      await loadData();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setSelectedDate(undefined);
    setAddEntryOpen(true);
  };

  const handleDayClick = (date: Date, entry?: Entry) => {
    if (entry) {
      setEditingEntry(entry);
      setSelectedDate(undefined);
    } else {
      setEditingEntry(undefined);
      setSelectedDate(format(date, 'yyyy-MM-dd'));
    }
    setAddEntryOpen(true);
  };

  const handleDeleteGoal = async () => {
    if (!confirm('Are you sure you want to delete this goal? All entries will remain but this goal will be removed.')) return;

    try {
      await fetch(`/api/goals/${resolvedParams.id}`, {
        method: 'DELETE',
      });
      router.push('/');
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleSaveMilestones = async (updatedGoal: Goal) => {
    try {
      await fetch(`/api/goals/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGoal),
      });
      await loadData();
    } catch (error) {
      console.error('Error saving milestones:', error);
    }
  };

  const handleSaveGoal = async (updatedGoal: Goal) => {
    try {
      await fetch(`/api/goals/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGoal),
      });
      await loadData();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!goal) {
    return null;
  }

  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/')} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{goal.name}</h1>
              {goal.description && (
                <p className="text-muted-foreground text-sm">{goal.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditGoalOpen(true)} size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Goal
            </Button>
            <Button variant="outline" onClick={() => setMilestoneOpen(true)} size="sm">
              <Target className="h-4 w-4 mr-2" />
              Milestones
            </Button>
            <Button variant="destructive" onClick={handleDeleteGoal} size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6">
          <Card className="col-span-3">
            <CardContent className="pt-6">
              {goal.type === 'numeric' && <NumericChart goal={goal} entries={entries} />}
              {goal.type === 'adherence' && <AdherenceChart goal={goal} entries={entries} onDayClick={handleDayClick} onStatsCalculated={setAdherenceStats} />}
              {goal.type === 'frequency' && <FrequencyChart goal={goal} entries={entries} />}
              {goal.type === 'duration' && <DurationChart goal={goal} entries={entries} />}
            </CardContent>
          </Card>

          <div className="space-y-4 col-span-2">
            {goal.type === 'adherence' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card p-3 rounded-lg border">
                  <p className="text-xs text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold">{adherenceStats.streak} days</p>
                </div>
                <div className="bg-card p-3 rounded-lg border">
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">{adherenceStats.completionRate}%</p>
                </div>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Entry History</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-280px)] overflow-y-auto">
                {sortedEntries.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8 text-sm">No entries yet</p>
                ) : (
                  <div className="space-y-2">
                    {sortedEntries.map(entry => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <p className="font-medium text-sm">{format(parseISO(entry.date), 'MMM d, yyyy')}</p>
                            <p className="text-sm">
                              {goal.type === 'adherence' 
                                ? (entry.value ? '✓ Completed' : '✗ Skipped')
                                : `${entry.value} ${
                                    goal.type === 'numeric' 
                                      ? (goal.config as { unit: string }).unit 
                                      : goal.type === 'duration' 
                                        ? (goal.config as { unit: string }).unit 
                                        : ''
                                  }`
                              }
                            </p>
                          </div>
                          {entry.note && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">{entry.note}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditEntry(entry)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteEntry(entry.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <AddEntryDialog
          open={addEntryOpen}
          onOpenChange={(open) => {
            setAddEntryOpen(open);
            if (!open) {
              setEditingEntry(undefined);
              setSelectedDate(undefined);
            }
          }}
          goal={goal}
          onSave={handleSaveEntry}
          existingEntry={editingEntry}
          initialDate={selectedDate}
        />

        <MilestoneDialog
          open={milestoneOpen}
          onOpenChange={setMilestoneOpen}
          goal={goal}
          onSave={handleSaveMilestones}
        />

        <EditGoalDialog
          open={editGoalOpen}
          onOpenChange={setEditGoalOpen}
          goal={goal}
          onSave={handleSaveGoal}
        />
      </div>
    </div>
  );
}
